import Link from "next/link";

// A1c — the footer. Refined, but the compliance line + © line are kept VERBATIM (factual posture,
// SPEC §11): SPF/DKIM/DMARC enforced, suppression honored every send, per-tenant RLS, immutable
// audit log, and the explicit "we never promise guaranteed inbox delivery or results." The business
// address stays a marked placeholder until go-live. Static (no motion) — it sits at the page foot.

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="font-heading text-base font-semibold text-foreground">Velora</span>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Link href="#how" className="transition-colors hover:text-foreground">How it works</Link>
            <Link href="#pricing" className="transition-colors hover:text-foreground">Pricing</Link>
            <Link href="/login" className="transition-colors hover:text-foreground">Sign in</Link>
            <Link href="/signup" className="transition-colors hover:text-foreground">Start free</Link>
          </nav>
        </div>
        <div className="mt-8 border-t border-border pt-6">
          <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
            Authentication enforced (SPF/DKIM/DMARC), suppression honored on every send, per-tenant
            row-level isolation, and an immutable audit log. We never promise guaranteed inbox
            delivery or results.
          </p>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            © Velora · Privacy · Terms · [business address — added at go-live]
          </p>
        </div>
      </div>
    </footer>
  );
}
