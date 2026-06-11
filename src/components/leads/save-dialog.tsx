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
import { useSaveToList } from "@/lib/hooks/use-leads";
import type { PersonMatch } from "@/lib/api-types";

export function SaveDialog({
  open,
  onOpenChange,
  matches,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matches: PersonMatch[];
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const save = useSaveToList();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    save.mutate(
      { name: name.trim(), matches },
      {
        onSuccess: () => {
          setName("");
          onOpenChange(false);
          onSaved();
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Save to a new list</DialogTitle>
          <DialogDescription>
            <span className="font-mono text-xs">{matches.length}</span> selected lead
            {matches.length === 1 ? "" : "s"} will be saved.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            autoFocus
            placeholder="List name — e.g. SF CTOs"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <DialogFooter>
            <Button type="submit" disabled={save.isPending || !name.trim()}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}