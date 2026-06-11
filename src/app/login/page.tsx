// Placeholder only — the real sign-in form lands in B1. This page exists so the proxy
// auth gate has a concrete redirect target from day one.
export default function LoginPage() {
  return (
    <main className="flex h-dvh items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-md border border-border bg-card p-8">
        <div className="font-heading text-xl font-semibold text-foreground">Velora</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to review grounded outreach. The sign-in form arrives in the next slice.
        </p>
        <div className="mt-6 rounded-md bg-secondary px-3 py-2 font-mono text-xs text-muted-foreground">
          auth gate active — unauthenticated traffic lands here
        </div>
      </div>
    </main>
  );
}