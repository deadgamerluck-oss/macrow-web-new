import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Campaign = Tables<"popup_campaigns">;
export const publicCampaignsQuery = queryOptions({
  queryKey: ["public-campaigns"],
  staleTime: 30_000,
  queryFn: async () => {
    const { data, error } = await supabase.from("popup_campaigns").select("*").eq("is_active", true).order("sort_order");
    if (error) throw error;
    const now = Date.now();
    return (data ?? []).filter(c => (!c.starts_at || Date.parse(c.starts_at) <= now) && (!c.ends_at || Date.parse(c.ends_at) > now));
  },
});

export function readPreference(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
export function savePreference(key: string, value: string) {
  try { window.localStorage.setItem(key, value); } catch { /* Storage can be unavailable in private browsing. */ }
}