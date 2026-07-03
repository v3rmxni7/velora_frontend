"use client";

import { ChevronDown } from "lucide-react";
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
    blurb: "Solo or small team. Email-first.",
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

// Tiers differ by VOLUME only (credits + leads/mo) — every tier ships the full product. Listing these
// shared capabilities is the honest way to fill the "what do I actually get" gap without inventing
// per-tier feature gates that don't exist. All are real, shipped surfaces.
const INCLUDED = [
  "Grounded drafting + automated verification",
  "Dry-run by default — a deliberate two-flag go-live",
  "Deliverability surfaces: per-mailbox reputation + suppression",
  "The full loop: tasks, inbox, dialer queue, follow-ups",
  "Analytics with honest-empty states (never fabricated)",
  "A copilot that proposes — you confirm every write",
  "Compliance: immutable audit log + suppression",
  "Autonomy guardrails: volume caps + anomaly auto-pause",
];

// Real answers to the questions a buyer actually has. Everything here is true of the shipped model.
const FAQ = [
  {
    q: "What's a credit?",
    a: "AI and data work is metered in credits. One credit is roughly one sourced-and-verified lead, or one live cold send at current pricing. Your plan's monthly allowance is the credits figure above.",
  },
  {
    q: "Do dry-runs burn credits?",
    a: "No. Reviewing grounded drafts in dry-run is free and unlimited — credits are only consumed by lead sourcing/verification and live sends. Every workspace stays in dry-run until you deliberately enable sending.",
  },
  {
    q: "What's metered in credits vs billed in dollars?",
    a: "AI + data work (sourcing, verification, drafting, sends) is metered in credits. Sending infrastructure — the mailboxes and domains you run through your provider — is billed in dollars. No credit-maze conversions between the two.",
  },
  {
    q: "What happens when I run low on credits?",
    a: "You get a low-balance warning first, and live sends then pause with an honest “insufficient credit” state rather than failing silently. Nothing is ever sent without the credits to cover it.",
  },
  {
    q: "How do the tiers differ?",
    a: "By volume only. Every tier includes the full product — the capabilities listed above. Higher tiers include more monthly credits and lead capacity; that's the whole difference.",
  },
  {
    q: "Can I stay in dry-run forever?",
    a: "Yes. Dry-run is the default with no time limit — you can evaluate grounded drafts indefinitely. Going live is a deliberate step you take when you're ready.",
  },
];

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
          <p className="mt-6 text-center font-mono text-[11px] text-muted-foreground">
            1 credit ≈ one sourced-and-verified lead, or one live send · dry-runs are free · dry-run by
            default until you go live
          </p>
        </Reveal>

        {/* Every tier includes — the honest "what do I get" answer (tiers differ by volume only). */}
        <Reveal delay={0.12} className="mt-12">
          <div className="rounded-xl border border-border bg-card p-6 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] sm:p-8">
            <p className={EYEBROW}>Every tier includes</p>
            <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/80">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* FAQ — native <details> disclosures (accessible, zero-JS, SSR-safe). */}
        <div className="mx-auto mt-14 max-w-3xl">
          <Reveal>
            <h3 className="text-center font-heading text-2xl font-semibold tracking-tight text-foreground">
              Questions, answered honestly.
            </h3>
          </Reveal>
          <Reveal delay={0.06} className="mt-6">
            <div className="rounded-xl border border-border bg-card px-5 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] sm:px-6">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group border-b border-border py-4 last:border-b-0"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown
                      className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
