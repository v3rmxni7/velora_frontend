import Link from "next/link";

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

const WHY = [
  { h: "Priced to win", p: "Well under the ~$1,500–$2,000 incumbents — metered so heavy users pay for what they use." },
  { h: "Fast & clear", p: "A lighter, mobile-first front end and pricing you can actually read." },
  { h: "Deliverability you can see", p: "Per-mailbox reputation, suppression, and credit burn are first-class surfaces — not hidden." },
  { h: "A copilot that acts", p: "A conversational layer that proposes real actions and only runs them on your confirm." },
];

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <span className="font-heading text-lg font-semibold tracking-tight text-foreground">Velora</span>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start free
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
        <p className={EYEBROW}>Autonomous BDR · grounded in your data</p>
        <h1 className="mx-auto mt-4 max-w-3xl font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Outbound that does the work — grounded in real facts, honest about results.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Velora is a data-and-deliverability product that uses AI to write the words — not an AI
          gimmick. It pulls the right leads, grounds every message in verified facts, works to reach
          the inbox, and handles replies — with you in control.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start free
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* The honest 80/20 — our differentiator is candor. */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <p className={EYEBROW}>Results are earned, not promised</p>
          <p className="mt-4 text-lg text-foreground">
            About 80% of outbound is straightforward. The hard 20% — inbox deliverability, data
            accuracy, reply quality at scale — is made of time, real outcome data, and earned sender
            reputation. <span className="text-muted-foreground">No tool shortcuts it, including us.</span>{" "}
            We show you the real numbers instead of promising magic.
          </p>
        </div>
      </section>

      {/* Why we win */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center font-heading text-2xl font-semibold tracking-tight">Why teams pick Velora</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w) => (
            <div key={w.h} className="rounded-md border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">{w.h}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{w.p}</p>
            </div>
          ))}
        </div>
      </section>

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
