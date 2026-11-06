import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { consumeServerRateLimit, getTrustedClientIp } from "./rate-limit.server";

const contactPayload = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional().default(""),
  budget: z.string().trim().max(100).optional().default(""),
  message: z.string().trim().max(1500).optional().default(""),
  source: z.enum(["Contact page", "Home page form", "Campaign popup"]),
  website: z.string().max(300).optional().default(""),
});

const partnerPayload = z.object({
  company: z.string().trim().min(1).max(200),
  contact_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional().default(""),
  website: z.string().trim().max(300).optional().default(""),
  partnership_type: z.string().trim().max(100).optional().default(""),
  message: z.string().trim().min(1).max(3000),
  honeypot: z.string().max(300).optional().default(""),
});

async function allowPublicSubmission(): Promise<string | null> {
  const ip = getTrustedClientIp();
  if (!ip && process.env["NODE_ENV"] === "production") return null;
  const subject = ip ?? "127.0.0.1";
  return (await consumeServerRateLimit("public-submission", subject, 20)) ? subject : null;
}

async function sendAlert(
  ip: string,
  kind: "contact" | "partner",
  summary: string,
): Promise<void> {
  if (!(await consumeServerRateLimit("submission-alert", ip, 8))) return;
  try {
    const { sendSubmissionAlert } = await import("./notify.server");
    await sendSubmissionAlert(kind, summary);
  } catch (error) {
    console.error("submission alert failed", error);
  }
}

export const submitContactEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactPayload.parse(input))
  .handler(async ({ data }) => {
    const ip = await allowPublicSubmission();
    if (!ip) throw new Error("Too many requests. Please try again later.");
    // Quietly accept honeypot submissions without persisting or alerting.
    if (data.website) return { saved: true };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const name = data.name;
    const email = data.email.toLowerCase();
    const message = data.message || "Strategy conversation requested";
    const { error } = await supabaseAdmin.from("contact_submissions").insert({
      name,
      email,
      phone: data.phone || null,
      budget: data.budget || null,
      message,
      source: data.source,
    });
    if (error) throw new Error("Your message could not be saved. Please try again.");

    await sendAlert(ip, "contact", `${name} (${email}) sent an enquiry from ${data.source}.`);
    return { saved: true };
  });

export const submitPartnerEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => partnerPayload.parse(input))
  .handler(async ({ data }) => {
    const ip = await allowPublicSubmission();
    if (!ip) throw new Error("Too many requests. Please try again later.");
    if (data.honeypot) return { saved: true };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("partner_applications").insert({
      company: data.company,
      contact_name: data.contact_name,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      website: data.website || null,
      partnership_type: data.partnership_type || null,
      message: data.message,
    });
    if (error) throw new Error("Your request could not be saved. Please try again.");

    await sendAlert(
      ip,
      "partner",
      `${data.contact_name} from ${data.company} (${data.email}) sent a partnership request.`,
    );
    return { saved: true };
  });
