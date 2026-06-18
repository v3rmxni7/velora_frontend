"use client";

import { EYEBROW, FOOTNOTE, NotYet, Stat } from "@/components/analytics/analytics-ui";
import type { WebsiteVisitorSummary } from "@/lib/api-types";

// The metrics row. Two clearly-distinct groups so a reviewer is never misled:
//   "Anonymous visits"   — REAL counts from the pixel (a genuine 0 is data) → solid Stat cards.
//   "Identified visitors" — SPEC §3.10's "Identified today/7d/30d". 0 until a de-anon resolver
//                            connects, so it renders the honest-empty NotYet card (NOT the visit
//                            count under an "Identified" label — that would be fabrication).
export function VisitorMetrics({ summary }: { summary: WebsiteVisitorSummary }) {
  const v = summary.visitCounts;
  const i = summary.identifiedCounts;
  return (
    <section className="space-y-5">
      <div>
        <h2 className={`${EYEBROW} mb-3`}>Anonymous visits</h2>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Today" value={v.today} />
          <Stat label="7 days" value={v.d7} />
          <Stat label="30 days" value={v.d30} />
        </div>
        <p className={`${FOOTNOTE} mt-2`}>real page views recorded by the pixel</p>
      </div>

      <div>
        <h2 className={`${EYEBROW} mb-3`}>Identified visitors</h2>
        {summary.resolverConnected ? (
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Today" value={i.today} />
            <Stat label="7 days" value={i.d7} />
            <Stat label="30 days" value={i.d30} />
          </div>
        ) : (
          <NotYet label="Identified today / 7d / 30d" reason="website_visitors" />
        )}
      </div>
    </section>
  );
}
