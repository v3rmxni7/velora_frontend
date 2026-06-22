"use client";

import Link from "next/link";
import { FadeIn } from "@/components/motion";
import { GroundedDraftShowcase } from "./grounded-draft-showcase";

// Tier A / A1a — the dark marketing hero. Velora identity throughout: ink→indigo backdrop
// (.bg-hero-ink), faint grid, Bricolage display headline, IBM Plex Mono eyebrow/callouts, indigo
// accent, 6px radius. Honest by construction: the centerpiece is the real grounded-draft format and
// the callouts are real mechanics (grounded facts / dry-run / visible deliverability) — never
// fabricated logos, testimonials, or result metrics. Entrance motion is reduced-motion-safe (FadeIn).

const CALLOUTS = ["grounded on verified facts", "dry-run until you say go", "deliverability you can see"];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-hero-ink text-white">
      {/* Faint grid backdrop, fading in from the top. */}
      <div
        className="pointer-events-none absolute inset-0 bg-grid-faint [mask-image:radial-gradient(75%_55%_at_50%_0%,black,transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Nav (over the dark hero) */}
        <nav className="flex h-16 items-center justify-between">
          <span className="font-heading text-lg font-semibold tracking-tight text-white">Velora</span>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="#pricing"
              className="rounded-md px-3 py-1.5 text-sm text-white/70 transition-colors hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-sm text-white/70 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start free
            </Link>
          </div>
        </nav>

        {/* Hero grid */}
        <div className="grid items-center gap-12 pb-24 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:pb-32 lg:pt-20">
          {/* Left — copy */}
          <div>
            <FadeIn>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-indigo-300">
                Autonomous BDR · grounded in your data
              </p>
            </FadeIn>
            <FadeIn delay={0.06}>
              <h1 className="mt-4 font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Outbound that <span className="text-indigo-400">earns</span> its replies.
              </h1>
            </FadeIn>
            <FadeIn delay={0.12}>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/65">
                Velora grounds every message in verified facts, works to reach the inbox, and shows you
                the real numbers — autonomous when you want it, and dry-run until you say go.
              </p>
            </FadeIn>
            <FadeIn delay={0.18}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/signup"
                  className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow-indigo transition-colors hover:bg-primary/90"
                >
                  Start free
                </Link>
                <Link
                  href="#how"
                  className="rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  See how it works
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.24}>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
                {CALLOUTS.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white/50">
                    <span className="size-1 rounded-full bg-indigo-400" aria-hidden />
                    {c}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right — the real product artifact (a light card lifted off the dark hero) */}
          <FadeIn delay={0.2} y={18}>
            <div className="relative">
              <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                a grounded draft · the actual format
              </p>
              <GroundedDraftShowcase />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
