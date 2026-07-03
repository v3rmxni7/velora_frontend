"use client";

import { motion } from "framer-motion";
import { Reveal, useReducedMotionSafe } from "@/components/motion";

// S4 — the signal hub: a node-graph that FANS IN. Re-themed from the 21st.dev `Pulse Beams` technique
// (two stacked SVG paths — a faint base + a bright overlay whose <motion.linearGradient> coordinates
// sweep along the path = a traveling pulse of light — plus connection-point circles). Kept to ONE
// accent (indigo monochrome, our craft law) and ONE ambient loop (the inbound pulses).
//
// HONESTY: a literal "every channel OUT" fan-out would overclaim multi-channel sending — only email is
// live today (LinkedIn/etc. are deferred placeholders elsewhere). So this inverts the motif to what's
// actually true: many REAL sources fan IN → Velora grounds ONE draft → it leaves as a single email,
// held at dry-run. The roadmap note keeps the channel story honest.

const SOURCES = [
  { label: "Lists", y: 60 },
  { label: "Intent signals", y: 145 },
  { label: "Website visits", y: 230 },
  { label: "CRM contacts", y: 315 },
  { label: "Proof points", y: 400 },
];

// Geometry (viewBox 0 0 960 460): sources at x=180 → hub at (480,230) → the output email card
// (centred at 760,230). The beam ends at the card's left edge (686) so the eye lands ON the payoff.
const HUB = { x: 480, y: 230 };
const OUT = { x: 760, y: 230 };
const SRC_X = 180;
const CARD = { x: 686, y: 176, w: 148, h: 108 }; // the grounded-email glyph, left edge = beam target
const beamPath = (sy: number) => `M${SRC_X} ${sy} C 330 ${sy} 330 ${HUB.y} ${HUB.x} ${HUB.y}`;
const OUT_PATH = `M${HUB.x} ${HUB.y} C 590 ${HUB.y} 610 ${HUB.y} ${CARD.x} ${HUB.y}`;

// All beams run left→right; the gradient sweeps its bright band across the viewport. Staggered by index.
function gradAnimate(i: number) {
  return {
    initial: { x1: "0%", x2: "8%", y1: "0%", y2: "0%" },
    animate: { x1: ["0%", "100%"], x2: ["8%", "108%"] },
    transition: {
      duration: 1.8,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear" as const,
      repeatDelay: 1.3,
      delay: i * 0.45,
    },
  };
}

function GradientStops() {
  return (
    <>
      <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
      <stop offset="35%" stopColor="#818cf8" stopOpacity="0.9" />
      <stop offset="50%" stopColor="#c7d2fe" stopOpacity="1" />
      <stop offset="65%" stopColor="#6366f1" stopOpacity="0.9" />
      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
    </>
  );
}

