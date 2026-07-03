"use client";

// Tasteful, reduced-motion-aware motion primitives (Framer Motion). Shared by Tier A (marketing
// scroll reveals + parallax) and Tier B (subtle app mount motion). When the user prefers reduced
// motion, every wrapper renders instantly with NO transform/opacity/parallax animation — honoring
// the app's a11y stance (globals.css silences the custom CSS keyframes AND the tw-animate
// animate-in/out utilities under prefers-reduced-motion).

import { animate, motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Premium ease-out — decisive, then settle (cubic-bezier(0.16,1,0.3,1)). Never linear, never bouncy.
const EASE = [0.16, 1, 0.3, 1] as const;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * SSR-safe reduced-motion via useSyncExternalStore. The SERVER snapshot is `false`, and React uses it
 * for BOTH the server render and the client's first (hydration) render — so the hydrated tree always
 * matches the static HTML. Immediately after hydration React switches to the live client snapshot
 * (the real media query), and the subscription re-renders if the user toggles the OS setting. Any
 * component that branches its RENDER on reduced motion (different markup/structure/step) MUST use this
 * — not framer's useReducedMotion() directly — because under SSG the server renders reduce=false while
 * a direct client read returns reduce=true synchronously, producing a hydration mismatch that
 * regenerates the whole tree. (No setState-in-effect; non-reduced users see no behavior change.)
 */
export function useReducedMotionSafe() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches, // client snapshot
    () => false, // server + first-hydration snapshot
  );
}

type Common = { children: ReactNode; className?: string; delay?: number };

/** Scroll-triggered reveal: fades + lifts (+ a touch of blur) into view once. Marketing sections. */
export function Reveal({ children, className, delay = 0, y = 24 }: Common & { y?: number }) {
  const reduce = useReducedMotionSafe();
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
  const reduce = useReducedMotionSafe();
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
  const reduce = useReducedMotionSafe();
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
  const reduce = useReducedMotionSafe();
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
  const reduce = useReducedMotionSafe();
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

/**
 * A large, soft, blurred INDIGO capsule for hero/dark-section depth (re-typed + de-chromed from the
 * 21st.dev `ElegantShape` reference — monochrome, our craft law). Always drifts IN once on entrance;
 * `float` adds the gentle infinite y-float. Keep at most ONE floating shape per viewport (craft law:
 * one ambient loop) — the others get the entrance only. Reduced-motion → a static positioned capsule.
 */
export function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 110,
  rotate = 0,
  float = false,
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  float?: boolean;
}) {
  const reduce = useReducedMotionSafe();
  const capsule = (
    <div
      style={{ width, height }}
      className="rounded-full border border-white/[0.08] bg-gradient-to-r from-primary/[0.16] to-transparent shadow-[0_8px_40px_-8px_rgba(79,70,229,0.18)] backdrop-blur-[2px]"
    />
  );
  if (reduce) {
    return (
      <div className={cn("pointer-events-none absolute", className)} style={{ transform: `rotate(${rotate}deg)` }} aria-hidden>
        {capsule}
      </div>
    );
  }
  return (
    <motion.div
      className={cn("pointer-events-none absolute", className)}
      aria-hidden
      initial={{ opacity: 0, y: -110, rotate: rotate - 12 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.2, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.1 } }}
    >
      {float ? (
        <motion.div
          animate={{ y: [0, 14, 0] }}
          transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          {capsule}
        </motion.div>
      ) : (
        capsule
      )}
    </motion.div>
  );
}

/**
 * In-app number count-up for dashboard stats / counts / credits. Animates 0 → value on mount and
 * old → new on change; reduced-motion renders the exact final value with no animation. PURELY
 * presentational: the `value` passed in is the real, already-computed number — this only animates its
 * reveal (never fabricates or rounds the source). `format` controls display (default: thousands
 * separators). Dashboard metrics are client-fetched (rendered after their query resolves, behind a
 * skeleton), so starting from 0 is correct and carries no SSR/hydration value to mismatch.
 */
export function CountUp({
  value,
  durationMs = 600,
  format = (v: number) => Math.round(v).toLocaleString(),
  className,
}: {
  value: number;
  durationMs?: number;
  format?: (v: number) => string;
  className?: string;
}) {
  const reduce = useReducedMotionSafe();
  const [shown, setShown] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (reduce) return; // reduced-motion: render the final value verbatim, no animation
    const controls = animate(prev.current, value, {
      duration: durationMs / 1000,
      ease: "easeOut",
      onUpdate: setShown, // async frame callback — not a synchronous setState-in-effect
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduce, durationMs]);
  return <span className={className}>{format(reduce ? value : shown)}</span>;
}

/**
 * Auto-advancing step driver for the live demo (re-typed from the 21st.dev `useNumberCycler`
 * discipline: the timer re-arms on each step so a manual jump resets the dwell). Pauses on hover/
 * focus. Under prefers-reduced-motion it does NOT auto-advance — the consumer renders a complete
 * static state instead. Returns the step, manual jump, pause/resume handlers, and the reduce flag.
 */
export function useAutoStep(count: number, intervalMs: number | number[] = 3000, active = true) {
  const reduce = useReducedMotionSafe();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // `active` lets the consumer gate the timer on visibility (useInView) so it doesn't churn
    // off-screen; pause/resume handles hover/focus; reduced-motion never auto-advances.
    if (reduce || paused || !active || count <= 1) return;
    const ms = Array.isArray(intervalMs) ? (intervalMs[step] ?? 3000) : intervalMs;
    timer.current = setTimeout(() => setStep((s) => (s + 1) % count), ms);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [step, paused, reduce, active, count, intervalMs]);

  const goTo = useCallback((i: number) => setStep(i), []);
  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);
  return { step, goTo, pause, resume, paused, reduce };
}
