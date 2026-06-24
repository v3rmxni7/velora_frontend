"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useReducedMotionSafe } from "@/components/motion";

// A thin indigo progress bar pinned to the top of the page — marks the chaptered scroll arc
// (the design-skill "Scroll-Triggered Storytelling" progress indicator). Spring-smoothed so it
// glides rather than jitters. Hidden entirely under prefers-reduced-motion (it's a motion-only cue).
// Uses useReducedMotionSafe so the server + first client render agree (the bar renders), then it
// disappears after mount for reduced-motion users — no SSG hydration mismatch from returning null.
export function ScrollProgress() {
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  if (reduce) return null;
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
