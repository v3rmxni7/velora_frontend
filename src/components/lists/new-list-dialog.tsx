"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { EntityType } from "@/lib/api-types";
import { useCreateList } from "@/lib/hooks/use-lists";

const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";
const TYPES: { value: EntityType; label: string }[] = [
  { value: "person", label: "People" },
  { value: "company", label: "Companies" },
  { value: "local_business", label: "Local business" },
];

export function NewListDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("person");
  const [description, setDescription] = useState("");
  const create = useCreateList();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    create.mutate(
      { name: name.trim(), entityType, description: description.trim() || undefined },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
          setEntityType("person");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New list</DialogTitle>
          <DialogDescription>A saved, segmented group of leads.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input
            autoFocus
            placeholder="List name — e.g. SF CTOs"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={create.isPending}
          />
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as EntityType)}
            disabled={create.isPending}
            className={SELECT_CLASS}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={create.isPending}
          />
          <DialogFooter>
            <Button type="submit" disabled={create.isPending || !name.trim()}>
              {create.isPending ? "Creating…" : "Create list"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
