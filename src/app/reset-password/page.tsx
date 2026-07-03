"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/marketing/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

// Password recovery — set-new-password step. The user arrives from the emailed reset link. We accept
// either flow: an already-established recovery session (implicit / PASSWORD_RECOVERY event) or a PKCE
// `?code=` we exchange. No recovery session → an honest expired/invalid state with a way to retry.
type Phase = "checking" | "ready" | "invalid" | "done";

export default function ResetPasswordPage() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let done = false;
    const finish = (ok: boolean) => {
      if (!done) {
        done = true;
        setPhase(ok ? "ready" : "invalid");
      }
    };
    // Hash-based recovery (implicit flow) fires this once the client parses the URL.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") finish(true);
    });
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) return finish(true);
      // PKCE flow: exchange the ?code= for a recovery session.
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
        return finish(!exErr);
      }
      // Give the async URL detection a moment before deciding the link is invalid.
      setTimeout(async () => {
        const s = await supabase.auth.getSession();
        finish(!!s.data.session);
      }, 900);
    })();
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error: updErr } = await supabase.auth.updateUser({ password });
    if (updErr) {
      setError(updErr.message || "Couldn't update the password. Try the link again.");
      setPending(false);
      return;
    }
    setPhase("done");
    // Full document load so the refreshed session cookies ride the next request through the proxy.
    setTimeout(() => window.location.assign("/lead-discovery"), 900);
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
        Set a new password
      </div>

      {phase === "checking" && (
        <p className="mt-6 font-mono text-sm text-muted-foreground">Verifying your reset link…</p>
      )}

      {phase === "invalid" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-border bg-card p-5 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
            <p className="text-sm font-medium text-foreground">This link has expired or is invalid</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Reset links are single-use and time-limited. Request a fresh one and try again.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Request a new link
          </Link>
        </div>
      )}

      {phase === "done" && (
        <div className="mt-6 rounded-lg border border-border bg-card p-5 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
          <p className="text-sm font-medium text-foreground">Password updated ✓</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Taking you to your workspace…</p>
        </div>
      )}

      {phase === "ready" && (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="text-sm font-medium text-foreground">
              New password
            </label>
            <div className="relative">
              <Input
                id="new-password"
                type={show ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="font-mono text-[11px] text-muted-foreground">At least 8 characters.</p>
          </div>
          {error && <p className="font-mono text-xs text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
