import { getRequestHeader } from "@tanstack/react-start/server";

/** Trust Cloudflare's client IP header only; never accept a client-supplied X-Forwarded-For chain. */
export function getTrustedClientIp(request?: Request): string | null {
  const raw = request?.headers.get("cf-connecting-ip") ?? getRequestHeader("cf-connecting-ip");
  const ip = raw?.trim();
  if (!ip || ip.length > 64 || !/^(?:[\da-f:.]+)$/i.test(ip)) return null;
  return ip;
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
