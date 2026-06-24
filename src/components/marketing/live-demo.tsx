"use client";

import { AnimatePresence, animate, motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal, useAutoStep, useReducedMotionSafe } from "@/components/motion";
import { cn } from "@/lib/utils";

// ★ THE CENTERPIECE — the live grounded-draft demo. The thesis, animated: it throws away the fact it
// can't verify, on screen. A 5-stage pipeline auto-plays in a browser-chrome window; the stage rail's
// active fill-bar IS the evidence-rail spine charging. THE DROP is the hero beat — Research holds ~4s
// so all four facts + count-up scores read, then the 0.41 fact flashes red, strikes through, and
// collapses out ("✕ < 0.60 — dropped") as the count recomputes to "grounded on 3 verified facts".
// Then the draft types in (blinking caret), a rule-based scan passes, and it ends on status: dry_run.
// Pause-on-hover; reduced-motion → the finished draft, static. Numbers are product mechanics on an
// illustrative sample lead — zero fabricated results.

// Per-stage dwell (ms). Research is long so four facts register BEFORE one is taken away — the drop
// only lands if you'd read the fact first. Module-level for a stable useAutoStep dependency.
const DURATIONS = [4000, 3400, 3600, 2600, 3200];
const DROP_AT = 1500; // ms into Filter when the 0.41 fact is rejected + collapses

const STAGES = [
  { key: "research", label: "Research", blurb: "Pull facts from the lead + your proof & knowledge base." },
  { key: "filter", label: "Filter", blurb: "Drop anything unsourced or below the 0.60 confidence floor." },
  { key: "write", label: "Write", blurb: "Draft from the verified facts only — no invented claims." },
  { key: "verify", label: "Verify", blurb: "Rule-based scan of every hard claim against the sources." },
  { key: "dryrun", label: "Dry-run", blurb: "Queue as a reviewable draft — nothing reaches an inbox." },
];

const KEPT = [
  { text: "VP of Engineering at Acme", source: "lead · title", c: 0.97, used: true },
  { text: "Series B · ~180 employees", source: "proof", c: 0.91, used: true },
  { text: "Hiring 4 backend roles", source: "kb", c: 0.62, used: false },
];
const DROPPED = { text: "“scaling pains” mentioned in a post", source: "kb" };
const DRAFT =
  "Hi Dana — saw Acme's backend team is scaling fast off the Series B. Teams growing outbound at that stage usually hit deliverability walls before headcount ones. Worth a quick look?";

// Count-up confidence (0 → value), reduced-motion → final value immediately.
function Confidence({ value, run }: { value: number; run: boolean }) {
  const reduce = useReducedMotionSafe();
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    if (reduce || !run) return;
    const controls = animate(0, value, { duration: 0.8, ease: "easeOut", onUpdate: setN });
    return () => controls.stop();
  }, [run, value, reduce]);
  const shown = reduce || !run ? value : (n ?? 0);
  return <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">{shown.toFixed(2)}</span>;
}

function FactRow({ text, source, c, used, run }: { text: string; source: string; c: number; used: boolean; run: boolean }) {
  return (
    <div className={cn("flex items-baseline gap-2.5 py-1", !used && "opacity-50")}>
      <span className={cn("size-1.5 shrink-0 self-center rounded-full", used ? "bg-primary" : "bg-border")} aria-hidden />
      <Confidence value={c} run={run} />
      <span className="flex-1 text-sm text-foreground">{text}</span>
      <span className="shrink-0 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{source}</span>
      <span className="hidden shrink-0 font-mono text-[10px] text-muted-foreground sm:inline">{used ? "cited" : "verified · not used"}</span>
    </div>
  );
}

