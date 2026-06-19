"use client";

import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CopilotActionClass } from "@/lib/api-types";
import { useCancelAction, useConfirmAction, useThreadActions } from "@/lib/hooks/use-copilot";
import { cn } from "@/lib/utils";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em]";

// Deterministic, honest "what will happen" note per action kind (NOT LLM text). Notably, a launch
// stays in dry-run — we never imply a real send.
const KIND_NOTE: Record<string, string> = {
  launch_campaign: "Sends stay in dry-run until the deliberate go-live flip — nothing reaches a real inbox.",
  pause_campaign: "Stops this campaign’s sends. Reversible.",
  pause_autonomy: "Turns off all autonomous sending and replies. Reversible.",
  subscribe_signal: "Leads enroll as the signal fires (dry-run until go-live).",
  create_list: "Creates an empty list you can fill later.",
};

// The in-chat confirm/cancel card for a PROPOSED agentic action. The display comes from the assistant
// turn's proposal; the live status + the action id come from the thread's action rows (so reopening a
// thread shows the real confirmed/cancelled/failed state). Nothing executes until Confirm is clicked.
export function ActionCard({
  threadId,
  messageId,
  proposed,
}: {
  threadId: string;
  messageId: string;
  proposed: { kind: string; actionClass: CopilotActionClass; title: string };
}) {
  const actions = useThreadActions(threadId);
  const confirm = useConfirmAction(threadId);
  const cancel = useCancelAction(threadId);

  // Match on message_id — guard against null (a message_id is set null if its message is deleted, so
  // an orphaned action must never be picked up by a card).
  const action = actions.data?.data.find((a) => a.message_id && a.message_id === messageId);
  const status = action?.status ?? "proposed";
  const destructive = proposed.actionClass === "destructive";
  const busy = confirm.isPending || cancel.isPending;

  return (
    <div
      className={cn(
        "mt-2 rounded-md border bg-secondary/40 p-3",
        destructive ? "border-destructive/40" : "border-border",
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn(EYEBROW, destructive ? "text-destructive" : "text-primary")}>
          action — confirm
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          {proposed.actionClass}
        </span>
      </div>
      <p className="mt-1 text-sm font-medium text-foreground">{proposed.title}</p>
      <p className="mt-0.5 text-[12px] text-muted-foreground">
        {KIND_NOTE[proposed.kind] ?? "Review and confirm before anything happens."}
      </p>

      {status === "proposed" ? (
        <div className="mt-2.5 flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={destructive ? "destructive" : "default"}
            disabled={busy || !action}
            onClick={() => action && confirm.mutate(action.id)}
          >
            {confirm.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            Confirm
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || !action}
            onClick={() => action && cancel.mutate(action.id)}
          >
            <X className="size-3.5" />
            Cancel
          </Button>
          {!action && (actions.isPending || actions.isFetching) && (
            <span className="font-mono text-[11px] text-muted-foreground">loading…</span>
          )}
        </div>
      ) : (
        <p
          className={cn(
            "mt-2 line-clamp-2 font-mono text-[11px] uppercase tracking-[0.1em]",
            status === "confirmed"
              ? "text-emerald-700 dark:text-emerald-400"
              : status === "failed"
                ? "text-destructive"
                : "text-muted-foreground",
          )}
        >
          {status === "confirmed"
            ? "✓ confirmed"
            : status === "cancelled"
              ? "cancelled"
              : "couldn’t complete"}
          {action?.error ? ` — ${action.error}` : ""}
        </p>
      )}
    </div>
  );
}
