"use client";

import type { AnalyticsRangeArg } from "@/lib/api";
import { useAnalyticsMessaging } from "@/lib/hooks/use-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CHIP, EYEBROW, ExportButton, FOOTNOTE } from "./analytics-ui";

// Statuses worth surfacing as chips, in lifecycle order (zeros included — a real 0 is data).
const STATUS_ORDER = [
  "dry_run",
  "queued",
  "sent",
  "delivered",
  "opened",
  "clicked",
  "replied",
  "bounced",
  "complained",
  "failed",
];

export function MessagingTab({ range }: { range: AnalyticsRangeArg }) {
  const q = useAnalyticsMessaging(range);
  if (q.isPending) return <Skeleton className="h-72 w-full rounded-md" />;
  if (q.isError) {
    return <p className="font-mono text-xs text-destructive">Couldn’t load messaging analytics.</p>;
  }
  const d = q.data.data;

  return (
    <div className="space-y-6">
      <Card>
        <div className={`${EYEBROW} mb-3`}>Messages by status</div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_ORDER.map((s) => (
            <span key={s} className={CHIP}>
              {s.replace(/_/g, " ")} {d.byStatus[s] ?? 0}
            </span>
          ))}
        </div>
        <p className={`${FOOTNOTE} mt-3`}>
          dry-run = a reviewed, would-send draft; real sends light up after go-live
        </p>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className={EYEBROW}>By campaign</div>
          <ExportButton filename="analytics-by-campaign.csv" rows={d.byCampaign} />
        </div>
        {d.byCampaign.length === 0 ? (
          <p className="text-sm text-muted-foreground">No campaign activity in this window.</p>
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-left">
                  <th className="px-3 py-2 font-medium text-muted-foreground">Campaign</th>
                  <th className="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    Drafts
                  </th>
                  <th className="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    Sent
                  </th>
                  <th className="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    Replies
                  </th>
                  <th className="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    Positive
                  </th>
                </tr>
              </thead>
              <tbody>
                {d.byCampaign.map((c) => (
                  <tr key={c.campaignId} className="border-b border-border/60 last:border-b-0">
                    <td className="px-3 py-2 text-foreground">{c.name}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">{c.drafts}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">{c.sent}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">{c.replies}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">{c.positive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* A/Z by variant (4.4). Rendered only when variants exist + have activity. Real counts only —
          no rate/winner column; the comparison is honest-empty until real sends accrue. */}
      {d.byVariant.length > 0 && (
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className={EYEBROW}>By variant / personalization</div>
            <ExportButton filename="analytics-by-variant.csv" rows={d.byVariant} />
          </div>
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-left">
                  <th className="px-3 py-2 font-medium text-muted-foreground">Variant</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">Campaign</th>
                  {(["Drafts", "Sent", "Replies", "Positive"] as const).map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.byVariant.map((v) => (
                  <tr key={v.variantId} className="border-b border-border/60 last:border-b-0">
                    <td className="px-3 py-2 font-mono text-foreground">{v.label}</td>
                    <td className="px-3 py-2 text-muted-foreground">{v.campaignName}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">{v.drafts}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">{v.sent}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">{v.replies}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">{v.positive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`${FOOTNOTE} mt-3`}>
            {d.realSends === 0
              ? "dry-run draft split — reply-rate comparison + winner populate after your first real sends"
              : "leads split evenly; no winner is picked until real replies accrue"}{" "}
            · variant rows count only messages still linked to an enrollment
          </p>
        </Card>
      )}
    </div>
  );
}
