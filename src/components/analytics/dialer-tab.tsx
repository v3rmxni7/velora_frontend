"use client";

import type { AnalyticsRangeArg } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsDialer } from "@/lib/hooks/use-analytics";
import { Card, CHIP, EYEBROW, FOOTNOTE, NotYet, Stat, TrendChart } from "./analytics-ui";

// Honest-by-construction: while no calls are logged this stays the dashed NotYet (a genuine "not in
// use yet"); it flips to REAL stats once loggedCalls > 0. connectRate is shown only when measurable.
export function DialerTab({ range }: { range: AnalyticsRangeArg }) {
  const q = useAnalyticsDialer(range);
  if (q.isPending) return <Skeleton className="h-56 w-full rounded-md" />;
  if (q.isError)
    return <p className="font-mono text-xs text-destructive">Couldn’t load dialer analytics.</p>;
  const d = q.data.data;

  if (d.loggedCalls === 0) {
    return (
      <div className="mx-auto max-w-md">
        <NotYet label="Dialer analytics" reason="dialer" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Calls logged" value={d.loggedCalls} />
        {d.connectRate != null && (
          <Stat label="Connect rate" value={`${Math.round(d.connectRate * 100)}%`} hint="of attempted dials" />
        )}
      </div>

      <Card>
        <div className={`${EYEBROW} mb-3`}>By outcome</div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(d.byOutcome).length === 0 ? (
            <p className="text-sm text-muted-foreground">No outcomes logged yet.</p>
          ) : (
            Object.entries(d.byOutcome).map(([o, n]) => (
              <span key={o} className={CHIP}>
                {o.replace(/_/g, " ")} {n}
              </span>
            ))
          )}
        </div>
        <p className={`${FOOTNOTE} mt-3`}>logged from real calls a rep placed (the agent never dials)</p>
      </Card>

      <Card>
        <div className={`${EYEBROW} mb-3`}>Calls by day</div>
        <TrendChart
          data={d.series}
          lines={[
            { key: "calls", label: "Calls", color: "indigo" },
            { key: "connected", label: "Connected", color: "emerald" },
          ]}
        />
      </Card>
    </div>
  );
}
