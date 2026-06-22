"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { FadeIn, Parallax } from "@/components/motion";
import { GroundedDraftShowcase } from "./grounded-draft-showcase";

// Tier A / A1a — the dark marketing hero. Velora identity throughout: ink→indigo backdrop
// (.bg-hero-ink, now a two-bloom mesh), faint grid, Bricolage display headline with a white sheen,
// IBM Plex Mono eyebrow/callouts, indigo accent, 6px radius. DEPTH: blurred indigo blooms + a backing
// surface panel under the real product card, layered .shadow-product, scroll parallax (card drifts
// vs. static blooms). Honest by construction: the centerpiece is the real grounded-draft format and
// the callouts are real mechanics — never fabricated logos, testimonials, or result metrics. All
// entrance/parallax motion is reduced-motion-safe (FadeIn / Parallax no-op under prefers-reduced-motion).

const CALLOUTS = ["grounded on verified facts", "dry-run until you say go", "deliverability you can see"];

// Animated-underline nav link (the underline wipes in on hover — a small premium tell).
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative rounded-md px-3 py-1.5 text-sm text-white/70 transition-colors hover:text-white"
    >
      {children}
      <span
        className="pointer-events-none absolute inset-x-3 -bottom-px h-px origin-left scale-x-0 bg-white/50 transition-transform duration-200 ease-out group-hover:scale-x-100"
        aria-hidden
      />
    </Link>
  );
}

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
            <NavLink href="#how">How it works</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="/login">Sign in</NavLink>
            <Link
              href="/signup"
              className="ml-1 rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-glow-indigo transition-all duration-200 hover:-translate-y-px hover:bg-primary/90"
            >
              Start free
            </Link>
          </div>
        </nav>

        {/* Hero grid */}
        <div className="grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-20 lg:pt-20">
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
                Velora grounds every message in verified facts, works to reach the inbox, and shows you
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
                  href="#how"
                  className="rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
                >
                  See how it works
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
            {/* Indigo blooms behind the card (static — the card drifts past them on scroll). */}
            <div className="pointer-events-none absolute -inset-8" aria-hidden>
              <div className="absolute right-2 top-0 size-72 rounded-full bg-primary/30 blur-[90px]" />
              <div className="absolute -left-4 bottom-6 size-56 rounded-full bg-indigo-400/20 blur-[80px]" />
            </div>

            <Parallax distance={34} className="relative">
              {/* A backing surface panel — pure decoration, gives the card a second layer of depth. */}
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

        {/* Scroll cue — signals there's more below, and fills the foot of the hero. */}
        <FadeIn delay={0.4}>
          <div className="hidden justify-center pb-10 lg:flex">
            <Link
              href="#how"
              className="flex flex-col items-center gap-1.5 text-white/40 transition-colors hover:text-white/70"
              aria-label="Scroll to see how it works"
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
