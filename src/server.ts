import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  const captured = consumeLastCapturedError();
  console.error(captured ?? new Error(`h3 swallowed SSR error: ${body}`));

  const details = captured ? `\n\n${captured instanceof Error ? captured.stack ?? captured.message : String(captured)}` : `\n\n${body}`;

  return new Response(
    renderErrorPage().replace(
      "</body>",
      `<div style="max-width:900px;margin:20px auto;padding:16px;background:#fef2f2;border:1px solid #f87171;color:#991b1b;border-radius:8px;font-family:monospace;white-space:pre-wrap;text-align:left;font-size:13px;overflow-x:auto;"><strong>Server Error (Diagnostics):</strong>${details}</div></body>`
    ),
    {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    }
  );
}

function applySecurityHeaders(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  headers.set(
    "Content-Security-Policy",
    "base-uri 'self'; object-src 'none'; frame-ancestors 'none'",
  );
  headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");

  // Only emit HSTS on HTTPS requests; local development remains HTTP-friendly.
  if (new URL(request.url).protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=31536000");
  }

  const copy = response.clone();
  return new Response(copy.body, {
    status: copy.status,
    statusText: copy.statusText,
    headers,
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return applySecurityHeaders(await normalizeCatastrophicSsrResponse(response), request);
    } catch (error) {
      console.error("[MACROW SERVER CATASTROPHIC ERROR]:", error);
      const isDevOrDebug = process.env.NODE_ENV !== "production" || process.env.DEBUG === "true";
      const errorDetail = isDevOrDebug && error instanceof Error
        ? `<div style="max-width:800px;margin:20px auto;padding:15px;background:#fee;border:1px solid #f99;border-radius:6px;font-family:monospace;white-space:pre-wrap;text-align:left;"><strong>${error.name}: ${error.message}</strong>\n\n${error.stack}</div>`
        : "";
      return applySecurityHeaders(
        new Response(renderErrorPage().replace("</body>", `${errorDetail}</body>`), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
        request,
      );
    }
  },
};
