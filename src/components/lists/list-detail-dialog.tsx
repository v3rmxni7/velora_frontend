"use client";

import { Sparkles } from "lucide-react";
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
import type { EntityType, HydratedMember, ListRow } from "@/lib/api-types";
import { useDeleteList, useListMembers, useUpdateList } from "@/lib/hooks/use-lists";
import { useGenerateDraft, useTasks } from "@/lib/hooks/use-tasks";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<EntityType, string> = {
  person: "person",
  company: "company",
  local_business: "local business",
};

function leadPrimary(m: HydratedMember): string {
  if (!m.lead) return "(lead removed)";
  const r = m.lead as unknown as Record<string, unknown>;
  return String((m.entity_type === "person" ? r.full_name : r.name) ?? "—");
}
function leadSecondary(m: HydratedMember): string {
  if (!m.lead) return `${TYPE_LABEL[m.entity_type]} · added ${new Date(m.added_at).toLocaleDateString()}`;
  const r = m.lead as unknown as Record<string, unknown>;
  const parts =
    m.entity_type === "person"
      ? [r.title, r.company_name]
      : m.entity_type === "company"
        ? [r.industry, r.location]
        : [r.category, r.city];
  return parts.filter((x) => x != null && x !== "").map(String).join(" · ") || "—";
}

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
  const tasks = useTasks();
  const generate = useGenerateDraft();

  // Seed/reset the rename field when a different list is opened — adjusted during render (the
  // "you might not need an effect" pattern), not in an effect.
  const [name, setName] = useState("");
  const [seededId, setSeededId] = useState<string | null>(null);
  if (list && list.id !== seededId) {
    setSeededId(list.id);
    setName(list.name);
  }

  if (!list) return null;

  const data = members.data?.data;
  const count = data?.count ?? 0;
  const taskByLead = new Map(
    (tasks.data?.data ?? []).filter((t) => t.lead_id).map((t) => [t.lead_id as string, t]),
  );

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
          {data &&
            (count === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No members yet.</p>
            ) : (
              <ul className="mt-2 max-h-48 space-y-1 overflow-auto">
                {data.members.map((m) => {
                  const orphan = m.lead === null;
                  const existing = taskByLead.get(m.entity_id);
                  const generatingThis = generate.isPending && generate.variables === m.entity_id;
                  const canDraft = list.entity_type === "person" && !orphan;
                  return (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-2 rounded border border-border bg-card px-2.5 py-1.5"
                    >
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "truncate text-sm",
                            orphan ? "italic text-muted-foreground/60" : "font-medium text-foreground",
                          )}
                        >
                          {leadPrimary(m)}
                        </p>
                        <p className="truncate font-mono text-[10px] text-muted-foreground">
                          {leadSecondary(m)}
                        </p>
                      </div>
                      {canDraft && (
                        <div className="shrink-0">
                          {existing ? (
                            <Link
                              href={`/engage?new=${existing.id}`}
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              View draft →
                            </Link>
                          ) : generatingThis ? (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              generating…
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generate.mutate(m.entity_id)}
                              disabled={generate.isPending}
                            >
                              <Sparkles className="size-3.5" />
                              Draft
                            </Button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ))}
          {data && data.members.length < count && (
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              showing first {data.members.length} of {count}
            </p>
          )}
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
