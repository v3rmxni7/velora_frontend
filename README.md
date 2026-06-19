# Velora dashboard

The Velora web app — a Next.js (App Router) dashboard for the autonomous AI BDR. It talks to
`velora_backend` purely over HTTP (`NEXT_PUBLIC_API_URL`); the two are **separate repos** and never
cross-import. Auth + data are Supabase (cookie sessions via `@supabase/ssr`, every row under RLS).

> **Local dev behind a TLS-intercepting corporate proxy:** run Node with the system trust store, or
> the auth gate's `getClaims()` JWKS fetch fails and every signed-in request bounces to `/login`:
>
> ```bash
> NODE_OPTIONS=--use-system-ca pnpm dev
> ```
>
> (Vercel does not need this.)

## Local development

```bash
cp .env.example .env.local   # then fill in the values (see below)
pnpm install
pnpm dev                     # http://localhost:3000
```

Point `NEXT_PUBLIC_API_URL` at your local backend (`pnpm dev` in `velora_backend` → `http://localhost:8080`).

## Environment

All three are `NEXT_PUBLIC_*` and therefore **inlined at build time** — on Vercel they must be set
**before the first build**, and changing one requires a rebuild. See [`.env.example`](.env.example).

| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (same project as `velora_backend`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe anon key (RLS authorizes every row). |
| `NEXT_PUBLIC_API_URL` | The `velora_backend` origin. In prod this **must** be the deployed Railway origin — otherwise `http://localhost:8080` bakes into the bundle (broken API calls + a localhost pixel snippet shown to customers). |

The service-role key must **never** appear in this repo.

## Scripts

`pnpm dev` · `pnpm build` · `pnpm start` · `pnpm typecheck` · `pnpm lint`

## Deploy (Vercel)

Set the three env vars above in the Vercel project, then deploy. Standard Next.js build.

## Going live

The dashboard is **read + one-click PAUSE** only — it cannot turn real sending on. Enabling real
sending is a deliberate, per-org service-role act that lives in the backend. See the full procedure,
deploy checklist, QA playbook, and honesty contract in **`velora_backend/docs/RUNBOOK.md`**.
