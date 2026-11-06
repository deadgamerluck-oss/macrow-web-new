# Deploy Macrow Digital

This project builds for Cloudflare Workers using Nitro's Cloudflare module preset.

## 1. Install and configure the build

Use Node.js 20.19 or later. Copy `.env.example` to `.env` and set the two `VITE_SUPABASE_*` values before building; those values are embedded in the browser bundle. Do not commit `.env`.

```powershell
npm ci
$env:VITE_SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"
$env:VITE_SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY"
npm run build
```

The deployable Worker output is created in `.output`.

## 2. Configure Cloudflare Worker variables and secrets

Log in to the Cloudflare account that owns the production zone:

```sh
npx wrangler login
```

Set Worker variables in Cloudflare for `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `EMAIL_FROM`. Add server credentials as Worker secrets; run these commands and paste each value when prompted:

```sh
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put RESEND_API_KEY
```

`OPENAI_API_KEY` enables the website assistant. `RESEND_API_KEY` enables form notification emails. `OPENAI_MODEL` is optional and defaults to `gpt-4.1-mini`.

## 3. Deploy

```sh
npx nitro deploy --prebuilt
```

Or run `npm run deploy` to build and deploy in one command after setting the build variables and Worker secrets.

## 4. Apply the submission security migration

After the new Worker is serving the form handlers, apply `drizzle/migrations/0008_lock_public_submission_writes.sql` to the production Supabase database. This revokes the former direct anonymous form and resume-upload writes. Confirm earlier migrations `0000` through `0007` are already applied. Keep the deployment secrets and `DATABASE_URL` out of source control.

## Local preview

```sh
npm run dev
```

The development server uses Cloudflare runtime emulation and listens at `http://127.0.0.1:8081/`.
