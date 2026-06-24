import Link from "next/link";

// S5 — the footer, given real weight: a brand column (wordmark + honest one-liner + dry-run mark) and
// two link columns (Product / Account), over the kept-VERBATIM compliance + © lines. The compliance
// line is the factual posture (SPEC §11) — SPF/DKIM/DMARC enforced, suppression honored every send,
// per-tenant RLS, immutable audit log, and the explicit "we never promise guaranteed inbox delivery
// or results"; the business address stays a marked placeholder until go-live. A thin indigo hairline
// tops it. Static (no motion) — it sits at the page foot.

const PRODUCT = [
  { label: "How it works", href: "#how" },
  { label: "See it draft, live", href: "#demo" },
  { label: "The hub", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
];

const ACCOUNT = [
  { label: "Start free", href: "/signup" },
  { label: "Sign in", href: "/login" },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-foreground/80 transition-colors hover:text-primary">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border bg-card">
      {/* Thin indigo hairline — the single accent, echoing the evidence rail. */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" aria-hidden />

      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <span className="font-heading text-lg font-semibold text-foreground">Velora</span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Outbound that earns its replies — grounded drafts, dry-run by default. You see the work
              before anything sends.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
              <span className="size-1 rounded-full bg-primary" aria-hidden />
              dry-run by default
            </span>
          </div>

          <FooterColumn title="Product" links={PRODUCT} />
          <FooterColumn title="Account" links={ACCOUNT} />
        </div>

        <div className="mt-12 border-t border-border pt-6">
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
