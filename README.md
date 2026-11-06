# Macrow Digital

Macrow Digital's website and content platform, built with React, TanStack Start, TypeScript, Tailwind CSS, Supabase, and Cloudflare Workers.

## Local development

Requirements: Node.js 20.19 or later and npm.

```sh
npm install
npm run dev
```

The development server starts at `http://localhost:8081`.

## Production build

```sh
npm run build
```

The production build is generated in `.output` for deployment to Cloudflare Workers.

## Environment

Configure the required values in the deployment environment or a local `.env` file:

- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` for public database access.
- `SUPABASE_SERVICE_ROLE_KEY` for server-only database operations.
- `OPENAI_API_KEY` to enable the website assistant. `OPENAI_MODEL` optionally selects the model; the default is `gpt-4.1-mini`.
- `RESEND_API_KEY` and `EMAIL_FROM` for server-side submission notifications.
- `DATABASE_URL` for Drizzle migrations.

Never expose server-only keys through `VITE_*` variables or commit secrets to source control.
