CREATE TABLE public.chatbot_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  enabled boolean NOT NULL DEFAULT true,
  assistant_name text NOT NULL DEFAULT 'Macrow Assistant' CHECK (length(assistant_name) BETWEEN 1 AND 60),
  greeting text NOT NULL DEFAULT 'Hi there! I''m the Macrow Digital assistant. Ask me anything about marketing, branding, websites or AI — or tell me what you''d like to grow.' CHECK (length(greeting) BETWEEN 1 AND 400),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.chatbot_settings TO anon, authenticated;
GRANT UPDATE ON public.chatbot_settings TO authenticated;
GRANT ALL ON public.chatbot_settings TO service_role;
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_chatbot_settings ON public.chatbot_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY admin_update_chatbot_settings ON public.chatbot_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.chatbot_settings (id) VALUES (true);

CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  lead_id uuid,
  page_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.chat_conversations TO authenticated;
GRANT ALL ON public.chat_conversations TO service_role;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_read_chats ON public.chat_conversations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY admin_delete_chats ON public.chat_conversations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.consume_rate_limit(limit_key text, max_attempts integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE n integer;
BEGIN
  INSERT INTO public.form_rate_limits AS limits(key) VALUES (limit_key)
  ON CONFLICT (key) DO UPDATE SET
    attempts = CASE WHEN limits.window_start < now() - interval '1 hour' THEN 1 ELSE limits.attempts + 1 END,
    window_start = CASE WHEN limits.window_start < now() - interval '1 hour' THEN now() ELSE limits.window_start END
  RETURNING attempts INTO n;
  RETURN n <= max_attempts;
END $$;
REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer) TO service_role;