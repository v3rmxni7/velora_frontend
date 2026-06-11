"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PersonMatch } from "@/lib/api-types";

// Review surface, not a data dump: name/title/company in sans, the filter-matched enums
// (seniority·dept) in mono — the evidence layer. Selection drives the save action bar.
export function ResultsTable({
  results,
  selected,
  onToggle,
  onToggleAll,
  onSave,
}: {
  results: PersonMatch[];
  selected: Set<string>;
  onToggle: (externalId: string) => void;
  onToggleAll: () => void;
  onSave: () => void;
}) {
  const allSelected = results.length > 0 && selected.size === results.length;

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-md border border-border bg-secondary px-3 py-2">
          <span className="font-mono text-xs text-muted-foreground">
            {selected.size} selected
          </span>
          <Button size="sm" onClick={onSave}>
            Save to list
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <input
                type="checkbox"
                aria-label="Select all results"
                className="size-4 accent-primary"
                checked={allSelected}
                onChange={onToggleAll}
              />
            </TableHead>
            <TableHead className="font-mono text-[11px] uppercase tracking-[0.12em]">
              Name
            </TableHead>
            <TableHead className="font-mono text-[11px] uppercase tracking-[0.12em]">
              Title
            </TableHead>
            <TableHead className="font-mono text-[11px] uppercase tracking-[0.12em]">
              Company
            </TableHead>
            <TableHead className="font-mono text-[11px] uppercase tracking-[0.12em]">
              Match
            </TableHead>
            <TableHead className="font-mono text-[11px] uppercase tracking-[0.12em]">
              Location
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((r) => (
            <TableRow
              key={r.externalId}
              data-state={selected.has(r.externalId) ? "selected" : undefined}
              className="cursor-pointer"
              onClick={() => onToggle(r.externalId)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  aria-label={`Select ${r.fullName}`}
                  className="size-4 accent-primary"
                  checked={selected.has(r.externalId)}
                  onChange={() => onToggle(r.externalId)}
                />
              </TableCell>
              <TableCell className="font-medium text-foreground">{r.fullName}</TableCell>
              <TableCell className="text-muted-foreground">{r.title}</TableCell>
              <TableCell className="text-muted-foreground">{r.companyName ?? "—"}</TableCell>
              <TableCell>
                <span className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                  {r.seniority}·{r.department}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{r.location ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}