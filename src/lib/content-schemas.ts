import { z } from "zod";

export const newsletterSchema = z.object({ email: z.string().trim().email().max(255).transform(v => v.toLowerCase()), consent: z.literal(true) });
export const postSchema = z.object({
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(180), category: z.string().trim().min(1).max(100),
  summary: z.string().trim().min(1).max(2000), body: z.string().trim().max(100000),
  read_time: z.string().trim().max(50),
  cover_image: z.string().trim().max(2000).optional().transform((v) => v || null),
});
export const contactSchema = z.object({ name: z.string().trim().min(1).max(100), email: z.string().trim().email().max(255), phone: z.string().trim().min(7).max(20), budget: z.string().max(100), message: z.string().trim().min(1).max(1500) });
export const applicationSchema = z.object({ full_name: z.string().trim().min(1).max(100), email: z.string().trim().email().max(255), phone: z.string().trim().min(7).max(20), message: z.string().trim().max(1500) });