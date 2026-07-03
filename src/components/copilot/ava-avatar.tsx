"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/utils";

// Ava's mascot — "the instrument-being": a calm, dimensional, honest NON-HUMAN AI presence. A confident
// rounded indigo head with a backlit two-layer aura, a glassy specular + spherical volume, a calm
// catchlight gaze (NO cartoon smile), and a single floating spark crown (Velora's spark/evidence motif).
// Deliberately not a human face — the honesty stance rejects fabricated people. Self-contained inline
// SVG, crisp from ~20px up, light + dark. Decorative (aria-hidden) — pair with the visible "Ava" label.
//
// Motion (Framer Motion, reduced-motion-safe): a rare, quick BLINK gives ambient life; when `active`
// (thinking / drawer open) the spark gently pulses and the aura breathes. prefers-reduced-motion →
// fully still. Props unchanged (className / iconClassName / active) so both call sites stay drop-in.
export function AvaAvatar({
  className,
  active = false,
  uid: uidProp,
}: {
  className?: string;
  /** Retained for call-site compatibility; the mascot SVG scales with `className`. */
  iconClassName?: string;
  active?: boolean;
  /**
   * Stable per-instance id for the SVG defs — pass a unique literal at every call site. useId is
   * NOT hydration-safe in the app shell (server/client trees can diverge above this component →
   * mismatched ids leave url(#…) gradient/filter refs dangling + a console hydration error).
   */
  uid?: string;
}) {
  // Fallback only; url(#…) resolves reliably with alphanumerics — strip everything else.
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const uid = uidProp ?? reactId;
  const reduce = useReducedMotion();
  const live = active && !reduce;
  const [c0, c1, c2] = active ? ["#c4ceff", "#4f46e5", "#312e81"] : ["#b0bcfc", "#4f46e5", "#37309e"];
  const oOut = active ? 0.42 : 0.26;
  const oIn = active ? 0.48 : 0.3;
  const spark = active ? "#eef2ff" : "#c7d2fe";
  const g = `${uid}g`;
  const clip = `${uid}c`;
  const soft = `${uid}s`;
  const tight = `${uid}t`;

  return (
    <span
      aria-hidden
      className={cn("relative inline-flex size-6 shrink-0 items-center justify-center", className)}
    >
      <svg viewBox="0 0 32 32" fill="none" className="size-full">
        <defs>
          <radialGradient id={g} cx="36%" cy="24%" r="88%">
            <stop offset="0%" stopColor={c0} />
            <stop offset="55%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </radialGradient>
          <clipPath id={clip}>
            <rect x="3.4" y="9.4" width="25.2" height="21" rx="9.2" />
          </clipPath>
          <filter id={soft} x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          <filter id={tight} x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="1.05" />
          </filter>
        </defs>

        {/* backlit aura — outer layer breathes when thinking */}
        <motion.circle
          cx="16"
          cy="19"
          r="13"
          fill="#4f46e5"
          filter={`url(#${soft})`}
          initial={false}
          animate={live ? { opacity: [oOut, oOut * 1.35, oOut] } : { opacity: oOut }}
          transition={
            live ? { duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" } : { duration: 0.3 }
          }
        />
        <circle cx="16" cy="19" r="10.3" fill="#6366f1" opacity={oIn} filter={`url(#${tight})`} />

        {/* floating spark crown (+ soft glow) — pulses when thinking */}
        <circle cx="16" cy="4" r="2.6" fill={spark} opacity="0.5" filter={`url(#${tight})`} />
        <motion.path
          d="M16 1.7l.95 2.35 2.35.95-2.35.95L16 9.3l-.95-2.35L12.7 6l2.35-.95z"
          fill={spark}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          initial={false}
          animate={live ? { scale: [1, 1.18, 1], opacity: [1, 0.82, 1] } : { scale: 1, opacity: 1 }}
          transition={
            live ? { duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" } : { duration: 0.3 }
          }
        />

        {/* head — gradient + spherical volume + glassy specular (clipped to the head) */}
        <g clipPath={`url(#${clip})`}>
          <rect x="3.4" y="9.4" width="25.2" height="21" rx="9.2" fill={`url(#${g})`} />
          <ellipse cx="16" cy="31.5" rx="12" ry="6" fill="#1e1b4b" opacity="0.3" filter={`url(#${tight})`} />
          <ellipse cx="11.6" cy="13.6" rx="6" ry="3" fill="#fff" opacity="0.15" />
          <ellipse cx="10.8" cy="12.6" rx="2.3" ry="1.3" fill="#fff" opacity="0.5" />
        </g>
        <rect
          x="4.1"
          y="10.1"
          width="23.8"
          height="19.6"
          rx="8.6"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.16"
          strokeWidth="0.7"
        />

        {/* eyes — calm catchlight gaze; a rare quick blink for ambient life */}
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          initial={false}
          animate={reduce ? { scaleY: 1 } : { scaleY: [1, 1, 0.12, 1] }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 4.6, times: [0, 0.92, 0.965, 1], repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
          }
        >
          <circle cx="12.1" cy="18.9" r="2.95" fill="#fff" />
          <circle cx="19.9" cy="18.9" r="2.95" fill="#fff" />
          <circle cx="12.35" cy="19.2" r="1.3" fill="#312e81" />
          <circle cx="20.15" cy="19.2" r="1.3" fill="#312e81" />
          <circle cx="11.55" cy="18.25" r="0.55" fill="#fff" />
          <circle cx="19.35" cy="18.25" r="0.55" fill="#fff" />
        </motion.g>
      </svg>
    </span>
  );
}
