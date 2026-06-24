"use client";

import { Reveal, Parallax } from "@/components/motion";

// A1b — the honesty manifesto. This is Velora's "social proof" slot, filled honestly: no logos, no
// testimonials, no metrics — the candor itself is the proof. A dark ink band bookends the hero. The
// 80/20 framing is kept verbatim in spirit ("No tool shortcuts it, including us"); SPEC §1/§11.

export function Honesty() {
  return (
    <section id="honesty" className="relative isolate overflow-hidden bg-hero-ink py-24 text-white lg:py-32">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-faint [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]"
        aria-hidden
      />
      <Parallax distance={40} className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 justify-center">
        <div className="size-[30rem] rounded-full bg-primary/15 blur-[120px]" aria-hidden />
      </Parallax>

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-indigo-300">
            Results are earned, not promised
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-6 font-heading text-2xl font-medium leading-snug tracking-tight text-white sm:text-[2rem] sm:leading-[1.25]">
            About <span className="text-gradient-indigo">80% of outbound</span> is straightforward.
            The hard 20% — inbox deliverability, data accuracy, reply quality at scale — is made of
            time, real outcome data, and earned sender reputation.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/55">
            <span className="font-medium text-indigo-300">No tool shortcuts it — including us.</span>{" "}
            We show you the real numbers instead of promising magic.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
