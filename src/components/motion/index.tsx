"use client";

// Tasteful, reduced-motion-aware motion primitives (Framer Motion). Shared by Tier A (marketing
// scroll reveals + parallax) and Tier B (subtle app mount motion). When the user prefers reduced
// motion, every wrapper renders instantly with NO transform/opacity/parallax animation — honoring
// the app's a11y stance (globals.css already silences the CSS keyframes under prefers-reduced-motion).

import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

// Premium ease-out — decisive, then settle (cubic-bezier(0.16,1,0.3,1)). Never linear, never bouncy.
const EASE = [0.16, 1, 0.3, 1] as const;

type Common = { children: ReactNode; className?: string; delay?: number };

/** Scroll-triggered reveal: fades + lifts (+ a touch of blur) into view once. Marketing sections. */
export function Reveal({ children, className, delay = 0, y = 24 }: Common & { y?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Mount fade: animates once on mount. Use for above-the-fold hero content + subtle app entrances. */
export function FadeIn({ children, className, delay = 0, y = 10 }: Common & { y?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

const STAGGER_ITEM: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE } },
};

/** Stagger container: reveals its <StaggerItem> children in sequence as they enter view. */
export function Stagger({ children, className, gap = 0.09 }: Common & { gap?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
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

/**
 * Subtle scroll parallax: the element drifts vertically as it travels through the viewport.
 * `distance` is the total travel in px (top of range → bottom). Keep it small (30–80px) — premium
 * is restraint. Reduced-motion → a plain static div (ref kept so layout is identical).
 */
export function Parallax({
  children,
  className,
  distance = 50,
}: Common & { distance?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  if (reduce) return <div ref={ref} className={className}>{children}</div>;
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
