-- 0009_maintenance_mode.sql
CREATE TABLE IF NOT EXISTS public.maintenance_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  enabled boolean NOT NULL DEFAULT false,
  title text NOT NULL DEFAULT 'We are undergoing scheduled maintenance',
  message text NOT NULL DEFAULT 'Macrow Digital is currently upgrading our digital systems to serve you better. We will be back online shortly. For urgent inquiries, email us at growth@macrowdigital.com.',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.maintenance_settings TO anon, authenticated;
GRANT UPDATE ON public.maintenance_settings TO authenticated;
GRANT ALL ON public.maintenance_settings TO service_role;

ALTER TABLE public.maintenance_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_maintenance_settings ON public.maintenance_settings;
CREATE POLICY public_maintenance_settings ON public.maintenance_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS admin_update_maintenance_settings ON public.maintenance_settings;
CREATE POLICY admin_update_maintenance_settings ON public.maintenance_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.maintenance_settings (id, enabled) VALUES (true, false)
ON CONFLICT (id) DO NOTHING;