function FanInSvg() {
  const reduce = useReducedMotionSafe();
  const allPaths = [...SOURCES.map((s) => beamPath(s.y)), OUT_PATH];
  return (
    <svg
      viewBox="0 0 960 460"
      fill="none"
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Velora pulls from lists, intent signals, website visits, CRM contacts and your proof points, grounds one draft, and sends a single email held at dry-run."
    >
      {/* Beams: faint base + (animated or static) bright overlay. The outbound beam (last path, into
          the card) is a touch heavier so the eye completes the journey to the payoff. */}
      {allPaths.map((d, i) => {
        const isOutput = i === SOURCES.length;
        return (
          <g key={d}>
            <path d={d} stroke="#4f46e5" strokeOpacity="0.16" strokeWidth="1" />
            <path
              d={d}
              stroke={reduce ? "#6366f1" : `url(#fanGrad${i})`}
              strokeOpacity={reduce ? 0.4 : 1}
              strokeWidth={isOutput ? 2.5 : 2}
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {/* Source nodes + labels (mono = data voice). */}
      {SOURCES.map((s) => (
        <g key={s.label}>
          <circle cx={SRC_X} cy={s.y} r="6.5" fill="#0b0d12" stroke="#6366f1" strokeWidth="1.5" />
          <text
            x={SRC_X - 18}
            y={s.y}
            dy="0.32em"
            textAnchor="end"
            className="fill-white/70 font-mono"
            fontSize="14"
          >
            {s.label}
          </text>
        </g>
      ))}

      {/* The hub — Velora. Glow ring + node + wordmark. */}
      <circle cx={HUB.x} cy={HUB.y} r="40" fill="#6366f1" fillOpacity="0.10" />
      <circle cx={HUB.x} cy={HUB.y} r="26" fill="#0b0d12" stroke="#6366f1" strokeWidth="1.5" />
      <text
        x={HUB.x}
        y={HUB.y}
        dy="0.34em"
        textAnchor="middle"
        className="fill-white font-heading"
        fontSize="16"
        fontWeight="600"
      >
        Velora
      </text>

      {/* Output — ONE grounded email, held at dry-run. A compact card glyph (not a lone dot) echoing
          the hero's grounded-draft artifact: subject bar, body lines, and the amber dry-run chip that
          is the product's signature honest token. This is the payoff the whole fan-in leads to. */}
      <text
        x={OUT.x}
        y={CARD.y - 12}
        textAnchor="middle"
        className="fill-white/85 font-mono"
        fontSize="14"
      >
        one grounded email
      </text>
      <rect
        x={CARD.x}
        y={CARD.y}
        width={CARD.w}
        height={CARD.h}
        rx="12"
        fill="#0b0d12"
        stroke="#6366f1"
        strokeWidth="1.5"
      />
      {/* subject bar */}
      <rect x={CARD.x + 16} y={CARD.y + 18} width="96" height="8" rx="4" fill="#c7d2fe" opacity="0.9" />
      {/* body lines */}
      <rect x={CARD.x + 16} y={CARD.y + 38} width="116" height="5" rx="2.5" fill="#818cf8" opacity="0.4" />
      <rect x={CARD.x + 16} y={CARD.y + 50} width="104" height="5" rx="2.5" fill="#818cf8" opacity="0.4" />
      <rect x={CARD.x + 16} y={CARD.y + 62} width="88" height="5" rx="2.5" fill="#818cf8" opacity="0.4" />
      {/* amber dry-run chip — the signature honest token */}
      <rect
        x={CARD.x + 16}
        y={CARD.y + 78}
        width="72"
        height="16"
        rx="8"
        fill="#f59e0b"
        fillOpacity="0.1"
        stroke="#f59e0b"
        strokeOpacity="0.55"
        strokeWidth="1"
      />
      <text
        x={CARD.x + 52}
        y={CARD.y + 86}
        dy="0.32em"
        textAnchor="middle"
        className="fill-amber-400/90 font-mono"
        fontSize="10"
      >
        dry-run
      </text>

      {!reduce && (
        <defs>
          {allPaths.map((d, i) => {
            const g = gradAnimate(i);
            return (
              <motion.linearGradient
                key={d}
                id={`fanGrad${i}`}
                gradientUnits="userSpaceOnUse"
                initial={g.initial}
                animate={g.animate}
                transition={g.transition}
              >
                <GradientStops />
              </motion.linearGradient>
            );
          })}
        </defs>
      )}
    </svg>
  );
}

// Mobile fallback (sm:hidden) — the SVG would scale to unreadable labels on phones, so render the same
// honest story as a compact stacked column instead. Static (matches reduced-motion intent).
function FanInStacked() {
  return (
    <div className="mx-auto flex max-w-xs flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        {SOURCES.map((s) => (
          <span
            key={s.label}
            className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-white/70"
          >
            {s.label}
          </span>
        ))}
      </div>
      <div className="h-6 w-px bg-gradient-to-b from-primary/60 to-primary/10" aria-hidden />
      <div className="flex size-16 items-center justify-center rounded-full border border-primary/40 bg-[#0b0d12] font-heading text-base font-semibold text-white shadow-glow-indigo">
        Velora
      </div>
      <div className="h-6 w-px bg-gradient-to-b from-primary/40 to-amber-400/40" aria-hidden />
      <span className="rounded-full border border-amber-500/30 bg-amber-500/[0.06] px-3 py-1 font-mono text-[11px] text-amber-300">
        grounded email · dry-run
      </span>
    </div>
  );
}

export function SignalHub() {
  return (
    <section id="integrations" className="relative isolate overflow-hidden bg-hero-ink py-24 text-white lg:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-faint [mask-image:radial-gradient(60%_50%_at_50%_45%,black,transparent)]"
        aria-hidden
      />
      {/* One soft bloom behind the hub. */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-0 size-[36rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/[0.10] blur-[120px]" aria-hidden />

      <div className="relative mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-indigo-300">The hub</p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Every source you trust — one message you can stand behind.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 text-lg leading-relaxed text-white/60">
              Lists, live intent, site visits, your CRM, your proof points — Velora draws on all of them,
              grounds a single draft, and holds it at dry-run until you flip the switch.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.16} className="mt-14">
          <div className="hidden sm:block">
            <FanInSvg />
          </div>
          <div className="sm:hidden">
            <FanInStacked />
          </div>
        </Reveal>

        <Reveal delay={0.22}>
          <p className="mt-10 text-center font-mono text-[11px] text-white/70">
            email is live today · other channels are on the roadmap, and we label them honestly
          </p>
        </Reveal>
      </div>
    </section>
  );
}
