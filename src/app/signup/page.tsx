"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/marketing/auth-shell";

// Self-serve signup (Slice 4.13). Supabase signUp → if a session is returned (email confirmation off)
// we provision the org and enter the app; if not (confirmation on, a Supabase project setting) we
// honestly say "check your email" — the org is provisioned on the subsequent sign-in.
export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message || "Couldn’t create your account.");
      setPending(false);
      return;
    }
    if (!data.session) {
      setCheckEmail(true); // confirmation required — no session yet
      setPending(false);
      return;
    }
    try {
      await api.provision(); // create the org + owner + welcome credits
    } catch {
      setError("Account created, but workspace setup didn’t finish — try signing in.");
      setPending(false);
      return;
    }
    // Full reload so the freshly-written session cookies ride the next document request.
    window.location.assign("/manage");
  }

  if (checkEmail) {
    return (
      <AuthShell>
        <h1 className="font-heading text-lg font-semibold text-foreground">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to <span className="text-foreground">{email}</span>. Confirm
          it, then sign in to finish setting up your workspace.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Go to sign in →
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="font-heading text-xl font-semibold text-foreground">Velora</div>
      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        Create your workspace
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Email" id="email">
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" id="password">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && <p className="font-mono text-xs text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
