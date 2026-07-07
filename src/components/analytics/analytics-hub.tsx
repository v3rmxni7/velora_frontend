"use client";

import { CalendarRange } from "lucide-react";
import { useMemo, useState } from "react";
import { DeliverabilityView } from "@/components/deliverability/deliverability-view";
import { cn } from "@/lib/utils";
import { CreditsTab } from "./credits-tab";
import { DialerTab } from "./dialer-tab";
import { MessagingTab } from "./messaging-tab";
import { OverviewTab } from "./overview-tab";

type TabKey = "overview" | "messaging" | "deliverability" | "dialer" | "credits";
const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "messaging", label: "Messaging" },
  { key: "deliverability", label: "Deliverability" },
  { key: "dialer", label: "Dialer" },
  { key: "credits", label: "Credits" },
];
const PRESETS = [7, 30, 90];
const WINDOWED: TabKey[] = ["overview", "messaging", "credits", "dialer"];

const PILL = "rounded-md px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-all";
const SEG_GROUP = "inline-flex gap-0.5 rounded-lg border border-border bg-secondary/40 p-0.5";
const SEG_ACTIVE = "bg-card text-primary shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]";
const SEG_INACTIVE = "text-muted-foreground hover:text-foreground";

export function AnalyticsHub() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [days, setDays] = useState(30);
  // Memoized on `days` so the window (and the query keys) stay stable until the preset changes —
  // recomputing `to = now` every render would thrash the queries.
  const range = useMemo(() => {
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [days]);
  // Human-readable label for the resolved window — purely presentational (derived from `range`, no
  // new query, no recomputation of any metric). Lets a reviewer see exactly which days are in view.
  const rangeLabel = useMemo(() => {
    const fmt = (iso: string) =>
      new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${fmt(range.from)} – ${fmt(range.to)}`;
  }, [range]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={SEG_GROUP}>
          {TABS.map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(PILL, t.key === tab ? SEG_ACTIVE : SEG_INACTIVE)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {WINDOWED.includes(tab) && (
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 font-mono text-[11px] text-muted-foreground sm:inline-flex">
              <CalendarRange className="size-3.5" aria-hidden />
              {rangeLabel} · daily
            </span>
            <div className={SEG_GROUP}>
              {PRESETS.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDays(d)}
                  className={cn(PILL, d === days ? SEG_ACTIVE : SEG_INACTIVE)}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {tab === "overview" ? (
        <OverviewTab range={range} />
      ) : tab === "messaging" ? (
        <MessagingTab range={range} />
      ) : tab === "deliverability" ? (
        <DeliverabilityView />
      ) : tab === "credits" ? (
        <CreditsTab range={range} />
      ) : (
        <DialerTab range={range} />
      )}
    </div>
  );
}
