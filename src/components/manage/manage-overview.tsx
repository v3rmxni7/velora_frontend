"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { CountUp } from "@/components/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaigns } from "@/lib/hooks/use-campaigns";
import { useCredits } from "@/lib/hooks/use-credits";
import { useSendingMode } from "@/lib/hooks/use-knowledge";
import { useQuests } from "@/lib/hooks/use-quests";
import { useMailboxes } from "@/lib/hooks/use-senders";
import { useTaskCounts } from "@/lib/hooks/use-task-counts";
import { useTasks } from "@/lib/hooks/use-tasks";
import { cn } from "@/lib/utils";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
      {children}
    </div>
  );
}

// The 14-quest onboarding card (Slice 4.10). Completion + credit rewards are REAL: each quest is
// derived from real org state and pays its credits exactly once (idempotent, backend-side). `awarded`
// reflects credits actually posted to the ledger — never a fabricated number.
function QuestsCard() {
  const quests = useQuests();

  if (quests.isPending) return <Skeleton className="h-72 w-full rounded-md" />;
  if (quests.isError)
    return (
      <Card>
        <h2 className={EYEBROW}>Onboarding</h2>
        <p className="mt-2 font-mono text-xs text-destructive">Couldn’t load quests — check the backend.</p>
      </Card>
    );

  const { quests: items, completed, total, creditsEarned } = quests.data.data;

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className={EYEBROW}>Onboarding quests</h2>
        <span className="font-mono text-sm tabular-nums text-foreground">
          {completed} of {total} complete
        </span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
        <CountUp value={creditsEarned} /> credits earned — each quest pays real credits as you complete it
      </p>
      {/* At-a-glance progress track (same recipe as the deliverability volume bar). */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary"
          style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          aria-hidden
        />
      </div>
      <ul className="mt-3 space-y-1">
        {items.map((q) => (
          <li key={q.key}>
            <Link
              href={q.href}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent/50"
            >
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border",
                  q.done ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}
                aria-hidden
              >
                {q.done && <Check className="size-3" />}
              </span>
              <span className={cn("flex-1", q.done ? "text-muted-foreground line-through" : "text-foreground")}>
                {q.label}
              </span>
              <span
                className={cn(
                  "shrink-0 font-mono text-[11px] tabular-nums",
                  q.awarded ? "text-emerald-700" : "text-muted-foreground",
                )}
              >
                {q.awarded ? `+${q.reward.toLocaleString()} earned` : `+${q.reward.toLocaleString()}`}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function ManageOverview() {
  const mailboxes = useMailboxes();
  const campaigns = useCampaigns();
  const mode = useSendingMode();
  const credits = useCredits();
  const counts = useTaskCounts();
  const tasks = useTasks();

  const live = !!mode.data?.data?.sendingEnabled && !mode.data?.data?.dryRun;
  const warm = (mailboxes.data?.data ?? []).filter((m) => m.status === "warm").length;
  const pending = counts.data?.pending.outbound_approval ?? 0;
  const pendingTasks = (tasks.data?.data ?? []).filter((t) => t.status === "pending").slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <QuestsCard />

      {/* Agent status */}
      <Card>
        <h2 className={`${EYEBROW} mb-3`}>Agent status</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <div className="font-mono text-[11px] text-muted-foreground">sending</div>
            <div className={cn("mt-0.5 font-mono text-sm", live ? "text-emerald-700" : "text-muted-foreground")}>
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
              <Link href="/engage" className="text-sm font-medium text-primary hover:underline">
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
