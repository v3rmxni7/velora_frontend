import Link from "next/link";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Differentiators } from "@/components/marketing/differentiators";
import { Honesty } from "@/components/marketing/honesty";

// Public marketing landing (Slice 4.13). Static server component → fast LCP (SPEC §11). HONEST
// positioning per SPEC §1/§11: the wedge is data + deliverability + transparency, not "magic AI".
// NO fabricated testimonials, logos, or results/deliverability guarantees.

const TIERS = [
  {
    name: "Starter",
    price: 249,
    leads: "~2K leads/mo",
    credits: "2,000 credits",
    blurb: "Solo or small team. Email-first. The wedge.",
  },
  {
    name: "Growth",
    price: 699,
    leads: "~10K leads/mo",
    credits: "10,000 credits",
    blurb: "Active team. Full orchestration + analytics depth.",
    featured: true,
  },
  {
    name: "Scale",
    price: 1999,
    leads: "~50K leads/mo",
    credits: "50,000 credits",
    blurb: "Heavy / multi-ICP. Metered usage.",
  },
];

export default function Home() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      {/* A1a — the dark hero + nav + real grounded-draft centerpiece. */}
      <Hero />

      {/* A1b — how it works (the real pipeline), the real differentiators, the honesty manifesto. */}
      <HowItWorks />
      <Differentiators />
      <Honesty />

      {/* Pricing */}
      <section id="pricing" className="border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center font-heading text-2xl font-semibold tracking-tight">Clear, metered pricing</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            AI &amp; data work is metered in credits; sending infrastructure is billed in dollars. No
            credit-maze.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`rounded-md border bg-background p-6 ${t.featured ? "border-primary/50 ring-1 ring-primary/20" : "border-border"}`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-foreground">{t.name}</span>
                  {t.featured && (
                    <span className="rounded border border-primary/40 px-1 font-mono text-[10px] uppercase tracking-[0.1em] text-primary">
                      popular
                    </span>
                  )}
                </div>
                <p className="mt-2 font-mono text-2xl tabular-nums text-foreground">
                  ${t.price.toLocaleString()}
                  <span className="text-[11px] text-muted-foreground">/mo</span>
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {t.credits} · {t.leads}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{t.blurb}</p>
                <Link
                  href="/signup"
                  className="mt-5 block rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Start free
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">Start in minutes.</h2>
        <p className="mt-3 text-muted-foreground">
          Create a workspace, connect your knowledge base, and see grounded drafts before a single
          send.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Start free
        </Link>
      </section>

      {/* Footer — honest compliance posture; placeholders are marked as such. */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-heading text-base font-semibold text-foreground">Velora</span>
            <nav className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground">Sign in</Link>
              <Link href="/signup" className="hover:text-foreground">Start free</Link>
            </nav>
          </div>
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
            Authentication enforced (SPF/DKIM/DMARC), suppression honored on every send, per-tenant
            row-level isolation, and an immutable audit log. We never promise guaranteed inbox
            delivery or results.
          </p>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            © Velora · Privacy · Terms · [business address — added at go-live]
          </p>
        </div>
      </footer>
    </main>
  );
}
