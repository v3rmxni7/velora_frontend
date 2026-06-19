"use client";

import type { AnalyticsRangeArg } from "@/lib/api";
import { useAnalyticsOverview } from "@/lib/hooks/use-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  EYEBROW,
  ExportButton,
  FOOTNOTE,
  NotYet,
  RateOrEmpty,
  Stat,
  TrendChart,
} from "./analytics-ui";

export function OverviewTab({ range }: { range: AnalyticsRangeArg }) {
  const q = useAnalyticsOverview(range);
  if (q.isPending) return <Skeleton className="h-80 w-full rounded-md" />;
  if (q.isError) {
    return <p className="font-mono text-xs text-destructive">Couldn’t load analytics.</p>;
  }
  const d = q.data.data;
  const k = d.kpis;

  return (
    <div className="space-y-6">
      {/* REAL counts — a genuine 0 is data. */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Leads enrolled" value={k.leadsEnrolled} />
        <Stat label="Drafts generated" value={k.draftsGenerated} />
        <Stat label="Real sends" value={k.realSends} hint="non-dry-run" />
        <Stat label="Replies" value={k.replies} />
        <Stat label="Positive replies" value={k.positiveReplies} />
      </div>

      {/* Rates: honest-empty until there are real sends. Meetings/Connections: feature-not-connected. */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <RateOrEmpty label="Reply rate" numerator={k.replies} denominator={k.realSends} />
        <RateOrEmpty label="Positive rate" numerator={k.positiveReplies} denominator={k.realSends} />
        <NotYet label="Meetings booked" reason="meetings" />
        <NotYet label="Connections (LinkedIn)" reason="connections" />
      </div>

      {/* REAL by-day trend (enrolled + drafts). The send/response trend stays honest-empty. */}
      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className={EYEBROW}>Activity over time</div>
          <ExportButton filename="analytics-overview.csv" rows={d.series} />
        </div>
        <TrendChart
          data={d.series}
          lines={[
            { key: "enrolled", label: "Enrolled", color: "indigo" },
            { key: "drafts", label: "Drafts", color: "slate" },
          ]}
        />
        <p className={`${FOOTNOTE} mt-2`}>
          enrolled + drafts are live; send &amp; response trends populate after your first real sends
        </p>
      </Card>
    </div>
  );
}
