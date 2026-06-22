// The marketing hero centerpiece: a faithful STATIC mirror of the real grounded-draft card
// (src/components/tasks/draft-card.tsx) — the product's signature artifact. It uses the exact visual
// language of the live component (evidence rail, verified-fact rows with confidence + source chips,
// the used/not-used distinction, the honest dry-run status) with a clearly representative sample
// draft. HONEST: no hooks, no data, no fabricated results — it shows the real *format*, not a claim.

const FACTS = [
  { c: "0.97", text: "VP of Engineering at Acme", source: "lead · title", used: true },
  { c: "0.91", text: "Series B · ~180 employees", source: "proof", used: true },
  { c: "0.62", text: "Hiring 4 backend roles", source: "kb", used: false },
];

export function GroundedDraftShowcase() {
  return (
    <article className="relative overflow-hidden rounded-md border border-border bg-card p-5 pl-6 text-left shadow-product ring-1 ring-black/5">
      {/* Evidence rail — confidence encoded in color (high → indigo). Draws in on mount (reduced-motion safe). */}
      <span className="absolute inset-y-0 left-0 w-[3px] origin-top animate-rail-draw bg-primary" aria-hidden />

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-foreground">Quick question on Acme&apos;s Q3 hiring</h3>
        <span className="shrink-0 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          personalized · 0.94
        </span>
      </div>

      <div className="mt-3 rounded-md bg-secondary/50 p-4 text-sm leading-relaxed text-foreground">
        Hi Dana — saw Acme&apos;s backend team is scaling fast off the Series B. Teams growing outbound
        at that stage usually hit deliverability walls before headcount ones. Worth a quick look?
      </div>

      <div className="mt-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Grounded on 3 verified facts
        </div>
        <ul className="mt-1.5 divide-y divide-border/60">
          {FACTS.map((f) => (
            <li
              key={f.text}
              className={`flex items-baseline gap-2.5 py-1 ${f.used ? "" : "opacity-50"}`}
            >
              <span
                className={`size-1.5 shrink-0 self-center rounded-full ${f.used ? "bg-primary" : "bg-border"}`}
                aria-hidden
              />
              <span className="w-9 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                {f.c}
              </span>
              <span className="flex-1 text-sm text-foreground">{f.text}</span>
              <span className="shrink-0 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {f.source}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
          verification: passed · regenerated once
        </p>
      </div>

      {/* Honest mechanic — the real safety state, never a fabricated metric. */}
      <div className="mt-4 flex items-center border-t border-border pt-3">
        <span className="inline-flex items-center gap-1.5 rounded border border-border bg-card px-2 py-1 font-mono text-[11px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
          status: dry_run — no real email until you flip the switch
        </span>
      </div>
    </article>
  );
}
