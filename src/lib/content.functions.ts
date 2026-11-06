import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { newsletterSchema } from "./content-schemas";
import type { Database } from "@/integrations/supabase/types";
import { consumeServerRateLimit, getTrustedClientIp } from "./rate-limit.server";

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input) => newsletterSchema.parse(input))
  .handler(async ({ data }) => {
    const ip = getTrustedClientIp();
    if (!ip && process.env["NODE_ENV"] === "production") {
      throw new Error("Subscription could not be saved. Please try again later.");
    }
    if (!(await consumeServerRateLimit("newsletter", ip ?? "127.0.0.1", 10))) {
      throw new Error("Too many requests. Please try again later.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email: data.email });
    if (error && error.code !== "23505")
      throw new Error("Subscription could not be saved. Please try again.");
    return { saved: true };
  });

export const getPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        slug: z
          .string()
          .max(180)
          .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const client = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`)
            headers.delete("Authorization");
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });
    const { data: post, error } = await client
      .from("blog_posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error("Unable to load this insight.");
    return post;
  });
