import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Public: returns a visitor's own saved chat. The random conversation id kept in their browser is the only key. */
export const loadChatConversation = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data }): Promise<{ messagesJson: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("chat_conversations")
      .select("messages")
      .eq("id", data.id)
      .maybeSingle();
    if (error) {
      console.error("chat history load failed", error);
      throw new Error("Couldn't load your conversation.");
    }
    // Sent as a JSON string: saved chat messages are free-form JSON.
    return { messagesJson: JSON.stringify(Array.isArray(row?.messages) ? row.messages : []) };
  });

const settingsSchema = z.object({
  enabled: z.boolean(),
  assistant_name: z.string().trim().min(1).max(60),
  greeting: z.string().trim().min(1).max(400),
});

export const saveChatbotSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => settingsSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!admin) throw new Error("Admin access required");
    const { error } = await context.supabase
      .from("chatbot_settings")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
