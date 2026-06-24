"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ElegantShape, FadeIn, Parallax } from "@/components/motion";
import { GroundedDraftShowcase } from "./grounded-draft-showcase";

// The dark marketing hero. Velora identity: ink→indigo backdrop (.bg-hero-ink mesh), faint grid,
// THREE soft indigo ElegantShapes drifting in the negative-space margins for floating depth (one
// gentle loop each — re-themed monochrome from the 21st.dev reference, reduced-motion-safe), the
// Bricolage display headline with a white sheen, IBM Plex Mono eyebrow/callouts, the REAL grounded-
// draft card as the centerpiece (lifted + parallaxed). Nav lives in <MarketingNav/> (fixed), so the
// content clears 64px of nav. Honest by construction — no fabricated logos/testimonials/result stats.

const CALLOUTS = ["grounded on verified facts", "dry-run until you say go", "deliverability you can see"];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-hero-ink text-white">
      {/* Faint grid backdrop, fading in from the top. */}
      <div
        className="pointer-events-none absolute inset-0 bg-grid-faint [mask-image:radial-gradient(75%_55%_at_50%_0%,black,transparent)]"
        aria-hidden
      />
      {/* Floating indigo depth — a small fixed set in the margins (never behind the headline/card). */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <ElegantShape className="left-[-7%] top-[16%]" width={360} height={92} rotate={-12} delay={0.2} />
        <ElegantShape className="right-[-5%] top-[26%]" width={300} height={80} rotate={14} delay={0.35} />
        <ElegantShape className="bottom-[8%] left-[6%]" width={220} height={64} rotate={8} delay={0.5} />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Hero grid — pt clears the fixed nav (h-16). */}
        <div className="grid items-center gap-12 pb-16 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-24 lg:pt-32">
          {/* Left — copy */}
          <div>
            <FadeIn>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-indigo-300">
                Autonomous BDR · grounded in your data
              </p>
            </FadeIn>
            <FadeIn delay={0.06}>
              <h1 className="mt-4 bg-gradient-to-b from-white via-white to-white/60 bg-clip-text font-heading text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-transparent sm:text-5xl lg:text-[4rem]">
                Outbound that <span className="text-indigo-400">earns</span> its replies.
              </h1>
            </FadeIn>
            <FadeIn delay={0.12}>
              <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-white/65">
                Velora drafts every message from verified facts, works to reach the inbox, and shows you
                the real numbers — autonomous when you want it, and dry-run until you say go.
              </p>
            </FadeIn>
            <FadeIn delay={0.18}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
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
                  href="#demo"
                  className="rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
                >
                  See it draft, live
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.24}>
              <div className="mt-8 flex flex-wrap gap-2">
                {CALLOUTS.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="size-1 rounded-full bg-indigo-400" aria-hidden />
                    {c}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right — the real product artifact, lifted off the dark hero with depth + parallax */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-8" aria-hidden>
              <div className="absolute right-2 top-0 size-72 rounded-full bg-primary/30 blur-[90px]" />
              <div className="absolute -left-4 bottom-6 size-56 rounded-full bg-indigo-400/20 blur-[80px]" />
            </div>

            <Parallax distance={34} className="relative">
              <div
                className="absolute -right-3 -top-3 h-full w-full rounded-xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                aria-hidden
              />
              <FadeIn delay={0.2} y={20} className="relative">
                <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                  a grounded draft · the actual format
                </p>
                <GroundedDraftShowcase />
              </FadeIn>
            </Parallax>
          </div>
        </div>

        {/* Scroll cue — into the live demo. */}
        <FadeIn delay={0.4}>
          <div className="hidden justify-center pb-10 lg:flex">
            <Link
              href="#demo"
              className="flex flex-col items-center gap-1.5 text-white/40 transition-colors hover:text-white/70"
              aria-label="Scroll to the live demo"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]">scroll</span>
              <ChevronDown className="size-4 animate-nudge" aria-hidden />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
