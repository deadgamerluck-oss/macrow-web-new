import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import {
  APICallError,
  convertToModelMessages,
  generateId,
  isStepCount,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { buildAssistantInstructions } from "./assistant-prompt";
import { leadSchema } from "./lead-schema";
import { consumeServerRateLimit, getTrustedClientIp } from "../rate-limit.server";

const MAX_STORED_MESSAGES = 80;
const MAX_REQUEST_BYTES = 64 * 1024;

class RequestBodyTooLarge extends Error {}

async function readBoundedJson(request: Request, limit: number): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > limit) throw new RequestBodyTooLarge();
  if (!request.body) throw new Error("Missing request body");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new RequestBodyTooLarge();
    }
    chunks.push(value);
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(body));
}

const requestSchema = z.object({
  id: z.string().uuid(),
  path: z.string().max(200).regex(/^\//).catch("/"),
  message: z.object({
    id: z.string().min(1).max(100),
    role: z.literal("user"),
    parts: z
      .array(z.object({ type: z.literal("text"), text: z.string() }))
      .min(1)
      .max(5),
  }),
});

function json(status: number, error: string) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function friendlyError(error: unknown) {
  const status = APICallError.isInstance(error) ? error.statusCode : undefined;
  if (status === 429)
    return "I'm getting a lot of questions right now. Please try again in a moment.";
  if (status === 402 || status === 403)
    return "The assistant is unavailable right now. Please use the contact page and our team will reply.";
  return "Sorry, something went wrong on my side. Please try again.";
}

// Reasoning items are dropped from replayed history: they are not needed for later turns and can fail verification on another deployment.
function forReplay(messages: UIMessage[]): UIMessage[] {
  return messages
    .map((m) => ({ ...m, parts: m.parts.filter((p) => p.type !== "reasoning") }))
    .filter((m) => m.parts.length > 0);
}

export async function handleChat(request: Request): Promise<Response> {
  const geminiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_GENERATIVE_AI_API_KEY"];
  const openaiKey = process.env["OPENAI_API_KEY"];

  if (!geminiKey && !openaiKey) return json(500, "The assistant isn't configured yet.");

  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await readBoundedJson(request, MAX_REQUEST_BYTES));
  } catch (error) {
    if (error instanceof RequestBodyTooLarge) return json(413, "Message is too large.");
    return json(400, "Invalid message.");
  }

  const ip = getTrustedClientIp(request);
  if (!ip && process.env["NODE_ENV"] === "production") {
    return json(503, "The assistant is unavailable right now. Please try again shortly.");
  }
  const clientIp = ip ?? "127.0.0.1";

  const text = body.message.parts
    .map((p) => p.text)
    .join("\n")
    .trim();
  if (!text || text.length > 2000)
    return json(400, "Please keep your message under 2,000 characters.");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Fetch settings, rate limits, conversation, and open roles all in parallel to minimize response latency
  const [
    { data: settings },
    ipAllowed,
    conversationAllowed,
    { data: existing, error: loadError },
    { data: openings },
  ] = await Promise.all([
    supabaseAdmin.from("chatbot_settings").select("enabled, assistant_name").eq("id", true).maybeSingle(),
    consumeServerRateLimit("chat-ip", clientIp, 60),
    consumeServerRateLimit("chat-conversation", body.id, 40),
    supabaseAdmin.from("chat_conversations").select("messages, lead_id").eq("id", body.id).maybeSingle(),
    supabaseAdmin.from("job_openings").select("title, location").eq("is_open", true).order("sort_order").limit(20),
  ]);

  if (!settings?.enabled)
    return json(403, "The assistant is currently offline. Please use the contact page.");

  if (!ipAllowed || !conversationAllowed)
    return json(429, "You've sent a lot of messages. Please wait a little and try again.");

  if (loadError) {
    console.error("chat load failed", loadError);
    return json(503, "The assistant is unavailable right now. Please try again shortly.");
  }

  if (!existing) {
    const { error } = await supabaseAdmin
      .from("chat_conversations")
      .insert({ id: body.id, page_path: body.path });
    if (error) {
      console.error("chat create failed", error);
      return json(503, "The assistant is unavailable right now. Please try again shortly.");
    }
  }

  const stored = (Array.isArray(existing?.messages)
    ? existing.messages
    : []) as unknown as UIMessage[];
  if (stored.length >= MAX_STORED_MESSAGES)
    return json(
      429,
      "This conversation has become long. Please tap “Start over” to begin a fresh one.",
    );

  const userMessage: UIMessage = {
    id: body.message.id,
    role: "user",
    parts: [{ type: "text", text }],
  };
  const messages = stored.at(-1)?.id === userMessage.id ? stored : [...stored, userMessage];
  let leadId = existing?.lead_id ?? null;

  const tools = {
    save_lead: tool({
      description:
        "Save the visitor's contact details so a Macrow Digital strategist can follow up. Call only once you have their name, email and mobile number.",
      inputSchema: z.object({
        name: z.string().describe("Visitor's full name"),
        email: z.string().describe("Visitor's email address"),
        phone: z.string().describe("Visitor's mobile number, with country code if given"),
        need: z.string().describe("Short summary of what the visitor wants help with"),
      }),
      execute: async (input) => {
        const parsed = leadSchema.safeParse(input);
        if (!parsed.success)
          return {
            saved: false,
            error:
              parsed.error.issues[0]?.message ??
              "Some details look invalid. Please ask the visitor to check them.",
          };
        const lead = parsed.data;
        const row = {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          message: `${lead.need}\n\n(From the website AI chat · conversation ${body.id})`,
          source: "AI chat assistant",
        };
        const result = leadId
          ? await supabaseAdmin
              .from("contact_submissions")
              .update(row)
              .eq("id", leadId)
              .select("id")
              .single()
          : await supabaseAdmin.from("contact_submissions").insert(row).select("id").single();
        if (result.error) {
          console.error("chat lead save failed", result.error);
          return { saved: false, error: "Could not save details right now." };
        }
        leadId = result.data.id;
        const { error: linkError } = await supabaseAdmin
          .from("chat_conversations")
          .update({ lead_id: leadId })
          .eq("id", body.id);
        if (linkError) console.error("chat lead link failed", linkError);
        try {
          const { sendSubmissionAlert } = await import("../notify.server");
          await sendSubmissionAlert(
            "contact",
            `New lead from the website AI chat\n\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone}\n\n${lead.need}`,
          );
        } catch (error) {
          console.error("chat lead alert failed", error);
        }
        return { saved: true };
      },
    }),
  };

  const model = geminiKey
    ? createGoogleGenerativeAI({ apiKey: geminiKey })(
        process.env["GEMINI_MODEL"] || "gemini-3.5-flash"
      )
    : createOpenAI({ apiKey: openaiKey! }).responses(
        process.env["OPENAI_MODEL"] || "gpt-4.1-mini"
      );

  const result = streamText({
    model,
    instructions: buildAssistantInstructions({
      name: settings.assistant_name,
      pagePath: body.path,
      openRoles: (openings ?? []).map((o) => `${o.title} (${o.location})`),
      leadSaved: Boolean(leadId),
    }),
    messages: await convertToModelMessages(forReplay(messages), {
      tools,
      ignoreIncompleteToolCalls: true,
    }),
    tools,
    stopWhen: isStepCount(5),
    maxRetries: 1,
    abortSignal: request.signal,
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: generateId,
    sendReasoning: true,
    onError: friendlyError,
    onEnd: async ({ messages: finished }) => {
      const { error } = await supabaseAdmin
        .from("chat_conversations")
        .update({ messages: finished as unknown as never, updated_at: new Date().toISOString() })
        .eq("id", body.id);
      if (error) console.error("chat save failed", error);
    },
  });
}
