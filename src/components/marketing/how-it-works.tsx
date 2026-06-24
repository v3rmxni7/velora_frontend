"use client";

import { Reveal, Stagger, StaggerItem, Parallax } from "@/components/motion";

// S3 — "How it works", repurposed as the broader AUTONOMOUS LOOP (the live demo above already shows
// the draft pipeline in motion, so re-explaining Researcher→verify→Writer here would be redundant).
// This is the breadth the demo can't show: Find → Draft → Guard → Engage → Measure. Copy is grounded
// against the real backend and written to the honesty guardrails — dormant pieces are phrased for what
// they actually do today (anonymous site visits are captured; identification needs a resolver, so we
// don't claim it), nothing overclaims outcomes, and the send step stays dry-run-by-default. The
// vertical rail echoes the product's evidence rail; the Guard step is amber, echoing the dry-run gate.

const STEPS = [
  {
    n: "01",
    title: "Find the people worth reaching",
    body: "Velora pulls prospects from the lists you import, live buyer-intent signals, and the anonymous visits on your own site — every record scoped to your workspace and enriched only from sources you provided.",
    chip: "your workspace only",
    tags: ["lead discovery", "intent signals", "website visits"],
  },
  {
    n: "02",
    title: "Draft only what it can stand behind",
    body: "The Researcher cites and scores facts, the Writer uses only the verified ones, and an automated check rewrites or falls back to a safe template if anything can't be traced. That's the pipeline you watched run above.",
    chip: "grounded or it falls back",
    tags: ["researcher", "verifier", "writer"],
  },
  {
    n: "03",
    title: "Run it autonomously — inside real guardrails",
    body: "Turn on autonomy and Velora works the queue on its own, behind guardrails you set: a two-flag send gate, per-org and global daily volume caps, and a scheduled anomaly auto-pause that trips on the first sign of trouble.",
    chip: "dry-run until you flip it",
    tags: ["two-flag gate", "volume caps", "auto-pause"],
    safety: true,
  },
  {
    n: "04",
    title: "Sequence, then get out of the way",
    body: "Multi-step follow-ups go out on a durable schedule — and the instant a human replies, the sequence halts and the person is suppressed. The agent never talks over a reply, autonomous or not.",
    chip: "halt on reply",
    tags: ["follow-up steps", "reply routing", "global suppression"],
  },
  {
    n: "05",
    title: "Numbers you can trust — or none at all",
    body: "Every rate is computed from real send and reply events. Where there's nothing to measure yet, Velora shows you exactly that — a labelled empty state — instead of a fabricated metric to look impressive.",
    chip: "real events only",
    tags: ["honest-empty", "no vanity stats"],
  },
];

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.14em] text-primary";

export function HowItWorks() {
  return (
    <section id="how" className="relative isolate overflow-hidden bg-background py-24 lg:py-28">
      {/* A soft indigo bloom drifting behind the header (subtle parallax). */}
      <Parallax distance={50} className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center">
        <div className="size-[34rem] rounded-full bg-primary/[0.06] blur-[120px]" aria-hidden />
      </Parallax>

      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <p className={EYEBROW}>The loop</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            One loop — accountable at every step.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            From the first signal to the last number, each stage is enforced in code — not in this copy.
            And the stage that matters most, sending, stays dry-run until you deliberately flip it.
          </p>
        </Reveal>

        <Stagger className="relative mt-14" gap={0.1}>
          {/* The rail — the product's evidence rail, carried into the story. */}
          <span
            className="absolute left-[18px] top-3 bottom-3 w-px bg-gradient-to-b from-primary/50 via-border to-transparent sm:left-[22px]"
            aria-hidden
          />
          {STEPS.map((s) => (
            <StaggerItem key={s.n} className="relative flex gap-5 pb-9 last:pb-0 sm:gap-6">
              {/* Step marker — sits on the rail. The Guard (safety) step is amber, echoing dry-run. */}
              <div
                className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border bg-background font-mono text-[11px] tabular-nums sm:size-11 sm:text-xs ${
                  s.safety
                    ? "border-amber-500/40 text-amber-700 shadow-[0_0_0_4px_rgba(245,158,11,0.08)]"
                    : "border-primary/30 text-primary shadow-[0_0_0_4px_rgba(79,70,229,0.06)]"
                }`}
              >
                {s.n}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    <span className="sr-only">{`Step ${s.n}: `}</span>
                    {s.title}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                      s.safety
                        ? "border-amber-500/30 bg-amber-50 text-amber-700"
                        : "border-border bg-secondary/60 text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`size-1 rounded-full ${s.safety ? "bg-amber-500" : "bg-primary"}`}
                      aria-hidden
                    />
                    {s.chip}
                  </span>
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
                {/* Surface micro-chips — the real product pieces this stage uses (mono = data voice). */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-border/70 bg-secondary/40 px-1.5 py-0.5 font-mono text-[10px] tracking-tight text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
