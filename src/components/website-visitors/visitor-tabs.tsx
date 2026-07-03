"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";
const PILL =
  "rounded-md px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors";

type Tab = "people" | "companies";

// People vs Companies (SPEC §3.10). De-anonymization is 🔌 not connected (and there is no identity
// directory endpoint in this slice), so both tabs are honest-empty — no fabricated identities, and no
// false promise that a list will populate here. The directory itself ships with the de-anon connection.
// Companies are labeled display-only (no email → account intelligence, never contacted directly —
// matches the backend's no_email dead-end).
export function VisitorTabs() {
  const [tab, setTab] = useState<Tab>("people");
  return (
    <section>
      <h2 className={`${EYEBROW} mb-3`}>People &amp; companies</h2>
      <div className="mb-3 inline-flex flex-wrap gap-0.5 rounded-lg border border-border bg-secondary/40 p-0.5">
        {(["people", "companies"] as Tab[]).map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              PILL,
              t === tab
                ? "bg-card text-primary shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "people" ? "People" : "Companies"}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">No identified {tab} yet.</p>
        <p className={FOOTNOTE}>de-anonymization activates when a resolution provider is connected</p>
        {tab === "companies" && (
          <p className={`${FOOTNOTE} mt-1`}>
            company-level visitors are account intelligence — shown here, not contacted directly
          </p>
        )}
      </div>
    </section>
  );
}
