"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCoachingPoints,
  useCreateCoachingPoint,
  useDeleteCoachingPoint,
  useUpdateCoachingPoint,
} from "@/lib/hooks/use-knowledge";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";

export function CoachingSection() {
  const points = useCoachingPoints();
  const create = useCreateCoachingPoint();
  const update = useUpdateCoachingPoint();
  const del = useDeleteCoachingPoint();
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const v = draft.trim();
    if (!v) return;
    create.mutate(v, { onSuccess: () => setDraft("") });
  };
  const saveEdit = () => {
    if (!editingId) return;
    const v = editValue.trim();
    if (!v) {
      setEditingId(null);
      return;
    }
    update.mutate({ id: editingId, content: v }, { onSuccess: () => setEditingId(null) });
  };

  return (
    <section>
      <h3 className={`${EYEBROW} mb-1`}>Shared campaign coaching</h3>
      <p className="mb-3 text-sm text-muted-foreground">
        Tone &amp; style guidance the Writer is coached on across campaigns.
      </p>
      <form onSubmit={add} className="mb-3 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. Keep it concise; lead with the prospect’s context."
          disabled={create.isPending}
        />
        <Button type="submit" size="sm" disabled={create.isPending || !draft.trim()}>
          Add
        </Button>
      </form>

      {points.isPending && <Skeleton className="h-12 w-full rounded-md" />}
      {points.isError && <p className="font-mono text-xs text-destructive">Couldn’t load coaching.</p>}
      {points.isSuccess && points.data.data.length === 0 && (
        <p className="text-sm text-muted-foreground">No coaching points yet.</p>
      )}
      {points.isSuccess && points.data.data.length > 0 && (
        <ul className="space-y-2">
          {points.data.data.map((p) =>
            editingId === p.id ? (
              <li key={p.id} className="flex gap-2 rounded-md border border-border bg-card p-2">
                <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                <Button size="sm" onClick={saveEdit} disabled={update.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </li>
            ) : (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2"
              >
                <span className="min-w-0 flex-1 text-sm text-foreground">{p.content}</span>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Edit"
                    onClick={() => {
                      setEditingId(p.id);
                      setEditValue(p.content);
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Delete"
                    onClick={() => del.mutate(p.id)}
                    disabled={del.isPending}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
