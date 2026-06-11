# Velora Frontend (this repo only; backend is separate, over HTTP)
## Stack (locked — ask before changing)
Next.js App Router + TS · Tailwind + shadcn/ui · Recharts · Lucide · Framer Motion (later)
Deploy: Vercel
## Rules that change behavior
- API base URL from NEXT_PUBLIC_API_URL (.env.local). Only NEXT_PUBLIC_* is browser-safe.
- NO localStorage/sessionStorage for app state — React state / server data only.
- Tokens: accent #4F46E5; ink #16181D; body #4B5563; surface #FAFAFB; border #E5E7EB.
- App IA (sidebar): Manage / Engage / Lead discovery / Lead management.
- Small, reviewable commits.