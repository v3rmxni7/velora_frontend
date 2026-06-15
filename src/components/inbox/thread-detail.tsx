"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useThread } from "@/lib/hooks/use-inbox";
import type { MessageRow } from "@/lib/api-types";
import { cn } from "@/lib/utils";
import { CategoryChip, formatWhen, MessageStatusChip, ThreadStatusChip } from "./inbox-ui";

function MessageBubble({ m }: { m: MessageRow }) {
  const inbound = m.direction === "inbound";
  return (
    <div
      className={cn(
        "rounded-md border p-3",
        inbound ? "border-primary/20 bg-accent/40" : "border-border bg-secondary/40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          {inbound ? "inbound · reply" : "outbound"}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {inbound && m.category && <CategoryChip category={m.category} />}
          <MessageStatusChip status={m.status} />
          <span className="font-mono text-[10px] text-muted-foreground">
            {formatWhen(m.sent_at ?? m.created_at)}
          </span>
        </div>
      </div>
      {m.subject && <p className="mt-2 text-sm font-medium text-foreground">{m.subject}</p>}
      {m.body && <p className="mt-1 whitespace-pre-line text-sm text-foreground">{m.body}</p>}
    </div>
  );
}

export function ThreadDetail({ id }: { id: string }) {
  const thread = useThread(id);

  if (thread.isPending) {
    return (
      <div className="space-y-3 p-5">
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    );
  }
  if (thread.isError) {
    return (
      <p className="p-5 font-mono text-xs text-destructive">Couldn’t load this conversation.</p>
    );
  }

  const t = thread.data.data;
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <h2 className="truncate font-heading text-base font-semibold text-foreground">
          {t.subject ?? "(no subject)"}
        </h2>
        <ThreadStatusChip status={t.status} />
      </div>
      <div className="flex-1 space-y-3 overflow-auto p-4">
        {t.messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages in this thread yet.</p>
        ) : (
          t.messages.map((m) => <MessageBubble key={m.id} m={m} />)
        )}
      </div>
      <div className="border-t border-border p-4">
        <p className="font-mono text-[11px] text-muted-foreground">
          replying from Velora arrives in a later phase
        </p>
      </div>
    </div>
  );
}