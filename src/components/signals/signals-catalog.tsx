"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampaignStatus, SignalCatalogRow, SignalCategory } from "@/lib/api-types";
import { useCampaigns } from "@/lib/hooks/use-campaigns";
import {
  useSignals,
  useSubscribeToSignal,
  useUnsubscribeFromSignal,
} from "@/lib/hooks/use-signals";
import { cn } from "@/lib/utils";

const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";
const PILL = "rounded-md px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors";
const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

type TabKey = "all" | "hiring" | "funding" | "other";
const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "hiring", label: "Hiring" },
  { key: "funding", label: "Funding" },
  { key: "other", label: "Other" },
];
const CATEGORY_LABEL: Record<SignalCategory, string> = {
  funding: "Funding",
  hiring: "Hiring",
  other: "Other",
};

/** The minimal campaign shape the picker + the honest "feeding" label need. `status` matters: the
 * backend monitor only enrolls into an ACTIVE campaign, so a paused/draft one isn't really feeding. */
type IntentCampaign = { id: string; name: string; status: CampaignStatus };

export function SignalsCatalog() {
  const [tab, setTab] = useState<TabKey>("all");
  const signals = useSignals();
  const campaigns = useCampaigns();

  // The intent_signals campaigns a signal can feed (the subscribe target). Real data; may be empty.
  const intentCampaigns: IntentCampaign[] = useMemo(
    () =>
      (campaigns.data?.data ?? [])
        .filter((c) => c.campaign_type === "intent_signals")
        .map((c) => ({ id: c.id, name: c.name, status: c.status })),
    [campaigns.data],
  );

  const rows = useMemo(() => signals.data?.data ?? [], [signals.data]);
  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { all: rows.length, hiring: 0, funding: 0, other: 0 };
    for (const r of rows) c[r.category] += 1;
    return c;
  }, [rows]);
  const filtered = useMemo(
    () => (tab === "all" ? rows : rows.filter((r) => r.category === tab)),
    [rows, tab],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className={FOOTNOTE}>
        Subscribe a live signal to an intent-signals campaign — matching leads enroll automatically
        as the signal fires. Real feeds connect at go-live; the catalog below is real.
      </p>

      <div className="flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              PILL,
              t.key === tab
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-secondary",
            )}
          >
            {t.label}
            <span className="ml-1.5 tabular-nums opacity-60">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {signals.isPending && (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      )}
      {signals.isError && (
        <p className="font-mono text-xs text-destructive">
          Couldn’t load signals — check that the backend is running.
        </p>
      )}
      {signals.isSuccess && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No signals in this category.</p>
      )}
      {signals.isSuccess && filtered.length > 0 && (
        <ul className="space-y-2">
          {filtered.map((s) => (
            <li key={s.id}>
              <SignalCard
                signal={s}
                intentCampaigns={intentCampaigns}
                campaignsLoading={campaigns.isPending}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SignalCard({
  signal,
  intentCampaigns,
  campaignsLoading,
}: {
  signal: SignalCatalogRow;
  intentCampaigns: IntentCampaign[];
  campaignsLoading: boolean;
}) {
  const subscribe = useSubscribeToSignal();
  const unsubscribe = useUnsubscribeFromSignal();
  const [campaignId, setCampaignId] = useState("");

  const comingSoon = signal.status === "coming_soon";
  const subscribedCampaign = signal.subscribed
    ? intentCampaigns.find((c) => c.id === signal.campaignId)
    : undefined;

  return (
    <div
      className={cn(
        "rounded-md border p-4",
        comingSoon
          ? "border-dashed border-border bg-card"
          : signal.subscribed
            ? "border-primary/40 bg-accent"
            : "border-border bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "truncate text-sm font-medium",
                comingSoon ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {signal.name}
            </span>
            <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              {CATEGORY_LABEL[signal.category]}
            </span>
          </div>
          {signal.description && (
            <p className="mt-1 text-[13px] text-muted-foreground">{signal.description}</p>
          )}
        </div>
        {signal.subscribed && (
          <span className="shrink-0 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-emerald-700">
            Active
          </span>
        )}
        {comingSoon && (
          <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/70">
            Coming soon
          </span>
        )}
      </div>

      {/* Actions — only for LIVE signals. Coming-soon shows no controls (the split is real). */}
      {!comingSoon && (
        <div className="mt-3 border-t border-border/60 pt-3">
          {signal.subscribed ? (
            <div className="flex items-center justify-between gap-3">
              <p className={FOOTNOTE}>
                {/* Honest: only an ACTIVE campaign actually enrolls signal leads. A paused/draft one
                    is linked but holds events until it's active — don't imply live enrollment. */}
                {subscribedCampaign ? (
                  <>
                    {subscribedCampaign.status === "active" ? "feeding " : "linked to "}
                    <Link
                      href={`/campaigns/${subscribedCampaign.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {subscribedCampaign.name}
                    </Link>
                    {subscribedCampaign.status !== "active" &&
                      ` · ${subscribedCampaign.status} — leads enroll once it’s active`}
                  </>
                ) : (
                  "linked to an intent-signals campaign"
                )}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={unsubscribe.isPending}
                onClick={() => unsubscribe.mutate(signal.id)}
              >
                Unsubscribe
              </Button>
            </div>
          ) : campaignsLoading ? (
            <Skeleton className="h-8 w-full rounded-lg" />
          ) : intentCampaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No intent-signals campaign yet —{" "}
              <Link href="/campaigns" className="font-medium text-primary hover:underline">
                create one to subscribe →
              </Link>
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                disabled={subscribe.isPending}
                className={SELECT_CLASS}
              >
                <option value="">Feed which campaign…</option>
                {intentCampaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                disabled={subscribe.isPending || !campaignId}
                onClick={() => subscribe.mutate({ signalId: signal.id, campaignId })}
              >
                Subscribe
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
