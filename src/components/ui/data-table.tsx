"use client";

import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// D0 — a PURELY PRESENTATIONAL table primitive. It renders rows + columns it is given; it never
// fetches, mutates, or invents data. Velora styling: mono header on bg-muted/30, branded
// hover:bg-accent/50 rows, 6px card frame + the standard contact shadow, mono/tabular-nums for
// evidence columns. Status cells reuse the screen's own tone maps via the column `render` slot — this
// component introduces no status colors of its own.
//
// Honesty rails baked in:
//  • Sorting is OPT-IN per column and runs CLIENT-SIDE over the already-fetched `rows` only (it can
//    never reorder server truth or imply rows the API didn't return). Adopt without enabling sort to
//    keep a swap strictly visual.
//  • `emptyMessage` renders a true dashed honest-empty when there are no rows — never a skeleton that
//    implies rows are coming. Pass `loading` (e.g. <TableSkeleton/>) for the genuine pending state.

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  /** Custom cell renderer (e.g. emit a status pill using the screen's tone map). Defaults to row[key]. */
  render?: (row: T) => React.ReactNode;
  align?: "left" | "right";
  /** Render the cell in the mono evidence voice (IDs, counts, dates). */
  mono?: boolean;
  /** Enable client-side sort on this column. Provide `sortValue` for non-string/number cells. */
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  headerClassName?: string;
  cellClassName?: string;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "Nothing here yet.",
  loading,
  onRowClick,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: React.ReactNode;
  loading?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortable) return rows;
    const val = col.sortValue ?? ((r: T) => (r as Record<string, unknown>)[sort.key] as string | number);
    // Sort a COPY of the already-fetched rows — never re-query, never drop rows.
    return [...rows].sort((a, b) => {
      const av = val(a);
      const bv = val(b);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, columns]);

  if (loading) return <>{loading}</>;

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  return (
    <div className={cn("overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]", className)}>
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/30">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground",
                  c.align === "right" ? "text-right" : "text-left",
                  c.headerClassName,
                )}
              >
                {c.sortable ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key)}
                    className={cn(
                      "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                      c.align === "right" && "flex-row-reverse",
                    )}
                  >
                    {c.header}
                    {sort?.key === c.key ? (
                      sort.dir === "asc" ? (
                        <ChevronUp className="size-3 text-primary" aria-hidden />
                      ) : (
                        <ChevronDown className="size-3 text-primary" aria-hidden />
                      )
                    ) : (
                      <ChevronsUpDown className="size-3 text-muted-foreground/40" aria-hidden />
                    )}
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedRows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn("transition-colors", onRowClick && "cursor-pointer hover:bg-accent/50")}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-4 py-3 text-foreground",
                    c.align === "right" ? "text-right" : "text-left",
                    c.mono && "font-mono tabular-nums text-[13px]",
                    c.cellClassName,
                  )}
                >
                  {c.render ? c.render(row) : ((row as Record<string, unknown>)[c.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
