"use client";

import Link from "next/link";
import { FadeIn } from "@/components/motion";
import { GroundedDraftShowcase } from "./grounded-draft-showcase";

// A2 — the shared auth split-screen. LEFT: a branded instrument panel (dark ink + mesh blooms +
// faint grid) where the REAL product artifact greets you — the same grounded-draft centerpiece +
// evidence rail from the hero, glowing on dark. RIGHT: the form (passed as children), clean on the
// light surface. The panel is decorative and hidden below lg, so mobile shows just the form. This
// is PRESENTATION ONLY — the auth pages keep all their wiring, state, redirects, and error copy.

const CHIPS = ["grounded on verified facts", "dry-run by default", "deliverability you can see"];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      {/* Left — the branded panel. Decorative; hidden on mobile. */}
      <aside className="relative hidden overflow-hidden bg-hero-ink p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div
          className="pointer-events-none absolute inset-0 bg-grid-faint [mask-image:radial-gradient(80%_60%_at_30%_0%,black,transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-12 top-8 size-80 rounded-full bg-primary/20 blur-[110px]"
          aria-hidden
        />

        <FadeIn className="relative">
          <Link
            href="/"
            className="rounded-md font-heading text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            Velora
          </Link>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-indigo-300">
            Autonomous BDR · grounded in your data
          </p>
        </FadeIn>

        <FadeIn delay={0.12} className="relative">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
            a grounded draft · ready for your review
          </p>
          <GroundedDraftShowcase />
        </FadeIn>

        <FadeIn delay={0.2} className="relative">
          <p className="max-w-sm font-heading text-2xl font-semibold leading-snug tracking-tight">
            Outbound that <span className="text-indigo-400">earns</span> its replies.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-white/55"
              >
                <span className="size-1 rounded-full bg-indigo-400" aria-hidden />
                {c}
              </span>
            ))}
          </div>
        </FadeIn>
      </aside>

      {/* Right — the form, clean on the light surface. */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}
