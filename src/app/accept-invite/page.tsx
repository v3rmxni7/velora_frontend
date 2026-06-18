// Honest-shell accept page (Slice 4.8). The invite link lands here, but acceptance + the brand-new-
// user signup flow are a DEFERRED onboarding slice (there is no signup flow yet). We do NOT call any
// backend accept route — we honestly say it's coming, rather than ship a fake/broken redemption.
export default function AcceptInvitePage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="max-w-md space-y-3 rounded-md border border-border bg-card p-6 text-center">
        <h1 className="font-heading text-lg font-semibold text-foreground">You’ve been invited to Velora</h1>
        <p className="text-sm text-muted-foreground">
          Invite acceptance and account signup are coming soon. This link will activate once the
          onboarding flow ships — ask your inviter to re-share it then.
        </p>
        <p className="font-mono text-[11px] text-muted-foreground">
          your invitation is saved; nothing else is needed yet
        </p>
      </div>
    </main>
  );
}
