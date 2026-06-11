"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { ResultsTable } from "@/components/leads/results-table";
import { SaveDialog } from "@/components/leads/save-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { useSearchLeads } from "@/lib/hooks/use-leads";

// The receipt: what the NL query became before any data was touched. Mono chips —
// the evidence language applied to search.
function FilterReceipt({ filters }: { filters: Record<string, unknown> }) {
  const entries = Object.entries(filters).filter(
    ([k, v]) =>
      k !== "limit" && v != null && (Array.isArray(v) ? v.length > 0 : String(v).length > 0),
  );
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        Parsed as
      </span>
      {entries.map(([k, v]) => (
        <span
          key={k}
          className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-foreground"
        >
          {k}: {Array.isArray(v) ? v.join(", ") : String(v)}
        </span>
      ))}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-2">
      <p className="font-mono text-xs text-muted-foreground">
        translating your query into filters…
      </p>
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-9 w-full rounded" />
      ))}
    </div>
  );
}

export function SearchSection() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const search = useSearchLeads();

  const results = search.data?.results ?? [];
  const selectedMatches = results.filter((r) => selected.has(r.externalId));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || search.isPending) return;
    setSelected(new Set());
    search.mutate(query.trim());
  }

  function toggle(externalId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(externalId)) next.delete(externalId);
      else next.add(externalId);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === results.length ? new Set() : new Set(results.map((r) => r.externalId)),
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Find leads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            placeholder="Describe who you sell to — try “VPs of engineering”"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={search.isPending}
          />
          <Button type="submit" disabled={search.isPending || !query.trim()}>
            <Search className="size-4" />
            {search.isPending ? "Searching…" : "Search"}
          </Button>
        </form>

        {search.isPending && <LoadingRows />}

        {search.isError && (
          <p className="font-mono text-xs text-destructive">
            {search.error instanceof ApiError && search.error.status === 422
              ? "Couldn’t parse that query — try rephrasing it."
              : "Search failed — check that the backend is running and try again."}
          </p>
        )}

        {search.isSuccess && (
          <>
            <FilterReceipt filters={search.data.filters} />
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No matches — try broadening the search.
              </p>
            ) : (
              <ResultsTable
                results={results}
                selected={selected}
                onToggle={toggle}
                onToggleAll={toggleAll}
                onSave={() => setDialogOpen(true)}
              />
            )}
          </>
        )}

        {search.isIdle && (
          <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border">
            <p className="text-sm text-muted-foreground">
              Describe who you sell to in plain language — Velora turns it into validated
              filters before touching any data.
            </p>
          </div>
        )}

        <SaveDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          matches={selectedMatches}
          onSaved={() => setSelected(new Set())}
        />
      </CardContent>
    </Card>
  );
}