"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion";

// A1c — the closing CTA. A dark ink band that bookends the hero (same .bg-hero-ink + faint grid +
// CTA micro-interactions). Honest copy only: "see grounded drafts before a single send" mirrors the
// real dry-run-by-default behaviour. No fabricated urgency, no fake guarantees.

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-hero-ink py-24 text-white lg:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-faint [mask-image:radial-gradient(70%_60%_at_50%_50%,black,transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Start in minutes.
          </h2>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/65">
            Create a workspace, connect your knowledge base, and see grounded drafts before a single
            send.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow-indigo transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_0_0_1px_rgba(79,70,229,0.45),0_18px_44px_-14px_rgba(79,70,229,0.75)]"
            >
              Start free
              <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
                →
              </span>
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
