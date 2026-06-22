"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/marketing/auth-shell";

// Real accept-invite (Slice 4.13). Reads ?token= via useSearchParams (under a Suspense boundary),
// authenticates the invitee (sign up or sign in), then calls /auth/accept-invite to join the
// inviter's org. The backend enforces the email match + expiry; we surface those honestly.
function acceptError(err: ApiError): string {
  if (err.status === 403) return "This invite was sent to a different email address.";
  if (err.status === 410) return "This invite has expired — ask your inviter to resend it.";
  if (err.status === 409) return "You’re already part of a workspace.";
  if (err.status === 404) return "This invite link is invalid.";
  return err.message || "Couldn’t accept the invite — try again.";
}

export default function AcceptInvitePage() {
  // useSearchParams must sit under a Suspense boundary (the repo's engage/page.tsx pattern).
  return (
    <Suspense fallback={<AuthShell>Loading…</AuthShell>}>
      <AcceptInvite />
    </Suspense>
  );
}

function AcceptInvite() {
  const token = useSearchParams().get("token");
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setPending(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error: e1 } = await supabase.auth.signUp({ email, password });
      if (e1) {
        setError(e1.message || "Couldn’t create your account.");
        setPending(false);
        return;
      }
      if (!data.session) {
        setCheckEmail(true); // confirmation required — they reopen this link after confirming
        setPending(false);
        return;
      }
    } else {
      const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
      if (e2) {
        setError("Email or password is incorrect.");
        setPending(false);
        return;
      }
    }

    try {
      await api.acceptInvite(token);
    } catch (err) {
      setError(err instanceof ApiError ? acceptError(err) : "Couldn’t accept the invite — try again.");
      setPending(false);
      return;
    }
    window.location.assign("/manage");
  }

  if (!token) {
    return (
      <AuthShell>
        <h1 className="font-heading text-lg font-semibold text-foreground">Invalid invite link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This link is missing its invite token. Ask your inviter to re-share it.
        </p>
      </AuthShell>
    );
  }

  if (checkEmail) {
    return (
      <AuthShell>
        <h1 className="font-heading text-lg font-semibold text-foreground">Confirm your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to <span className="text-foreground">{email}</span>. Confirm
          it, then reopen this invite link to join the team.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="font-heading text-lg font-semibold text-foreground">Join your team on Velora</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "signup" ? "Create your account to accept the invitation." : "Sign in to accept the invitation."}
      </p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <Field label="Email" id="email">
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" id="password">
          <Input
            id="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && <p className="font-mono text-xs text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Joining…" : "Accept invitation"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        {mode === "signup" ? "Already have an account? " : "Need an account? "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setError(null);
          }}
          className="font-medium text-primary hover:underline"
        >
          {mode === "signup" ? "Sign in" : "Create one"}
        </button>
      </p>
      <p className="mt-3 font-mono text-[11px] text-muted-foreground">
        you can only accept an invite sent to your email address
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
