"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/marketing/auth-shell";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("Email or password is incorrect.");
      setPending(false);
      return;
    }
    // Ensure a workspace exists. For a confirm-then-login signup this provisions the org now; for an
    // existing user it's an idempotent no-op. Best-effort — never block sign-in on it.
    try {
      await api.provision();
    } catch {
      /* non-fatal — the app will surface a no-org state if provisioning truly failed */
    }
    // Full page load on purpose: the just-written session cookies ride the next document
    // request, so the server-side proxy gate admits without any client/server race.
    window.location.assign("/lead-discovery");
  }

  return (
    <AuthShell>
      <Link
        href="/"
        className="inline-block rounded-md font-heading text-xl font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Velora
      </Link>
        <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Sign in · grounded outreach
        </div>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="font-mono text-xs text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          New to Velora?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Start free
          </Link>
        </p>
    </AuthShell>
  );
}