"use client";

import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

// A1c — pricing. The three real §10 tiers, kept VERBATIM (Starter $249 / Growth $699 featured /
// Scale $1,999, with their exact credits + leads + blurbs). Featured tier is elevated with the
// indigo glow + ring + badge (no fake "save N%"). Honest closing note: dry-run by default. Cards
// lift on hover; the grid staggers in. No fabricated discounts, urgency, or social proof.

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

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.14em] text-primary";

export function Pricing() {
  return (
    <section id="pricing" className="relative bg-background py-24 lg:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <p className={EYEBROW}>Pricing</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Clear, metered pricing.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            AI &amp; data work is metered in credits; sending infrastructure is billed in dollars. No
            credit-maze.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid gap-5 sm:grid-cols-3" gap={0.09}>
          {TIERS.map((t) => (
            <StaggerItem key={t.name}>
              <div
                className={`group relative flex h-full flex-col rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 ${
                  t.featured
                    ? "border-primary/40 shadow-glow-indigo ring-1 ring-primary/15"
                    : "border-border hover:border-primary/20 hover:shadow-elevated"
                }`}
              >
                {t.featured && (
                  <span className="absolute -top-2.5 right-5 rounded-full border border-primary/30 bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
                    popular
                  </span>
                )}
                <span className="font-heading text-lg font-semibold text-foreground">{t.name}</span>
                <p className="mt-3 font-mono text-3xl tabular-nums text-foreground">
                  ${t.price.toLocaleString()}
                  <span className="text-sm text-muted-foreground">/mo</span>
                </p>
                <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                  {t.credits} · {t.leads}
                </p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{t.blurb}</p>
                <Link
                  href="/signup"
                  className={`mt-6 block rounded-md px-3 py-2.5 text-center text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                    t.featured
                      ? "bg-primary text-primary-foreground shadow-glow-indigo hover:bg-primary/90"
                      : "border border-border text-foreground hover:border-primary/30 hover:bg-accent"
                  }`}
                >
                  Start free
                </Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1}>
          <p className="mt-7 text-center font-mono text-[11px] text-muted-foreground">
            Every workspace is dry-run by default — you see grounded drafts before a single real send.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
