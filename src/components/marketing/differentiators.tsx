"use client";

import { ShieldCheck, Gauge, Lock, Sparkles } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

// A1b — the real differentiators, grounded in the backend audit (not generic SaaS claims). Each is
// TRUE and load-bearing: source-binding + template-instead-of-guess, deliverability surfaced not
// promised, the two-flag dry-run default, and a copilot that only acts on confirm. No fabricated
// metrics; no inbox/result guarantees. Cards lift on hover (micro-interaction); grid staggers in.

const ITEMS = [
  {
    icon: ShieldCheck,
    title: "Grounded, not guessed",
    body: "Facts are dropped unless they trace to a source you provided, and the draft is scanned by automated rules for unsupported hard claims. When there aren't enough verified, lead-specific facts, Velora sends a safe template instead of inventing one.",
  },
  {
    icon: Gauge,
    title: "Deliverability you can see",
    body: "Per-mailbox reputation, suppression, and credit burn are first-class surfaces — not buried. We never promise inbox placement; we show you the real numbers.",
  },
  {
    icon: Lock,
    title: "Safe by default",
    body: "New workspaces are dry-run only. Nothing reaches a real inbox until two flags are deliberately flipped — a step a logged-in user, or the copilot, simply can't take.",
  },
  {
    icon: Sparkles,
    title: "A copilot that acts",
    body: "A conversational layer that proposes real actions and runs them only on your confirm — it never sends on its own.",
  },
];

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.14em] text-primary";

export function Differentiators() {
  return (
    <section className="border-y border-border bg-card py-24 lg:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <p className={EYEBROW}>Why teams pick Velora</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            The wedge is data, deliverability, and candor.
          </h2>
        </Reveal>

        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2" gap={0.09}>
          {ITEMS.map((it) => (
            <StaggerItem key={it.title}>
              <div className="group h-full rounded-lg border border-border bg-background p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card hover:shadow-elevated">
                <div className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground ring-1 ring-primary/10 transition-transform duration-200 group-hover:scale-105">
                  <it.icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">{it.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{it.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
