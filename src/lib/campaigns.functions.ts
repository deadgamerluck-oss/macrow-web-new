import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const campaignSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(100), title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(600), cta_text: z.string().trim().min(1).max(60),
  image_url: z.union([z.literal(""), z.string().url().refine(v => v.startsWith("https://"), "Use an HTTPS image"), z.string().regex(/^storage:[a-f0-9-]+\.[a-z0-9]+$/, "Invalid uploaded image")]).transform(v => v || null),
  kind: z.enum(["lead", "announcement"]), trigger_type: z.enum(["delay", "scroll", "exit"]),
  delay_seconds: z.number().int().min(5).max(300), scroll_percent: z.number().int().min(10).max(95),
  cooldown_days: z.number().int().min(1).max(90),
  target_path: z.enum(["*", "/", "/about", "/services", "/work", "/blog", "/career", "/partner"]),
  cta_path: z.enum(["/contact", "/services", "/work", "/about", "/partner", "/career", "/blog"]),
  is_active: z.boolean(), sort_order: z.number().int().min(0).max(1000),
  starts_at: z.string().datetime().nullable(), ends_at: z.string().datetime().nullable(),
}).refine(v => !v.starts_at || !v.ends_at || Date.parse(v.ends_at) > Date.parse(v.starts_at), "End date must follow start date");

export const listAdminCampaigns = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!admin) throw new Error("Admin access required");
  const { data, error } = await context.supabase.from("popup_campaigns").select("*").order("sort_order").order("created_at");
  if (error) throw error;
  return data ?? [];
});

export const saveCampaign = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v: unknown) => campaignSchema.parse(v)).handler(async ({ data, context }) => {
  const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!admin) throw new Error("Admin access required");
  const { id, ...values } = data;
  const result = id ? await context.supabase.from("popup_campaigns").update(values).eq("id", id).select("id").single() : await context.supabase.from("popup_campaigns").insert(values).select("id").single();
  if (result.error) throw result.error;
  return result.data;
});

export const deleteCampaign = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v)).handler(async ({ data, context }) => {
  const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!admin) throw new Error("Admin access required");
  const { error } = await context.supabase.from("popup_campaigns").delete().eq("id", data.id);
  if (error) throw error;
  return { success: true };
});