// The fact that fails the floor. Neutral while researching; on reject it flashes red, strikes
// through, and its label flips to the rejection — held ~1.5s, then collapsed out by the parent.
function WeakFactRow({ rejected }: { rejected: boolean }) {
  return (
    <motion.div
      className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded py-1"
      animate={rejected ? { backgroundColor: ["rgba(220,38,38,0)", "rgba(220,38,38,0.16)", "rgba(220,38,38,0)"] } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <span className={cn("size-1.5 shrink-0 self-center rounded-full transition-colors", rejected ? "bg-destructive" : "bg-border")} aria-hidden />
      {rejected ? (
        <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-destructive">0.41</span>
      ) : (
        <Confidence value={0.41} run />
      )}
      <span className={cn("min-w-0 flex-1 text-sm transition-colors", rejected ? "text-muted-foreground line-through" : "text-foreground")}>{DROPPED.text}</span>
      <span className="shrink-0 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{DROPPED.source}</span>
      <span className={cn("shrink-0 font-mono text-[10px] font-medium transition-colors", rejected ? "text-destructive" : "text-muted-foreground")}>
        {rejected ? "✕ < 0.60 — dropped" : "scoring…"}
      </span>
    </motion.div>
  );
}

// Word-staggered "typing" with a blinking caret while composing; reduced-motion → full text instantly.
function TypedDraft({ run }: { run: boolean }) {
  const reduce = useReducedMotionSafe();
  const words = DRAFT.split(" ");
  if (reduce || !run) return <span>{DRAFT}</span>;
  return (
    <span>
      <motion.span initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.02 } } }}>
        {words.map((w, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: positional words in a fixed sample string
          <motion.span key={i} variants={{ h: { opacity: 0 }, s: { opacity: 1 } }}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </motion.span>
      <motion.span
        className="ml-0.5 inline-block h-3.5 w-[2px] -translate-y-px bg-primary align-middle"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        aria-hidden
      />
    </span>
  );
}

function VeloraDemoWindow({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotionSafe();
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card shadow-glow-indigo ring-1 ring-black/5">
      <div className="flex h-10 items-center gap-3 border-b border-border bg-secondary/40 px-3.5">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-primary/70" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded border border-border bg-background px-2 py-0.5">
          <span className="font-mono text-[11px] text-muted-foreground">app.velora/campaigns · draft</span>
        </div>
        <div className="flex items-center gap-1.5">
          {reduce ? (
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
          ) : (
            <motion.span
              className="size-1.5 rounded-full bg-emerald-500"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              aria-hidden
            />
          )}
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">live</span>
        </div>
      </div>
      <div className="relative p-5 pl-6">{children}</div>
    </div>
  );
}

export function LiveDemo() {
  const { step, goTo, pause, resume, reduce } = useAutoStep(STAGES.length, DURATIONS);
  const s = reduce ? STAGES.length - 1 : step; // reduced-motion shows the finished state

  // Fire the drop ~1.5s into Filter; reset at the top of each loop via the render-time prev-step
  // pattern (NOT a setState-in-effect) so the rejected fact re-appears fresh every cycle.
  const [dropFired, setDropFired] = useState(false);
  const [seenStep, setSeenStep] = useState(s);
  if (s !== seenStep) {
    setSeenStep(s);
    if (s === 0) setDropFired(false);
  }
  useEffect(() => {
    if (reduce || s !== 1) return;
    const t = setTimeout(() => setDropFired(true), DROP_AT);
    return () => clearTimeout(t);
  }, [s, reduce]);

  const fired = reduce || dropFired || s > 1;
  const factsLabel = s === 0 ? "researching facts" : s === 1 && !fired ? "filtering · checking the floor" : "grounded on 3 verified facts";

  return (
    <section id="demo" className="relative isolate overflow-hidden bg-hero-ink py-24 text-white lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-grid-faint [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-indigo-300">See it draft, live</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Watch it throw away the fact it can’t verify.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/60">
            A real lead, the actual pipeline — four facts scored, the weak one dropped on the spot, the
            draft grounded and checked, ending where every draft starts: dry-run.
          </p>
        </Reveal>

        <div
          className="mt-10 grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]"
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocusCapture={pause}
          onBlurCapture={resume}
        >
          {/* Stage rail — the active stage's fill bar IS the evidence-rail spine charging. */}
          <ol className="space-y-1.5">
            {STAGES.map((stage, i) => {
              const active = i === s;
              const done = i < s;
              return (
                <li key={stage.key}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "relative w-full overflow-hidden rounded-md border px-4 py-3 text-left transition-colors",
                      active ? "border-primary/40 bg-white/[0.04]" : "border-white/10 hover:bg-white/[0.03]",
                    )}
                  >
                    <span className={cn("absolute inset-y-0 left-0 w-[3px]", active ? "bg-primary" : done ? "bg-primary/40" : "bg-white/10")} aria-hidden />
                    {active && !reduce && (
                      <motion.span
                        key={s}
                        className="absolute bottom-0 left-0 h-[2px] bg-primary/70"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: DURATIONS[s] / 1000, ease: "linear" }}
                        aria-hidden
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] tabular-nums",
                          active ? "border-primary bg-primary text-primary-foreground" : done ? "border-primary/40 text-indigo-300" : "border-white/20 text-white/40",
                        )}
                      >
                        {done ? <Check className="size-3" /> : i + 1}
                      </span>
                      <span className={cn("font-heading text-sm font-medium", active || done ? "text-white" : "text-white/55")}>{stage.label}</span>
                    </div>
                    <p className={cn("mt-1.5 pl-7 text-[12px] leading-relaxed transition-colors", active ? "text-white/65" : "text-white/35")}>{stage.blurb}</p>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* The window — a grounded draft being built, stage by stage. */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 -z-10" aria-hidden>
              <div className="absolute right-6 top-2 size-64 rounded-full bg-primary/20 blur-[90px]" />
            </div>
            <VeloraDemoWindow>
              <span className="absolute inset-y-0 left-0 w-[3px] origin-top bg-primary" aria-hidden />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">to</p>
                  <h3 className="font-semibold text-foreground">Dana — VP Engineering at Acme</h3>
                </div>
                <span className="shrink-0 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                  {s >= 2 ? "personalized · 0.94" : "drafting…"}
                </span>
              </div>

              {/* Facts + the live filter (the hero beat) */}
              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{factsLabel}</p>
                  <AnimatePresence>
                    {fired && (
                      <motion.span
                        initial={{ opacity: 0, x: 4 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 font-mono text-[10px] text-destructive"
                      >
                        1 dropped · &lt; 0.60
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="mt-1.5 divide-y divide-border/60">
                  {KEPT.map((f) => (
                    <FactRow key={f.text} {...f} run={s === 0} />
                  ))}
                  <AnimatePresence>
                    {s <= 1 && !fired && (
                      <motion.div
                        key="weak"
                        className="overflow-hidden"
                        exit={{ opacity: 0, height: 0, x: -12, marginTop: 0 }}
                        transition={{ duration: 0.5, ease: "easeIn" }}
                      >
                        <WeakFactRow rejected={s === 1} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* The draft body, typed in with a caret */}
              <AnimatePresence>
                {s >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="relative mt-4 overflow-hidden rounded-md bg-secondary/50 p-4 text-sm leading-relaxed text-foreground"
                  >
                    <TypedDraft run={s === 2} />
                    {s === 3 && !reduce && (
                      <motion.span
                        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary/15 to-transparent"
                        initial={{ x: "-40%" }}
                        animate={{ x: "340%" }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        aria-hidden
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Verification line */}
              <AnimatePresence>
                {s >= 3 && (
                  <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                    <ShieldCheck className="size-3.5 text-emerald-600" aria-hidden />
                    verification: passed · regenerated once
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Dry-run — where every draft ends */}
              <AnimatePresence>
                {s >= 4 && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center border-t border-border pt-3">
                    <span className="inline-flex items-center gap-1.5 rounded border border-amber-500/30 bg-amber-50 px-2 py-1 font-mono text-[11px] text-amber-700">
                      <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
                      status: dry_run — no real email until you flip the switch
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </VeloraDemoWindow>
          </div>
        </div>
      </div>
    </section>
  );
}
