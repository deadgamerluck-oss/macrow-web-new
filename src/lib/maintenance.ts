import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MaintenanceSettings = {
  enabled: boolean;
  title: string;
  message: string;
};

export const defaultMaintenanceSettings: MaintenanceSettings = {
  enabled: false,
  title: "We are undergoing scheduled maintenance",
  message:
    "Macrow Digital is currently upgrading our digital systems to serve you better. We will be back online shortly. For urgent inquiries, email us at growth@macrowdigital.com.",
};

export const maintenanceSettingsQuery = queryOptions({
  queryKey: ["maintenance-settings"],
  staleTime: 30_000,
  queryFn: async (): Promise<MaintenanceSettings> => {
    try {
      const { data, error } = await supabase
        .from("maintenance_settings")
        .select("enabled, title, message")
        .eq("id", true)
        .maybeSingle();
      if (error || !data) return defaultMaintenanceSettings;
      return data;
    } catch {
      return defaultMaintenanceSettings;
    }
  },
});
