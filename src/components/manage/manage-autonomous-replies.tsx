"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task } from "@/lib/api-types";
import {
  useApproveReplyDraft,
  useAutonomy,
  useRejectReplyDraft,
  useReplyDrafts,
} from "@/lib/hooks/use-autonomy";
import { cn } from "@/lib/utils";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const CHIP = "rounded border px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap";
const ON = "border-primary/30 bg-accent text-accent-foreground";
const MUTED = "border-border bg-card text-muted-foreground";

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border border-border bg-card p-5">{children}</div>;
}

const MODES: { key: "off" | "draft" | "send"; meaning: string }[] = [
  { key: "off", meaning: "Every reply routes to a human. Ava never replies." },
  { key: "draft", meaning: "Ava drafts a reply for your approval; nothing sends without you." },
  { key: "send", meaning: "Ava sends qualifying replies autonomously, within the guardrails." },
];

// The confidence rail, same encoding as the cold Engage queue — color, not a gauge.
function railColor(task: Task): string {
  if (task.draft_mode === "template") return "bg-[#9CA3AF]";
  const c = task.confidence ?? 0;
  if (c >= 0.75) return "bg-primary";
  if (c >= 0.5) return "bg-indigo-300";
  return "bg-[#9CA3AF]";
}

// A drafted reply awaiting human review. Approving sends Ava's reply via the backend chokepoint
// (executeReplySend) — dry-run until the deliberate go-live flip. Lighter grounding receipt than
// the cold Engage card: the chip + the verification line, not the full fact list.
function ReplyDraftCard({ task }: { task: Task }) {
  const approve = useApproveReplyDraft();
  const reject = useRejectReplyDraft();
  const grounding = task.grounding;
  const isTemplate = task.draft_mode === "template";
  const busy = approve.isPending || reject.isPending;

  return (
    <article className="relative overflow-hidden rounded-md border border-border bg-card p-5 pl-6">
      <span className={cn("absolute inset-y-0 left-0 w-[3px]", railColor(task))} aria-hidden />

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-foreground">{task.subject ?? "(no subject)"}</h3>
        <span className={cn(CHIP, MUTED, "shrink-0")}>
          {isTemplate
            ? "template · safe fallback"
            : `personalized · ${(task.confidence ?? 0).toFixed(2)}`}
        </span>
      </div>

      <div className="mt-3 whitespace-pre-line rounded-md bg-secondary/50 p-4 text-sm text-foreground">
        {task.body}
      </div>

      <p className="mt-3 font-mono text-[11px] text-muted-foreground">
        {isTemplate
          ? `reason: ${task.reason ?? "insufficient verified facts"}`
          : grounding
            ? `grounded on ${grounding.facts.length} verified fact${
                grounding.facts.length === 1 ? "" : "s"
              } · verification: ${grounding.verification.ok ? "passed" : "failed"}${
                grounding.verification.regenerated ? " · regenerated once" : ""
              }`
            : "no grounding recorded"}
      </p>

      <div className="mt-4 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => approve.mutate(task.id)} disabled={busy}>
            Approve & send
          </Button>
          <Button size="sm" variant="outline" onClick={() => reject.mutate(task.id)} disabled={busy}>
            Reject
          </Button>
        </div>
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
          approving sends Ava’s reply — dry-run until go-live, no real email before then
        </p>
      </div>
    </article>
  );
}

export function ManageAutonomousReplies() {
  const autonomy = useAutonomy();
  const drafts = useReplyDrafts();
  const mode = autonomy.data?.data?.autoReplyMode;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Reply mode — read-only; switching it on is a deliberate runbook step. */}
      <Card>
        <h2 className={`${EYEBROW} mb-3`}>Reply mode</h2>
        {autonomy.isPending ? (
          <Skeleton className="h-24 w-full rounded-md" />
        ) : autonomy.isError || !mode ? (
          <p className="font-mono text-xs text-destructive">Couldn’t load the reply mode.</p>
        ) : (
          <ul className="space-y-2">
            {MODES.map((m) => {
              const active = m.key === mode;
              return (
                <li
                  key={m.key}
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-3",
                    active ? "border-primary/30 bg-accent/40" : "border-border",
                  )}
                >
                  <span className={cn(CHIP, active ? ON : MUTED, "mt-0.5")}>{m.key}</span>
                  <span className={cn("text-sm", active ? "text-foreground" : "text-muted-foreground")}>
                    {m.meaning}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          reply mode is set deliberately (a runbook step) — there is no UI toggle for it.
        </p>
      </Card>

      {/* Reply drafts — the reply_approval review queue. */}
      <Card>
        <h2 className={`${EYEBROW} mb-1`}>Replies for review</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Replies Ava drafted, waiting for your approval. Newest first.
        </p>
        {drafts.isPending && <Skeleton className="h-32 w-full rounded-md" />}
        {drafts.isError && (
          <p className="font-mono text-xs text-destructive">Couldn’t load the reply drafts.</p>
        )}
        {drafts.isSuccess && drafts.data.data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No replies waiting — Ava routes them per your reply mode.
          </p>
        )}
        {drafts.isSuccess && drafts.data.data.length > 0 && (
          <div className="space-y-4">
            {drafts.data.data.map((t) => (
              <ReplyDraftCard key={t.id} task={t} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
