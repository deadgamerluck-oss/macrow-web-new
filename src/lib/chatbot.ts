import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ChatbotSettings = { enabled: boolean; assistant_name: string; greeting: string };

export const chatbotSettingsQuery = queryOptions({
  queryKey: ["chatbot-settings"],
  staleTime: 60_000,
  queryFn: async (): Promise<ChatbotSettings | null> => {
    const { data, error } = await supabase
      .from("chatbot_settings")
      .select("enabled, assistant_name, greeting")
      .eq("id", true)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
});

/** The only chat value kept in the browser: the random id of the visitor's saved conversation. */
export const CHAT_ID_KEY = "macrow-chat-id";
