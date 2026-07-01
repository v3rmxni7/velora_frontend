"use client";

import { AvaAvatar } from "@/components/copilot/ava-avatar";
import { Reveal } from "@/components/motion";

// "Meet Ava" — Artisan frames their Ava as a hireable human you can "interview live" (a fabricated
// person). Our honest inversion: you're meeting the INSTRUMENT, not a person. The mascot sits in a
// calm framed presence; the copy states plainly she isn't human and never fabricates — the traits are
// the real invariants that already gate the product (grounded-or-template, dry-run, honest-empty, pause).
const TRAITS = [
  "Drafts only from verified facts — or falls back to a safe template. Never invents a detail to sound sharp.",
  "Dry-run by default. Nothing sends until you deliberately flip the switch.",
  "Shows you the real numbers — and leaves them honestly empty until they're earned.",
  "Autonomous when you want it. One click pauses everything, instantly.",
];

export function MeetAva() {
  return (
    <section className="relative overflow-hidden bg-background py-24 lg:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* The presence — the mascot in a calm frame (a nod to Artisan's "portal", made honest) */}
        <Reveal className="flex justify-center">
          <div className="relative flex size-60 items-center justify-center rounded-4xl border border-border bg-gradient-to-b from-muted/50 to-background shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[52px]"
              aria-hidden
            />
            <AvaAvatar active className="relative size-32" />
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-border bg-background/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground backdrop-blur-sm">
              Ava · instrument, not a person
            </span>
          </div>
        </Reveal>

        {/* Who she is */}
        <div>
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">Meet Ava</p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              An autonomous BDR you can actually trust.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Ava isn&rsquo;t a person — she&rsquo;s an instrument. She sources, verifies, drafts, and
              follows up across the whole loop, and she never fabricates to look good. Here&rsquo;s the
              deal she works under:
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <ul className="mt-6 space-y-3">
              {TRAITS.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] leading-relaxed text-foreground/80">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
