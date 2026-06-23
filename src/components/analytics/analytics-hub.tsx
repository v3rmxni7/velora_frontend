"use client";

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

const PILL = "rounded-md px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors";

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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                PILL,
                t.key === tab
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {WINDOWED.includes(tab) && (
          <div className="flex items-center gap-1">
            {PRESETS.map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => setDays(d)}
                className={cn(
                  PILL,
                  d === days
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50",
                )}
              >
                {d}D
              </button>
            ))}
            <span className="ml-1 font-mono text-[11px] text-muted-foreground">· daily</span>
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
