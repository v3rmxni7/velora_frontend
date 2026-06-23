"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProofCategory } from "@/lib/api-types";
import {
  useCreateProofItem,
  useDeleteProofItem,
  useProofItems,
  useUpdateProofItem,
} from "@/lib/hooks/use-knowledge";
import { cn } from "@/lib/utils";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const CATS: { key: ProofCategory; label: string }[] = [
  { key: "highlight", label: "Highlights" },
  { key: "customer", label: "Customers" },
  { key: "case_study", label: "Case studies" },
];

export function ProofSection() {
  const [cat, setCat] = useState<ProofCategory>("highlight");
  const items = useProofItems(cat);
  const create = useCreateProofItem();
  const update = useUpdateProofItem();
  const del = useDeleteProofItem();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", body: "", url: "" });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    create.mutate(
      { category: cat, title: t, body: body.trim() || undefined, url: url.trim() || undefined },
      {
        onSuccess: () => {
          setTitle("");
          setBody("");
          setUrl("");
        },
      },
    );
  };
  const saveEdit = () => {
    if (!editingId) return;
    const t = draft.title.trim();
    if (!t) return;
    update.mutate(
      { id: editingId, body: { title: t, body: draft.body.trim() || null, url: draft.url.trim() || null } },
      { onSuccess: () => setEditingId(null) },
    );
  };

  return (
    <section>
      <h3 className={`${EYEBROW} mb-1`}>Shared proof &amp; results</h3>
      <p className="mb-3 text-sm text-muted-foreground">
        The verified proof points the grounded-draft pipeline can cite.
      </p>

      <div className="mb-3 flex gap-1">
        {CATS.map((c) => (
          <button
            type="button"
            key={c.key}
            onClick={() => setCat(c.key)}
            className={cn(
              "rounded-md px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
              c.key === cat
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <form onSubmit={add} className="mb-3 space-y-2 rounded-md border border-border bg-card p-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (required)" disabled={create.isPending} />
        <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Detail (optional)" disabled={create.isPending} />
        <div className="flex gap-2">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https:// (optional)" disabled={create.isPending} />
          <Button type="submit" size="sm" disabled={create.isPending || !title.trim()}>
            Add
          </Button>
        </div>
      </form>

      {items.isPending && <Skeleton className="h-12 w-full rounded-md" />}
      {items.isError && <p className="font-mono text-xs text-destructive">Couldn’t load proof.</p>}
      {items.isSuccess && items.data.data.length === 0 && (
        <p className="text-sm text-muted-foreground">No {CATS.find((c) => c.key === cat)?.label.toLowerCase()} yet.</p>
      )}
      {items.isSuccess && items.data.data.length > 0 && (
        <ul className="space-y-2">
          {items.data.data.map((p) =>
            editingId === p.id ? (
              <li key={p.id} className="space-y-2 rounded-md border border-border bg-card p-2">
                <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} autoFocus />
                <Input value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="Detail" />
                <div className="flex gap-2">
                  <Input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="URL" />
                  <Button size="sm" onClick={saveEdit} disabled={update.isPending}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              </li>
            ) : (
              <li key={p.id} className="flex items-start justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{p.title}</p>
                  {p.body && <p className="text-sm text-muted-foreground">{p.body}</p>}
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate font-mono text-[11px] text-primary hover:underline"
                    >
                      {p.url}
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Edit"
                    onClick={() => {
                      setEditingId(p.id);
                      setDraft({ title: p.title, body: p.body ?? "", url: p.url ?? "" });
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
