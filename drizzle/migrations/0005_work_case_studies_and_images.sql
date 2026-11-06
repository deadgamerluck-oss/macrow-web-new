ALTER TABLE public.work_projects ADD COLUMN slug text;
ALTER TABLE public.work_projects ADD COLUMN body text;
UPDATE public.work_projects SET slug = trim(both '-' from lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'))) WHERE slug IS NULL;
CREATE UNIQUE INDEX work_projects_slug_key ON public.work_projects (slug);
ALTER TABLE public.testimonials ADD COLUMN image_url text;
CREATE OR REPLACE FUNCTION public.validate_website_submission()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$ BEGIN IF NEW.email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR length(NEW.email)>255 THEN RAISE EXCEPTION 'Invalid email address'; END IF; IF TG_TABLE_NAME='contact_submissions' THEN IF length(trim(NEW.name)) NOT BETWEEN 1 AND 100 OR length(trim(NEW.message)) NOT BETWEEN 1 AND 1500 OR length(coalesce(NEW.phone,'')) NOT BETWEEN 7 AND 20 OR length(coalesce(NEW.budget,''))>100 THEN RAISE EXCEPTION 'Invalid enquiry'; END IF; ELSIF TG_TABLE_NAME='job_applications' THEN IF length(trim(NEW.full_name)) NOT BETWEEN 1 AND 100 OR length(coalesce(NEW.message,''))>1500 OR length(coalesce(NEW.phone,'')) NOT BETWEEN 7 AND 20 OR length(NEW.role_title)>200 OR (NEW.resume_path IS NOT NULL AND NEW.resume_path !~ '^[a-f0-9-]+\.(pdf|doc|docx)$') THEN RAISE EXCEPTION 'Invalid application'; END IF; ELSIF TG_TABLE_NAME='partner_applications' THEN IF length(trim(NEW.company)) NOT BETWEEN 1 AND 200 OR length(trim(NEW.contact_name)) NOT BETWEEN 1 AND 100 OR length(trim(NEW.message)) NOT BETWEEN 1 AND 3000 OR length(coalesce(NEW.phone,'')) NOT BETWEEN 7 AND 20 OR length(coalesce(NEW.website,''))>300 THEN RAISE EXCEPTION 'Invalid partner request'; END IF; END IF; RETURN NEW; END $function$;
CREATE TRIGGER partner_validate BEFORE INSERT ON public.partner_applications FOR EACH ROW EXECUTE FUNCTION validate_website_submission();