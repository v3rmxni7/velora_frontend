"use client";

import { motion } from "framer-motion";
import { Activity, Bot, FileText, Globe, Phone, Plug, ShieldCheck, Zap } from "lucide-react";
import { AvaAvatar } from "@/components/copilot/ava-avatar";
import { Reveal, useReducedMotionSafe } from "@/components/motion";

// The capability hub — our honest take on Artisan's signature "With Ava, it's easy" composition: their
// (fabricated human) Ava sat glowing at the centre with capabilities orbiting her. Ours puts the honest
// NON-human mascot at the centre, backlit, with Velora's REAL, shipped capabilities on faint concentric
// guide rings. No fabricated metrics — every pill is a live surface, and the footnote keeps the dry-run
// truth. Desktop = orbit; mobile = mascot + wrapped grid (the ring would be unreadable small).
//
// HONESTY: the amber `note` on a pill is Velora's established caveat token (dry-run in SignalHub/LiveDemo)
// — it flags where the truth is narrower than the headline. Ava runs the email LOOP autonomously, but she
// never dials (dialer-view: "the agent prepares briefs + queues leads — you place the call"), so Dialer
// carries "you dial". Autonomy is dry-run until the flags flip. The headline says "the loop", not "every
// motion", so the orbit reads as Velora's real surfaces — with the human-in-the-loop parts marked, not hidden.
const CAPS = [
  { icon: FileText, label: "Grounded drafting" },
  { icon: Activity, label: "Deliverability" },
  { icon: Zap, label: "Intent signals" },
  { icon: Globe, label: "Website visitors" },
  { icon: Phone, label: "Dialer", note: "you dial" },
  { icon: Plug, label: "CRM sync" },
  { icon: ShieldCheck, label: "Compliance" },
  { icon: Bot, label: "Autonomy", note: "dry-run" },
];

/** One-shot staggered settle for an orbit pill; a plain span under reduced motion. */
function OrbitEntrance({ index, children }: { index: number; children: React.ReactNode }) {
  const reduce = useReducedMotionSafe();
  if (reduce) return <>{children}</>;
  return (
    <motion.span
      className="inline-block"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.25 + index * 0.06 }}
    >
      {children}
    </motion.span>
  );
}

function Pill({
  icon: Icon,
  label,
  note,
}: {
  icon: (typeof CAPS)[number]["icon"];
  label: string;
  note?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
      <Icon className="size-3.5 shrink-0 text-indigo-300" aria-hidden />
      {label}
      {note ? <span className="text-amber-300/90">· {note}</span> : null}
    </span>
  );
}

export function AvaHub() {
  const n = CAPS.length;
  return (
    <section className="relative isolate overflow-hidden bg-hero-ink py-24 text-white lg:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-faint [mask-image:radial-gradient(60%_50%_at_50%_45%,black,transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-indigo-300">
              One agent · the whole loop
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Ava runs the loop — <span className="text-indigo-400">in the open.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 text-lg leading-relaxed text-white/60">
              Sourcing, verification, grounded drafting, deliverability, replies — one agent runs the
              loop. Every capability here is shipped, and held at dry-run until you say go.
            </p>
          </Reveal>
        </div>

        {/* Desktop — the orbit */}
        <Reveal delay={0.16} className="mt-20">
          <div className="relative mx-auto hidden aspect-square w-full max-w-[560px] sm:block">
            {/* Outer ring sits AT the pill radius (r≈40) so the pills rest on it; a faint inner ring
                gives concentric depth. */}
            <div className="absolute inset-[10%] rounded-full border border-white/[0.09]" aria-hidden />
            <div className="absolute inset-[26%] rounded-full border border-white/[0.06]" aria-hidden />
            {/* Radial spokes — the mascot at the centre, a faint line out to each capability on the ring. */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full"
              fill="none"
              aria-hidden
            >
              {CAPS.map((c, i) => {
                const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
                return (
                  <line
                    key={c.label}
                    x1={50 + Math.cos(angle) * 14}
                    y1={50 + Math.sin(angle) * 14}
                    x2={50 + Math.cos(angle) * 40}
                    y2={50 + Math.sin(angle) * 40}
                    stroke="#818cf8"
                    strokeOpacity="0.22"
                    strokeWidth="0.3"
                    strokeDasharray="0.8 1.5"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            {/* centre — backlit mascot hub */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[74px]"
                aria-hidden
              />
              <AvaAvatar active className="relative size-36" uid="avaHubD" />
            </div>
            {/* orbiting capabilities — pills settle onto the ring in sequence (clockwise from 12
                o'clock), matching the staggered rhythm every other multi-item section uses. One-shot
                entrance, no loop; reduced-motion renders them static. */}
            {CAPS.map((c, i) => {
              const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
              const r = 40; // ring % radius — kept off the edge so east/west pills clear the box
              return (
                <div
                  key={c.label}
                  className="absolute"
                  style={{
                    left: `${50 + Math.cos(angle) * r}%`,
                    top: `${50 + Math.sin(angle) * r}%`,
                    transform: "translate(-50%,-50%)",
                  }}
                >
                  <OrbitEntrance index={i}>
                    <Pill icon={c.icon} label={c.label} note={c.note} />
                  </OrbitEntrance>
                </div>
              );
            })}
          </div>

          {/* Mobile — mascot + wrapped grid */}
          <div className="flex flex-col items-center gap-7 sm:hidden">
            <div className="relative">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[50px]"
                aria-hidden
              />
              <AvaAvatar active className="relative size-24" uid="avaHubM" />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {CAPS.map((c) => (
                <Pill key={c.label} icon={c.icon} label={c.label} note={c.note} />
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.22}>
          <p className="mt-12 text-center font-mono text-[11px] text-white/60">
            every capability shown is shipped · dry-run by default · nothing sends until you flip the switch
          </p>
        </Reveal>
      </div>
    </section>
  );
}
