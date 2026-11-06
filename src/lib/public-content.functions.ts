import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

// Call only inside a handler: uses public credentials and existing read policies.
export function publicContentClient() {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
  return createClient<Database>(process.env['SUPABASE_URL']!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
}

export const listPublishedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const client = publicContentClient();
  const rows: Database["public"]["Tables"]["blog_posts"]["Row"][] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from("blog_posts").select("*").eq("is_published", true).order("is_featured", { ascending: false }).order("published_at", { ascending: false }).order("id").range(offset, offset + 499);
    if (error) throw new Error("Unable to load insights.");
    rows.push(...(data ?? []));
    if (!data || data.length < 500) return rows;
  }
});

export const listPublishedProjects = createServerFn({ method: "GET" }).handler(async () => {
  const client = publicContentClient();
  const rows: Database["public"]["Tables"]["work_projects"]["Row"][] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from("work_projects").select("*").eq("is_published", true).order("sort_order").order("id").range(offset, offset + 499);
    if (error) throw new Error("Unable to load case studies.");
    rows.push(...(data ?? []));
    if (!data || data.length < 500) return rows;
  }
});

export const getPublishedProject = createServerFn({ method: "GET" })
  .inputValidator(input => z.object({ slug: z.string().max(180).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/) }).parse(input))
  .handler(async ({ data }) => {
    const { data: project, error } = await publicContentClient().from("work_projects").select("*").eq("slug", data.slug).eq("is_published", true).maybeSingle();
    if (error) throw new Error("Unable to load this case study.");
    return project;
  });