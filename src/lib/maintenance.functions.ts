import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const maintenanceSchema = z.object({
  enabled: z.boolean(),
  title: z.string().trim().min(1).max(160),
  message: z.string().trim().min(1).max(1000),
});

export const saveMaintenanceSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => maintenanceSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!admin) throw new Error("Admin access required");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("maintenance_settings")
      .upsert(
        {
          id: true,
          enabled: data.enabled,
          title: data.title,
          message: data.message,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

    if (error) throw new Error(error.message);
    return { ok: true };
  });
