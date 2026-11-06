-- Public submissions must use the rate-limited same-origin server handlers.
REVOKE INSERT ON public.contact_submissions FROM anon, authenticated;
REVOKE INSERT ON public.partner_applications FROM anon, authenticated;
REVOKE INSERT ON public.job_applications FROM anon, authenticated;

DROP POLICY IF EXISTS submit_contact ON public.contact_submissions;
DROP POLICY IF EXISTS submit_partner ON public.partner_applications;
DROP POLICY IF EXISTS submit_application ON public.job_applications;

DROP POLICY IF EXISTS "Applicants upload resumes" ON storage.objects;
