"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { EntityType, ListRow } from "@/lib/api-types";
import { useLists } from "@/lib/hooks/use-lists";
import { ListDetailDialog } from "./list-detail-dialog";
import { NewListDialog } from "./new-list-dialog";

const TYPE_LABEL: Record<EntityType, string> = {
  person: "people",
  company: "companies",
  local_business: "local business",
};

export function ListsView() {
  const lists = useLists();
  const [newOpen, setNewOpen] = useState(false);
  const [selected, setSelected] = useState<ListRow | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Lists
        </h2>
        <Button size="sm" onClick={() => setNewOpen(true)}>
          <Plus className="size-4" />
          New list
        </Button>
      </div>

      {lists.isPending && <Skeleton className="h-24 w-full rounded-md" />}
      {lists.isError && (
        <p className="font-mono text-xs text-destructive">
          Couldn’t load lists — check that the backend is running.
        </p>
      )}
      {lists.isSuccess && lists.data.data.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">No lists yet.</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            save leads from Find leads, or create a list
          </p>
        </div>
      )}
      {lists.isSuccess && lists.data.data.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {lists.data.data.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => setSelected(l)}
                className="flex w-full flex-col gap-1 rounded-md border border-border bg-card p-4 text-left shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-accent/50 hover:shadow-[0_2px_10px_-4px_rgba(16,24,40,0.1)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-foreground">{l.name}</span>
                  <span className="shrink-0 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {TYPE_LABEL[l.entity_type]}
                  </span>
                </div>
                {l.description && (
                  <p className="truncate text-sm text-muted-foreground">{l.description}</p>
                )}
                <span className="font-mono text-[10px] text-muted-foreground">
                  created {new Date(l.created_at).toLocaleDateString()}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <NewListDialog open={newOpen} onOpenChange={setNewOpen} />
      <ListDetailDialog
        list={selected}
        open={selected !== null}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
        }}
      />
    </div>
  );
}
