"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ManageAutonomousReplies } from "./manage-autonomous-replies";
import { ManageGuardrails } from "./manage-guardrails";
import { ManageKnowledge } from "./manage-knowledge";
import { ManageOverview } from "./manage-overview";

type TabKey = "overview" | "knowledge" | "replies" | "guardrails";
const TABS: { key: TabKey; label: string; soon?: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "knowledge", label: "Knowledge" },
  { key: "replies", label: "Autonomous replies" },
  { key: "guardrails", label: "Guardrails" },
];

function Coming({ label }: { label: string }) {
  return (
    <div className="mx-auto flex h-48 max-w-3xl flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-card text-center">
      <p className="text-sm text-muted-foreground">Not yet available</p>
      <p className="font-mono text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function ManageHub() {
  const [tab, setTab] = useState<TabKey>("overview");
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <div className="space-y-5">
      <div className="mx-auto max-w-3xl">
        <div className="inline-flex gap-0.5 rounded-lg border border-border bg-secondary/40 p-0.5">
          {TABS.map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-all",
                t.key === tab
                  ? "bg-card text-primary shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" ? (
        <ManageOverview />
      ) : tab === "knowledge" ? (
        <ManageKnowledge />
      ) : tab === "guardrails" ? (
        <ManageGuardrails />
      ) : tab === "replies" ? (
        <ManageAutonomousReplies />
      ) : (
        <Coming label={active.soon ?? "coming soon"} />
      )}
    </div>
  );
}
