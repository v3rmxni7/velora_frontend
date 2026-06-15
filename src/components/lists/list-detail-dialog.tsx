"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { EntityType, ListRow } from "@/lib/api-types";
import { useDeleteList, useListMembers, useUpdateList } from "@/lib/hooks/use-lists";

const TYPE_LABEL: Record<EntityType, string> = {
  person: "person",
  company: "company",
  local_business: "local business",
};

export function ListDetailDialog({
  list,
  open,
  onOpenChange,
}: {
  list: ListRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const members = useListMembers(open && list ? list.id : null);
  const rename = useUpdateList();
  const del = useDeleteList();
  // Seed/reset the rename field when a different list is opened — adjusted during render (the
  // "you might not need an effect" pattern), not in an effect.
  const [name, setName] = useState("");
  const [seededId, setSeededId] = useState<string | null>(null);
  if (list && list.id !== seededId) {
    setSeededId(list.id);
    setName(list.name);
  }

  if (!list) return null;
  const count = members.data?.data.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{list.name}</DialogTitle>
        </DialogHeader>

        {/* Rename */}
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={rename.isPending} />
          <Button
            size="sm"
            variant="outline"
            disabled={rename.isPending || !name.trim() || name.trim() === list.name}
            onClick={() => rename.mutate({ id: list.id, body: { name: name.trim() } })}
          >
            Rename
          </Button>
        </div>

        {/* Membership */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Members
            </span>
            <span className="font-mono text-sm tabular-nums text-foreground">{count}</span>
          </div>
          {members.isPending && <Skeleton className="mt-2 h-16 w-full rounded-md" />}
          {members.isError && (
            <p className="mt-2 font-mono text-xs text-destructive">Couldn’t load members.</p>
          )}
          {members.isSuccess &&
            (count === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No members yet.</p>
            ) : (
              <ul className="mt-2 max-h-40 space-y-1 overflow-auto">
                {members.data.data.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded border border-border bg-card px-2 py-1"
                  >
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {TYPE_LABEL[m.entity_type]}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      added {new Date(m.added_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            member names & per-lead actions arrive with the list-members hydrate endpoint — browse
            named leads in{" "}
            <Link href="/leads" className="text-primary hover:underline">
              Leads
            </Link>
            .
          </p>
        </div>

        <DialogFooter showCloseButton>
          <Button
            variant="outline"
            disabled={del.isPending}
            onClick={() => del.mutate(list.id, { onSuccess: () => onOpenChange(false) })}
            className="text-destructive"
          >
            {del.isPending ? "Deleting…" : "Delete list"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
