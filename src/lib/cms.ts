import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type BlogPost = Tables<"blog_posts">;
export type JobOpening = Tables<"job_openings">;
export type ContactSubmission = Tables<"contact_submissions">;
export type JobApplication = Tables<"job_applications">;

export const blogPostsQuery = queryOptions({
  queryKey: ["blog_posts"],
  queryFn: async (): Promise<BlogPost[]> => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const jobOpeningsQuery = queryOptions({
  queryKey: ["job_openings"],
  queryFn: async (): Promise<JobOpening[]> => {
    const { data, error } = await supabase
      .from("job_openings")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const contactSubmissionsQuery = queryOptions({
  queryKey: ["contact_submissions"],
  queryFn: async (): Promise<ContactSubmission[]> => {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const jobApplicationsQuery = queryOptions({
  queryKey: ["job_applications"],
  queryFn: async (): Promise<JobApplication[]> => {
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export async function resumeDownloadUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from("resumes").createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}

export type Testimonial = Tables<"testimonials">;
export type WorkProject = Tables<"work_projects">;
export type ClientLogo = Tables<"client_logos">;
export type PartnerApplication = Tables<"partner_applications">;

function listQuery<T>(table: "testimonials" | "work_projects" | "client_logos", key: string) {
  return queryOptions({
    queryKey: [key],
    queryFn: async (): Promise<T[]> => {
      const { data, error } = await supabase.from(table).select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export const testimonialsQuery = listQuery<Testimonial>("testimonials", "testimonials");
export const workProjectsQuery = listQuery<WorkProject>("work_projects", "work_projects");
export const clientLogosQuery = listQuery<ClientLogo>("client_logos", "client_logos");

export const partnerApplicationsQuery = queryOptions({
  queryKey: ["partner_applications"],
  queryFn: async (): Promise<PartnerApplication[]> => {
    const { data, error } = await supabase.from("partner_applications").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});
