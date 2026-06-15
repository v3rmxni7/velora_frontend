"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useCampaigns } from "@/lib/hooks/use-campaigns";
import { useCredits } from "@/lib/hooks/use-credits";
import { useCoachingPoints, useKbDocuments, useProofItems, useSendingMode } from "@/lib/hooks/use-knowledge";
import { useLeads } from "@/lib/hooks/use-leads";
import { useMailboxes, useDomains } from "@/lib/hooks/use-senders";
import { useTaskCounts } from "@/lib/hooks/use-task-counts";
import { useTasks } from "@/lib/hooks/use-tasks";
import { cn } from "@/lib/utils";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border border-border bg-card p-5">{children}</div>;
}

export function ManageOverview() {
  const mailboxes = useMailboxes();
  const domains = useDomains();
  const coaching = useCoachingPoints();
  const proof = useProofItems();
  const leads = useLeads();
  const campaigns = useCampaigns();
  const kb = useKbDocuments();
  const mode = useSendingMode();
  const credits = useCredits();
  const counts = useTaskCounts();
  const tasks = useTasks();

  const live = !!mode.data?.data?.sendingEnabled && !mode.data?.data?.dryRun;

  // Setup milestones — completion derived from REAL state (each from its own endpoint).
  const items = [
    { label: "Connect a mailbox", done: (mailboxes.data?.data ?? []).length > 0, href: "/senders" },
    { label: "Add a sending domain", done: (domains.data?.data ?? []).length > 0, href: "/senders" },
    { label: "Add agent coaching", done: (coaching.data?.data ?? []).length > 0, href: "/manage" },
    { label: "Add proof points", done: (proof.data?.data ?? []).length > 0, href: "/manage" },
    { label: "Save leads", done: (leads.data?.data ?? []).length > 0, href: "/leads" },
    { label: "Create a campaign", done: (campaigns.data?.data ?? []).length > 0, href: "/campaigns" },
    { label: "Add knowledge sources", done: (kb.data?.data ?? []).length > 0, href: "/manage" },
    { label: "Go live (deliberate flip)", done: live, href: "/senders" },
  ];
  const completed = items.filter((i) => i.done).length;

  const warm = (mailboxes.data?.data ?? []).filter((m) => m.status === "warm").length;
  const pending = counts.data?.pending.outbound_approval ?? 0;
  const pendingTasks = (tasks.data?.data ?? []).filter((t) => t.status === "pending").slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Setup checklist */}
      <Card>
        <div className="flex items-baseline justify-between">
          <h2 className={EYEBROW}>Setup</h2>
          <span className="font-mono text-sm tabular-nums text-foreground">
            {completed} of {items.length} complete
          </span>
        </div>
        <ul className="mt-3 space-y-1">
          {items.map((i) => (
            <li key={i.label}>
              <Link
                href={i.href}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary/60"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border",
                    i.done ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                  aria-hidden
                >
                  {i.done && <Check className="size-3" />}
                </span>
                <span className={i.done ? "text-muted-foreground line-through" : "text-foreground"}>
                  {i.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
          completion tracks real configuration; credit rewards arrive with billing
        </p>
      </Card>

      {/* Agent status */}
      <Card>
        <h2 className={`${EYEBROW} mb-3`}>Agent status</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <div className="font-mono text-[11px] text-muted-foreground">sending</div>
            <div
              className={cn(
                "mt-0.5 font-mono text-sm",
                live ? "text-emerald-700" : "text-muted-foreground",
              )}
            >
              {live ? "live" : "dry-run"}
            </div>
          </div>
          <div>
            <div className="font-mono text-[11px] text-muted-foreground">warm mailboxes</div>
            <div className="mt-0.5 font-mono text-sm tabular-nums text-foreground">{warm}</div>
          </div>
          <div>
            <div className="font-mono text-[11px] text-muted-foreground">campaigns</div>
            <div className="mt-0.5 font-mono text-sm tabular-nums text-foreground">
              {(campaigns.data?.data ?? []).length}
            </div>
          </div>
          <div>
            <div className="font-mono text-[11px] text-muted-foreground">credits</div>
            <div className="mt-0.5 font-mono text-sm tabular-nums text-foreground">
              {credits.data?.data.balance?.toLocaleString() ?? "—"}
            </div>
          </div>
        </div>
        {!live && (
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            sending is paused (dry-run) until the deliberate go-live flip — nothing reaches a real
            inbox
          </p>
        )}
      </Card>

      {/* Needs your input */}
      <Card>
        <div className="flex items-baseline justify-between">
          <h2 className={EYEBROW}>Needs your input</h2>
          <span className="font-mono text-sm tabular-nums text-foreground">{pending}</span>
        </div>
        {pending === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No drafts awaiting approval.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {pendingTasks.map((t) => (
              <li key={t.id} className="truncate text-sm text-foreground">
                {t.subject ?? "(no subject)"}
              </li>
            ))}
            <li>
              <Link
                href="/engage"
                className="text-sm font-medium text-primary hover:underline"
              >
                Review in Tasks →
              </Link>
            </li>
          </ul>
        )}
      </Card>

      {/* Honest deferral — outcome analytics need real sends */}
      <p className="font-mono text-[11px] text-muted-foreground">
        Send outcomes (open · reply · meetings) populate in Analytics after go-live. Real send
        volume &amp; suppression live in{" "}
        <Link href="/deliverability" className="text-primary hover:underline">
          Deliverability
        </Link>
        .
      </p>
    </div>
  );
}
