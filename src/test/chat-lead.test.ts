import { describe, expect, it } from "vitest";
import { leadSchema } from "@/lib/chat/lead-schema";

const base = {
  name: "Riya Mehta",
  email: "riya@example.com",
  phone: "+91 98290 12345",
  need: "More leads for a clinic",
};

describe("chat assistant leads", () => {
  it("accepts a lead with name, email and mobile number", () => {
    expect(leadSchema.safeParse(base).success).toBe(true);
  });
  it("rejects a lead without a mobile number", () => {
    expect(leadSchema.safeParse({ ...base, phone: "" }).success).toBe(false);
  });
  it("rejects a lead with an invalid email", () => {
    expect(leadSchema.safeParse({ ...base, email: "riya-at-example" }).success).toBe(false);
  });
});
