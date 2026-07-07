"use client";

import { Inbox, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useInbox } from "@/lib/hooks/use-inbox";
import type { ThreadStatus } from "@/lib/api-types";
import { cn } from "@/lib/utils";
import { ThreadDetail } from "./thread-detail";
import { formatWhen, ThreadStatusChip } from "./inbox-ui";

const FILTERS: { key: string; label: string; status?: ThreadStatus }[] = [
  { key: "needs_action", label: "Needs action", status: "needs_action" },
  { key: "handled", label: "Handled", status: "handled" },
  { key: "all", label: "All" },
];

export function InboxView() {
  const params = useSearchParams();
  const selected = params.get("thread");
  const filterKey = params.get("status") ?? "needs_action";
  const filter = FILTERS.find((f) => f.key === filterKey) ?? FILTERS[0];
  const inbox = useInbox(filter.status);

  const href = (status: string, thread?: string | null) =>
    `/inbox?status=${status}${thread ? `&thread=${thread}` : ""}`;

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      {/* Left — thread list */}
      <div className="flex w-80 shrink-0 flex-col">
        <div className="mb-3 inline-flex flex-wrap gap-0.5 self-start rounded-lg border border-border bg-secondary/40 p-0.5">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={href(f.key, selected)}
              className={cn(
                "rounded-md px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
                f.key === filter.key
                  ? "bg-card text-primary shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-card">
          {inbox.isPending && (
            <div className="space-y-2 p-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded" />
              ))}
            </div>
          )}
          {inbox.isError && (
            <p className="p-4 font-mono text-xs text-destructive">
              Couldn’t load the inbox — check that the backend is running.
            </p>
          )}
          {inbox.isSuccess && inbox.data.data.length === 0 && (
            <EmptyState
              icon={Inbox}
              title="Nothing here yet."
              description={
                <span className="font-mono text-[11px]">
                  replies &amp; bounces appear here once sending is live
                </span>
              }
              className="h-full border-0 bg-transparent"
            />
          )}
          {inbox.isSuccess &&
            inbox.data.data.map((t) => {
              const active = t.id === selected;
              return (
                <Link
                  key={t.id}
                  href={href(filter.key, t.id)}
                  className={cn(
                    "relative block border-b border-border/60 py-2.5 pr-3 pl-4 transition-colors last:border-b-0",
                    active ? "bg-accent/60" : "hover:bg-secondary/60",
                  )}
                >
                  {t.status === "needs_action" && (
                    <span className="absolute inset-y-0 left-0 w-[3px] bg-primary" aria-hidden />
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {t.subject ?? "(no subject)"}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {formatWhen(t.last_message_at)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <ThreadStatusChip status={t.status} />
                  </div>
                </Link>
              );
            })}
        </div>
      </div>

      {/* Right — conversation */}
      <div className="min-w-0 flex-1 overflow-auto rounded-md border border-border bg-card">
        {selected ? (
          <ThreadDetail id={selected} />
        ) : (
          <EmptyState
            icon={MessagesSquare}
            title="Select a conversation."
            description="Pick a thread on the left to read and reply."
            className="h-full border-0 bg-transparent"
          />
        )}
      </div>
    </div>
  );
}