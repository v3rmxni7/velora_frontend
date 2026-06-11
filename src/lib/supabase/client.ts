import { createBrowserClient } from "@supabase/ssr";

// Browser client — cookie-backed session (no localStorage, per the locked repo rule).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}