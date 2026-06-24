"use client";

import { Stagger, StaggerItem } from "@/components/motion";

// Replaces Artisan's fabricated aggregate stat-counters ("1,247 meetings booked…") with four
// VERIFIABLE product invariants — each a real guarantee from the build, not an outcome claim.
// Rendered on the evidence-rail motif (indigo left spine) so the brand's signature recurs here
// instead of dying in the hero. Mono labels = the data/evidence voice. Overlaps the hero seam.
// HONESTY: no numbers presented as results; these are mechanics, true by construction.

const INVARIANTS = [
  {
    label: "two-flag send gate",
    claim: "Every real send waits behind two deliberate flags — dry-run by default.",
  },
  {
    label: "grounded or it doesn't ship",
    claim: "Personalized drafts cite the verified facts they used — or fall back to a safe template.",
  },
  {
    label: "honest metering",
    claim: "Credits burn only on live cold sends — never on a dry-run.",
  },
  {
    label: "halt on reply",
    claim: "A reply pauses the sequence instantly — the agent never talks over a human.",
  },
];

export function InvariantStrip() {
  return (
    <section className="relative z-10 bg-background">
      <div className="mx-auto -mt-12 max-w-5xl px-6">
        <Stagger
          className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border shadow-elevated sm:grid-cols-2 lg:grid-cols-4"
          gap={0.08}
        >
          {INVARIANTS.map((it) => (
            <StaggerItem key={it.label} className="bg-card">
              <div className="h-full border-l-[3px] border-primary p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                  {it.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{it.claim}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
          the proof is the mechanism — not a number we made up
        </p>
      </div>
    </section>
  );
}
