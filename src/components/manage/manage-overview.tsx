"use client";

import {
  Award,
  BookOpen,
  Check,
  ChevronDown,
  Gauge,
  Globe,
  Inbox,
  ListChecks,
  type LucideIcon,
  Mail,
  MessageSquare,
  PenLine,
  Plug,
  Target,
  UserPlus,
  Workflow,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

// Per-quest icon + one-line description — PRESENTATION ONLY, keyed by the real quest keys from the
// backend catalog (billing/quests.ts). Purely decorative: it changes nothing about which quests exist,
// their completion, or their (real, idempotent) credit payout. Descriptions are honest about what each
// step does and imply no capability we don't have (e.g. autopilot stays a deliberate opt-in, not 1-click).
const QUEST_META: Record<string, { icon: LucideIcon; desc: string }> = {
  "connect-primary-mailbox": { icon: Mail, desc: "Attach the inbox Ava sends from." },
  "email-signature": { icon: PenLine, desc: "Add your sign-off to every email." },
  "add-sending-domain": { icon: Globe, desc: "Register the domain you send from." },
  "secondary-mailboxes": { icon: Inbox, desc: "Add more warm inboxes to raise daily volume." },
  "add-coaching": { icon: MessageSquare, desc: "Teach Ava your tone and angle." },
  "add-proof": { icon: Award, desc: "Give Ava verifiable results to cite." },
  "add-knowledge-source": { icon: BookOpen, desc: "Feed Ava a page to ground on." },
  "define-icp": { icon: Target, desc: "Describe who you sell to." },
  "save-leads": { icon: UserPlus, desc: "Save your first prospects." },
  "create-a-list": { icon: ListChecks, desc: "Group leads into a target list." },
  "build-a-sequence": { icon: Workflow, desc: "Set up your campaign steps." },
  "launch-signal-campaign": { icon: Zap, desc: "Target prospects surfaced by a signal." },
  "connect-a-source": { icon: Plug, desc: "Connect a CRM, signal, or pixel lead source." },
  "turn-on-autopilot": { icon: Gauge, desc: "Let Ava auto-approve qualifying drafts — a deliberate opt-in." },
};

type Quest = {
  key: string;
  label: string;
  href: string;
  done: boolean;
  reward: number;
  awarded: boolean;
};

function QuestRow({ q, isNext, compact }: { q: Quest; isNext: boolean; compact?: boolean }) {
  const Icon = QUEST_META[q.key]?.icon ?? Target;
  const desc = QUEST_META[q.key]?.desc;
  return (
    <Link
      href={q.href}
      className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent/50"
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md border",
          q.done
            ? "border-primary/30 bg-accent text-primary"
            : "border-border bg-secondary/40 text-muted-foreground group-hover:text-foreground",
        )}
        aria-hidden
      >
        {q.done ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "truncate text-sm",
              q.done ? "text-muted-foreground line-through" : "font-medium text-foreground",
            )}
          >
            {q.label}
          </span>
          {isNext && (
            <span className="shrink-0 rounded-full border border-primary/30 bg-accent px-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
              Next
            </span>
          )}
        </span>
        {!compact && desc && (
          <span className="mt-0.5 block truncate text-[13px] leading-snug text-muted-foreground">{desc}</span>
        )}
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
  );
}

// The 14-quest onboarding card (Slice 4.10). Completion + credit rewards are REAL: each quest is
// derived from real org state and pays its credits exactly once (idempotent, backend-side). `awarded`
// reflects credits actually posted to the ledger — never a fabricated number. This pass enriches the
// PRESENTATION only (icons, descriptions, a Next cue, hide + remaining/completed grouping); the quest
// data, hrefs, and payout are byte-unchanged.
function QuestsCard() {
  const quests = useQuests();
  const [hidden, setHidden] = useState(false);
  const [showDone, setShowDone] = useState(false);

  if (quests.isPending) return <Skeleton className="h-72 w-full rounded-md" />;
  if (quests.isError)
    return (
      <Card>
        <h2 className={EYEBROW}>Onboarding</h2>
        <p className="mt-2 font-mono text-xs text-destructive">Couldn’t load quests — check the backend.</p>
      </Card>
    );

  const { quests: items, completed, total, creditsEarned } = quests.data.data;
  const remaining = items.filter((q) => !q.done);
  const done = items.filter((q) => q.done);
  const nextKey = remaining[0]?.key;

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className={EYEBROW}>Onboarding quests</h2>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm tabular-nums text-foreground">
            {completed} of {total} complete
          </span>
          <button
            type="button"
            onClick={() => setHidden((h) => !h)}
            className="font-mono text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {hidden ? "Show" : "Hide"}
          </button>
        </div>
      </div>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
        <CountUp value={creditsEarned} /> credits earned — each quest pays real credits as you complete it
      </p>
      {/* At-a-glance progress track (same recipe as the deliverability volume bar). */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-[width] duration-500"
          style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          aria-hidden
        />
      </div>

      {!hidden && (
        <>
          {/* Remaining — the active work, with the single recommended next step flagged. */}
          <ul className="mt-3 space-y-0.5">
            {remaining.map((q) => (
              <li key={q.key}>
                <QuestRow q={q} isNext={q.key === nextKey} />
              </li>
            ))}
          </ul>
          {remaining.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">All set — every onboarding quest is complete. 🎉</p>
          )}

          {/* Completed — collapsed by default so the remaining work stays front and center. */}
          {done.length > 0 && (
            <div className="mt-2 border-t border-border/60 pt-2">
              <button
                type="button"
                onClick={() => setShowDone((s) => !s)}
                className="flex w-full items-center gap-1.5 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className={cn("size-3.5 transition-transform", showDone && "rotate-180")} aria-hidden />
                Completed · {done.length}
              </button>
              {showDone && (
                <ul className="space-y-0.5">
                  {done.map((q) => (
                    <li key={q.key}>
                      <QuestRow q={q} isNext={false} compact />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
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

      {/* Send outcomes — honest-empty band. These are NOT real numbers: pre-go-live there are no real
          sends, so each tile is a dashed placeholder (never a fabricated 0/percentage) that reads
          clearly as "measured after go-live". The real series lives in Analytics; this is a signpost. */}
      <Card>
        <h2 className={`${EYEBROW} mb-3`}>Send outcomes</h2>
        <div className="grid grid-cols-3 gap-3">
          {(["Opens", "Replies", "Meetings"] as const).map((label) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-muted/30 p-4 text-center dark:border-muted-foreground/30"
            >
              <span className="font-mono text-lg tabular-nums text-muted-foreground">—</span>
              <span className="text-[13px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          Outcomes (open · reply · meetings) populate in{" "}
          <Link href="/analytics" className="text-primary hover:underline">
            Analytics
          </Link>{" "}
          after go-live. Real send volume &amp; suppression live in{" "}
          <Link href="/deliverability" className="text-primary hover:underline">
            Deliverability
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
