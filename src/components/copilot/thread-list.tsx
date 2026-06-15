"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCopilotThreads } from "@/lib/hooks/use-copilot";
import { cn } from "@/lib/utils";

export function ThreadList({
  selectedId,
  onSelect,
  onNew,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  const threads = useCopilotThreads();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Button variant="outline" size="sm" onClick={onNew} className="mb-3 w-full justify-start">
        <Plus className="size-3.5" />
        New chat
      </Button>

      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-card">
        {threads.isPending && (
          <div className="space-y-2 p-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-9 w-full rounded" />
            ))}
          </div>
        )}
        {threads.isError && (
          <p className="p-4 font-mono text-xs text-destructive">Couldn’t load your chats.</p>
        )}
        {threads.isSuccess && threads.data.data.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-1 p-6 text-center">
            <p className="text-sm text-muted-foreground">No chats yet.</p>
            <p className="font-mono text-[11px] text-muted-foreground">start one above</p>
          </div>
        )}
        {threads.isSuccess &&
          threads.data.data.map((t) => {
            const active = t.id === selectedId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelect(t.id)}
                className={cn(
                  "relative block w-full border-b border-border/60 py-2.5 pr-3 pl-4 text-left transition-colors last:border-b-0",
                  active ? "bg-accent/60" : "hover:bg-secondary/60",
                )}
              >
                {active && (
                  <span className="absolute inset-y-0 left-0 w-[3px] bg-primary" aria-hidden />
                )}
                <span className="block truncate text-sm text-foreground">
                  {t.title ?? "New chat"}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
}
