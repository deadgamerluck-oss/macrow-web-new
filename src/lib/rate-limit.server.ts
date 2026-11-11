import { getRequestHeader } from "@tanstack/react-start/server";

/** Extract client IP from Cloudflare, reverse proxies (X-Forwarded-For, X-Real-IP), or fallback. */
export function getTrustedClientIp(request?: Request): string | null {
  const cf = request?.headers.get("cf-connecting-ip") ?? getRequestHeader("cf-connecting-ip");
  if (cf && cf.trim() && /^(?:[\da-f:.]+)$/i.test(cf.trim())) return cf.trim();

  const realIp = request?.headers.get("x-real-ip") ?? getRequestHeader("x-real-ip");
  if (realIp && realIp.trim() && /^(?:[\da-f:.]+)$/i.test(realIp.trim())) return realIp.trim();

  const forwarded = request?.headers.get("x-forwarded-for") ?? getRequestHeader("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first && /^(?:[\da-f:.]+)$/i.test(first)) return first;
  }

  return null;
}

/** Shared, database-backed hourly limit across server instances and deployments. */
export async function consumeServerRateLimit(
  scope: string,
  subject: string,
  maxAttempts: number,
): Promise<boolean> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${scope}:${subject}`),
  );
  const key = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("consume_rate_limit", {
    limit_key: `${scope}:${key}`,
    max_attempts: maxAttempts,
  });
  if (error) {
    console.error("rate limit store unavailable", error);
    return false;
  }
  return data === true;
}
