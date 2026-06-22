"use client";

// Tasteful, reduced-motion-aware motion primitives (Framer Motion). Shared by Tier A (marketing
// scroll reveals) and Tier B (subtle app mount motion). When the user prefers reduced motion, every
// wrapper renders instantly with NO transform/opacity animation — honoring the app's a11y stance
// (globals.css already silences the CSS keyframes under prefers-reduced-motion).

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// Gentle ease-out — never bouncy (per the brief: subtle, not springy).
const EASE = [0.22, 1, 0.36, 1] as const;

type Common = { children: ReactNode; className?: string; delay?: number };

/** Scroll-triggered reveal: fades + lifts into view once. Use for marketing sections. */
export function Reveal({ children, className, delay = 0, y = 16 }: Common & { y?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Mount fade: animates once on mount. Use for above-the-fold hero content + subtle app entrances. */
export function FadeIn({ children, className, delay = 0, y = 8 }: Common & { y?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

const STAGGER_ITEM: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** Stagger container: reveals its <StaggerItem> children in sequence as they enter view. */
export function Stagger({ children, className, gap = 0.08 }: Common & { gap?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={STAGGER_ITEM}>
      {children}
    </motion.div>
  );
}
