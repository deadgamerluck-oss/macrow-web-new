import { z } from "zod";

/** Leads collected by the website assistant: name, email and mobile number are all required. */
export const leadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9 ()-]{6,19}$/, "A valid mobile number is required"),
  need: z.string().trim().min(1).max(1500),
});
