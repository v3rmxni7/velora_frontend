"use client";

import { Reveal, Stagger, StaggerItem, Parallax } from "@/components/motion";

// A1b — "How it works": the REAL Researcher→filter→Writer→verify pipeline, ending on the two-flag
// safety step. Copy is grounded against the actual backend (read-only audit) and written to the
// honesty guardrails: verification is automated RULE-BASED checks (not an LLM grading itself),
// "personalized" is strictly EARNED (≥2 verified, lead-specific facts — else a safe template, never
// a guess), and nothing sends until two org flags are deliberately flipped. No deliverability/result
// promises, no "never hallucinates". The vertical rail echoes the product's evidence rail.

const STEPS = [
  {
    n: "01",
    title: "Gather what's verifiably true",
    body: "Every draft starts from the lead's own structured fields — scoped to your workspace — plus your proof points, coaching notes, and, when available, passages from your website knowledge base retrieved by semantic search.",
    chip: "your data only",
  },
  {
    n: "02",
    title: "Research & cite",
    body: "An AI step pulls out a handful of facts about the lead — each one tagged with the exact source it came from and a self-reported confidence score. Nothing is written yet.",
    chip: "cited + scored",
  },
  {
    n: "03",
    title: "Keep only what's grounded",
    body: "Any “fact” that can't be traced back to a real source you provided — or that the model isn't confident about — is dropped before a single word is drafted.",
    chip: "drop unsourced / low-confidence",
  },
  {
    n: "04",
    title: "Write only when it's earned",
    body: "With enough verified, lead-specific facts, a capable model drafts using only those facts, under instructions to add no numbers, companies, or claims of its own. Short of that bar, Velora sends a safe template instead of guessing.",
    chip: "≥ 2 verified facts to personalize",
  },
  {
    n: "05",
    title: "Verify, then rewrite or fall back",
    body: "Automated rule-based checks scan the draft for high-risk hard claims — figures, dollar amounts, company names — and flag any that don't trace to the allowed sources. Fail once, it rewrites; fail again, it falls back to the safe template.",
    chip: "rule-based, not an AI grading itself",
  },
  {
    n: "06",
    title: "Nothing sends until you say go",
    body: "Each email lands as a reviewable draft showing its sources and confidence. New workspaces are dry-run only — turning on live sending takes a deliberate flip a logged-in user, or the copilot, simply can't make.",
    chip: "dry-run by default",
    safety: true,
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
          <p className={EYEBROW}>How Velora writes</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Grounded by construction — not by promise.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            The same Researcher → verify → Writer pipeline that powers the draft above, step by step.
            Every guardrail here is enforced in code, not in the copy.
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
              {/* Step marker — sits on the rail. Safety step is amber, echoing the dry-run status. */}
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
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
