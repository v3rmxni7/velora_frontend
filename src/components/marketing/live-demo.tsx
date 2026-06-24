"use client";

import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal, useAutoStep } from "@/components/motion";
import { cn } from "@/lib/utils";

// ★ THE CENTERPIECE — the live grounded-draft demo (replaces Artisan's social-proof; Mynor-grade
// craft, our honest mechanic). A 5-stage pipeline auto-plays inside a browser-chrome window: facts
// are researched with COUNT-UP confidence, the sub-0.60 fact visibly DROPS (the honest filter,
// live), the evidence rail grounds, the draft types in, a rule-based scan passes, and it ends on
// status: dry_run. Pause-on-hover; reduced-motion → the finished draft, static. Numbers are product
// mechanics on an illustrative sample lead — zero fabricated results. (21st.dev picks, re-themed:
// Browser-Preview frame + features-cycler fill-bar = the evidence rail charging.)

const STEP_MS = 3000;

const STAGES = [
  { key: "research", label: "Research", blurb: "Pull facts from the lead + your proof & knowledge base." },
  { key: "filter", label: "Filter", blurb: "Drop anything unsourced or below the 0.60 confidence floor." },
  { key: "write", label: "Write", blurb: "Draft from the verified facts only — no invented claims." },
  { key: "verify", label: "Verify", blurb: "Rule-based scan of every hard claim against the sources." },
  { key: "dryrun", label: "Dry-run", blurb: "Queue as a reviewable draft — nothing reaches an inbox." },
];

// Illustrative sample lead + the facts the Researcher surfaces. The 0.41 fact is below the 0.60
// floor and is dropped on screen; the 0.62 fact survives but the Writer doesn't use it.
const KEPT = [
  { text: "VP of Engineering at Acme", source: "lead · title", c: 0.97, used: true },
  { text: "Series B · ~180 employees", source: "proof", c: 0.91, used: true },
  { text: "Hiring 4 backend roles", source: "kb", c: 0.62, used: false },
];
const DROPPED = { text: "“scaling pains” mentioned in a post", source: "kb", c: 0.41 };

const DRAFT =
  "Hi Dana — saw Acme's backend team is scaling fast off the Series B. Teams growing outbound at that stage usually hit deliverability walls before headcount ones. Worth a quick look?";

// Count-up confidence number (0 → value), reduced-motion → final value immediately.
function Confidence({ value, run }: { value: number; run: boolean }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce || !run) {
      setN(value);
      return;
    }
    const controls = animate(0, value, { duration: 0.7, ease: "easeOut", onUpdate: setN });
    return () => controls.stop();
  }, [run, value, reduce]);
  return <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">{n.toFixed(2)}</span>;
}

function FactRow({ text, source, c, used, run, dropped }: { text: string; source: string; c: number; used?: boolean; run: boolean; dropped?: boolean }) {
  return (
    <div className={cn("flex items-baseline gap-2.5 py-1", (dropped || used === false) && "opacity-50")}>
      <span className={cn("size-1.5 shrink-0 self-center rounded-full", dropped ? "bg-destructive" : used ? "bg-primary" : "bg-border")} aria-hidden />
      <Confidence value={c} run={run} />
      <span className="flex-1 text-sm text-foreground">{text}</span>
      <span className="shrink-0 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{source}</span>
      <span className="hidden shrink-0 font-mono text-[10px] text-muted-foreground sm:inline">
        {dropped ? "dropped · < 0.60" : used ? "cited" : "verified · not used"}
      </span>
    </div>
  );
}

// Word-staggered "typing" of the draft body when active; reduced-motion → full text instantly.
function TypedDraft({ run }: { run: boolean }) {
  const reduce = useReducedMotion();
  const words = DRAFT.split(" ");
  if (reduce || !run) return <span>{DRAFT}</span>;
  return (
    <motion.span initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.018 } } }}>
      {words.map((w, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: positional words in a fixed sample string
        <motion.span key={i} variants={{ h: { opacity: 0 }, s: { opacity: 1 } }}>
          {w}{i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}

function VeloraDemoWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card shadow-glow-indigo ring-1 ring-black/5">
      <div className="flex h-10 items-center gap-3 border-b border-border bg-secondary/40 px-3.5">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-primary/70" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded border border-border bg-background px-2 py-0.5">
          <span className="size-1 rounded-full bg-emerald-500" aria-hidden />
          <span className="font-mono text-[11px] text-muted-foreground">app.velora/campaigns · draft</span>
        </div>
      </div>
      <div className="relative p-5 pl-6">{children}</div>
    </div>
  );
}

export function LiveDemo() {
  const { step, goTo, pause, resume, reduce } = useAutoStep(STAGES.length, STEP_MS);
  const s = reduce ? STAGES.length - 1 : step; // reduced-motion shows the finished state

  return (
    <section id="demo" className="relative isolate overflow-hidden bg-hero-ink py-24 text-white lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-grid-faint [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-indigo-300">See it draft, live</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Watch the honest filter do its job.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/60">
            A real lead, the actual pipeline — facts scored, the weak one dropped, the draft grounded and
            checked, ending where every draft starts: dry-run.
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
                        transition={{ duration: STEP_MS / 1000, ease: "linear" }}
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

            {/* Facts + the live filter */}
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  {s === 0 ? "researching facts" : "grounded on 3 verified facts"}
                </p>
                <AnimatePresence>
                  {s >= 1 && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-[10px] text-destructive">
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
                  {s === 0 && (
                    <motion.div
                      key="dropped"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, x: -8 }}
                      transition={{ duration: 0.4 }}
                    >
                      <FactRow {...DROPPED} run dropped />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* The draft body, typed in */}
            <AnimatePresence>
              {s >= 2 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="relative mt-4 overflow-hidden rounded-md bg-secondary/50 p-4 text-sm leading-relaxed text-foreground"
                >
                  <TypedDraft run={s === 2} />
                  {/* Verification scan sweep */}
                  {s === 3 && !reduce && (
                    <motion.span
                      className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary/15 to-transparent"
                      initial={{ x: "-40%" }}
                      animate={{ x: "340%" }}
                      transition={{ duration: 0.9, ease: "easeInOut" }}
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
    </section>
  );
}
