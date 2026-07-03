"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/marketing/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

// Password recovery — request step. Sends a Supabase reset email whose link returns to /reset-password.
// Security: we always show the same confirmation regardless of whether the email exists (no account
// enumeration). Requires the Supabase project to allow <origin>/reset-password as a redirect URL.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    // Only surface genuine server failures; never reveal whether the address is registered.
    if (resetError && (resetError.status ?? 0) >= 500) {
      setError("Something went wrong sending the email. Please try again.");
      setPending(false);
      return;
    }
    setSent(true);
    setPending(false);
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
        Reset your password
      </div>

      {sent ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-border bg-card p-5 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
            <p className="text-sm font-medium text-foreground">Check your email</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              If an account exists for <span className="font-medium text-foreground">{email}</span>,
              we&rsquo;ve sent a link to reset your password. It expires shortly for your security.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              ← Back to sign in
            </Link>
          </p>
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Enter your email and we&rsquo;ll send you a link to set a new password.
          </p>
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
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
            {error && <p className="font-mono text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Sending…" : "Send reset link"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
