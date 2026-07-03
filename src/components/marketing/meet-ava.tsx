"use client";

import { AvaAvatar } from "@/components/copilot/ava-avatar";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

// "Meet Ava" — Artisan frames their Ava as a hireable human you can "interview live" (a fabricated
// person). Our honest inversion: you're meeting the INSTRUMENT, not a person. The mascot is a small
// supporting mark by the eyebrow (the backlit orbit in the next section is the single mascot
// centerpiece); the four real invariants that gate the product carry the section as a 2×2 card grid.
const TRAITS = [
  {
    title: "Grounded, or it doesn't ship",
    body: "Drafts only from verified facts — or falls back to a safe template. Never invents a detail to sound sharp.",
  },
  {
    title: "Dry-run by default",
    body: "Nothing sends until you deliberately flip the switch. A new workspace can't reach a real inbox.",
  },
  {
    title: "Honest numbers",
    body: "Shows you the real reply and deliverability numbers — and leaves them honestly empty until they're earned.",
  },
  {
    title: "Autonomous, never unaccountable",
    body: "Works the queue on its own when you want it — and one click pauses everything, instantly.",
  },
];

export function MeetAva() {
  return (
    <section className="relative overflow-hidden bg-background py-24 lg:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal className="flex items-center justify-center gap-2.5">
            <span className="relative inline-flex size-9 items-center justify-center rounded-xl border border-border bg-gradient-to-b from-muted/60 to-background shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
              <AvaAvatar className="relative size-6" uid="avaMeet" />
            </span>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
              Meet Ava · instrument, not a person
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              An autonomous BDR you can actually trust.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Ava isn&rsquo;t a person — she&rsquo;s an instrument. She sources, verifies, drafts, and
              follows up across the whole loop, and never fabricates to look good. Here&rsquo;s the deal
              she works under:
            </p>
          </Reveal>
        </div>

        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2" gap={0.09}>
          {TRAITS.map((t) => (
            <StaggerItem key={t.title}>
              <div className="h-full rounded-lg border border-border bg-card p-5 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-elevated">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  <h3 className="font-heading text-base font-semibold text-foreground">{t.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
