import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Session refresh + auth gate, run by src/proxy.ts on every matched request.
// Template-faithful rules: no code between createServerClient and auth.getClaims()
// (debugging hazard — users randomly logged out), and ALWAYS return the
// supabaseResponse object as-is so browser/server cookies stay in sync.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims().
  // getClaims() validates the JWT signature (never trust getSession() in server code).
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (
    !user &&
    request.nextUrl.pathname !== "/login" &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}