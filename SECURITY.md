# Security deployment checklist

The app adds response headers in `src/server.ts`, applies shared database-backed
limits to the AI chat, newsletter, contact, partner, career and internal alert
handlers, and bounds chat and application request bodies before parsing them. `public/_headers` adds headers
to static assets on Cloudflare Pages. These controls do not replace edge rules
or protect requests that bypass this app.

## Cloudflare edge

The Vite configuration selects Nitro's Cloudflare target. Confirm the production
hostname is actually proxied through the intended Cloudflare zone and that the
origin cannot be reached directly. Cloudflare documents network and HTTP DDoS
mitigation as enabled by default; managed WAF and rate-limit behavior still
depends on the zone's plan and configuration.

Before production traffic:

1. Enable Cloudflare Managed Rules and the OWASP Core Ruleset; review events in
   log mode before switching false-positive-prone rules to block.
2. Enable the bot controls available on the zone's plan. Use managed challenge
   for suspicious traffic rather than challenging every visitor.
3. Add an edge rate limit for `POST /api/chat` in addition to the app's shared
   hourly limits. Alert on elevated 4xx/5xx rates and sudden origin traffic.
4. Restrict origin access to Cloudflare and verify DNS-only aliases do not expose
   an alternate path around the proxy.

## Supabase boundary

Contact, partner, career, popup and home form writes now go through rate-limited
same-origin server handlers using the service role. Apply migration
`0008_lock_public_submission_writes.sql` to revoke the old anonymous table
INSERT and resume-upload paths. Until it is applied, the earlier direct
Supabase permissions remain active and can bypass website edge and middleware
limits. Deploy the handlers and apply the migration as one production rollout.

## Required secrets

Keep `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`,
`EMAIL_FROM`, and `CRON_SECRET` server-side only. Never put them in `VITE_*` variables. Rotate any
server secret if it has been committed or shared outside the deployment's secret
store.
