"use client";

import type { AnalyticsRangeArg } from "@/lib/api";
import { useAnalyticsCredits } from "@/lib/hooks/use-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CHIP, EYEBROW, ExportButton, FOOTNOTE, Stat, TrendChart } from "./analytics-ui";

export function CreditsTab({ range }: { range: AnalyticsRangeArg }) {
  const q = useAnalyticsCredits(range);
  if (q.isPending) return <Skeleton className="h-72 w-full rounded-md" />;
  if (q.isError) {
    return <p className="font-mono text-xs text-destructive">Couldn’t load credit analytics.</p>;
  }
  const d = q.data.data;
  const reasons = Object.entries(d.byReason).filter(([, n]) => n !== 0);

  return (
    <div className="space-y-6">
      {/* All-time ledger totals — fully real. */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Balance" value={d.balance} hint="all-time" />
        <Stat label="Granted" value={d.granted} hint="all-time" />
        <Stat label="Used" value={d.used} hint="all-time" />
      </div>

      <Card>
        <div className={`${EYEBROW} mb-3`}>Burn by reason (window)</div>
        {reasons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No credit activity in this window.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {reasons.map(([reason, n]) => (
              <span key={reason} className={CHIP}>
                {reason.replace(/_/g, " ")} {n > 0 ? `+${n}` : n}
              </span>
            ))}
          </div>
        )}
        <p className={`${FOOTNOTE} mt-3`}>signup grants credit; sends &amp; replies debit it</p>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className={EYEBROW}>Credit flow over time</div>
          <ExportButton filename="analytics-credits.csv" rows={d.series} />
        </div>
        <TrendChart
          data={d.series}
          lines={[
            { key: "granted", label: "Granted", color: "emerald" },
            { key: "used", label: "Used", color: "indigo" },
          ]}
        />
      </Card>
    </div>
  );
}
