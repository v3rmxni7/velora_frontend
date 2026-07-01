"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

// Ava's mascot — a friendly, distinctly NON-HUMAN "spark-bot": a rounded indigo head with two bright
// eyes, a soft smile, and a spark antenna. Deliberately NOT a human face — Velora's honesty stance
// rejects fabricated people, so Ava is an honest AI *presence*, never a stock/AI-generated headshot.
// Self-contained inline SVG (no external asset), themed to the brand indigo, crisp at any size.
// Decorative (aria-hidden) — always pair it with the visible "Ava" label.
//
// Sizing: defaults to size-6 (24px); pass `className` (e.g. "size-5") to scale — the SVG fills the box.
// `active` adds a soft indigo halo + brightens the eyes/spark for a "thinking / open" state.
export function AvaAvatar({
  className,
  active = false,
}: {
  className?: string;
  /** Retained for call-site compatibility; the mascot SVG scales with `className`. */
  iconClassName?: string;
  active?: boolean;
}) {
  const gid = useId();
  const pupil = active ? "#a5b4fc" : "#312e81";
  const spark = active ? "#e0e7ff" : "#c7d2fe";
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex size-6 shrink-0 items-center justify-center rounded-full",
        active && "ring-2 ring-primary/30",
        className,
      )}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="size-full drop-shadow-[0_1px_2px_rgba(79,70,229,0.45)]"
      >
        <defs>
          <radialGradient id={gid} cx="32%" cy="20%" r="90%">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="52%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#3730a3" />
          </radialGradient>
        </defs>
        {/* antenna + spark */}
        <line x1="16" y1="6.2" x2="16" y2="9.5" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" />
        <path
          d="M16 1.8l.85 2.05 2.05.85-2.05.85L16 7.6l-.85-2.05-2.05-.85 2.05-.85z"
          fill={spark}
          className={cn(active && "motion-safe:animate-pulse")}
        />
        {/* head */}
        <rect x="5.5" y="9" width="21" height="18.5" rx="7.5" fill={`url(#${gid})`} />
        {/* gloss highlight */}
        <ellipse cx="12.5" cy="13.5" rx="5.5" ry="2.6" fill="#fff" opacity="0.16" />
        {/* eyes + pupils */}
        <circle cx="12.3" cy="18" r="2.5" fill="#fff" />
        <circle cx="19.7" cy="18" r="2.5" fill="#fff" />
        <circle cx="12.3" cy="18.2" r="1.05" fill={pupil} />
        <circle cx="19.7" cy="18.2" r="1.05" fill={pupil} />
        {/* smile */}
        <path
          d="M11.8 22.3c1.5 1.7 4.9 1.7 6.4 0"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </span>
  );
}
