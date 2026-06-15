"use client";

import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EntityType } from "@/lib/api-types";
import { useLeadsByType } from "@/lib/hooks/use-leads";
import { useGenerateDraft, useTasks } from "@/lib/hooks/use-tasks";
import { cn } from "@/lib/utils";
import { LeadDetailDialog } from "./lead-detail-dialog";

const TABS: { key: EntityType; label: string }[] = [
  { key: "person", label: "People" },
  { key: "company", label: "Companies" },
  { key: "local_business", label: "Local business" },
];

type Col = { header: string; key: string; mono?: boolean };
const COLS: Record<EntityType, Col[]> = {
  person: [
    { header: "Name", key: "full_name" },
    { header: "Title", key: "title" },
    { header: "Company", key: "company_name" },
    { header: "Location", key: "location" },
    { header: "Saved", key: "created_at", mono: true },
  ],
  company: [
    { header: "Name", key: "name" },
    { header: "Industry", key: "industry" },
    { header: "Size", key: "size_band", mono: true },
    { header: "Location", key: "location" },
    { header: "Saved", key: "created_at", mono: true },
  ],
  local_business: [
    { header: "Name", key: "name" },
    { header: "Category", key: "category" },
    { header: "City", key: "city" },
    { header: "Rating", key: "rating", mono: true },
    { header: "Saved", key: "created_at", mono: true },
  ],
};

const STAGES = ["researching facts…", "verifying sources…", "writing draft…"];
function GeneratingLabel() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 3500);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
      <Loader2 className="size-3.5 animate-spin" />
      {STAGES[stage]}
    </span>
  );
}

function cellText(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (key === "created_at") return new Date(String(value)).toLocaleDateString();
  return String(value);
}

function LeadsTable({
  entityType,
  search,
  onOpen,
}: {
  entityType: EntityType;
  search: string;
  onOpen: (id: string) => void;
}) {
  const leads = useLeadsByType(entityType, search);
  const tasks = useTasks();
  const generate = useGenerateDraft();
  const isPerson = entityType === "person";
  const taskByLead = new Map(
    (tasks.data?.data ?? []).filter((t) => t.lead_id).map((t) => [t.lead_id as string, t]),
  );
  const cols = COLS[entityType];

  if (leads.isPending) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded" />
        ))}
      </div>
    );
  }
  if (leads.isError) {
    return (
      <p className="font-mono text-xs text-destructive">
        Couldn’t load leads — check that the backend is running.
      </p>
    );
  }
  const rows = leads.data.data as unknown as Record<string, unknown>[];
  if (rows.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-card text-center">
        <p className="text-sm text-muted-foreground">
          {search ? "No matches." : "Nothing saved yet."}
        </p>
        {!search && (
          <Link href="/lead-discovery" className="text-sm font-medium text-primary hover:underline">
            Find leads to save some →
          </Link>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {cols.map((c) => (
            <TableHead key={c.key} className="font-mono text-[11px] uppercase tracking-[0.12em]">
              {c.header}
            </TableHead>
          ))}
          {isPerson && (
            <TableHead className="font-mono text-[11px] uppercase tracking-[0.12em]">
              Draft
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const id = String(row.id);
          const existing = taskByLead.get(id);
          const generatingThis = generate.isPending && generate.variables === id;
          return (
            <TableRow
              key={id}
              onClick={() => onOpen(id)}
              className="cursor-pointer hover:bg-secondary/50"
            >
              {cols.map((c, i) => (
                <TableCell
                  key={c.key}
                  className={cn(
                    i === 0 ? "font-medium text-foreground" : "text-muted-foreground",
                    c.mono && "font-mono text-xs",
                  )}
                >
                  {cellText(c.key, row[c.key])}
                </TableCell>
              ))}
              {isPerson && (
                // biome-ignore lint/a11y/noStaticElementInteractions: stop row-open when acting on the draft
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {existing ? (
                    <Link
                      href={`/engage?new=${existing.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View draft →
                    </Link>
                  ) : generatingThis ? (
                    <GeneratingLabel />
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generate.mutate(id)}
                      disabled={generate.isPending}
                    >
                      <Sparkles className="size-3.5" />
                      Generate draft
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function LeadsBrowser() {
  const [tab, setTab] = useState<EntityType>("person");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);

  // Debounce the server name-search.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setSearchInput("");
                setSearch("");
              }}
              className={cn(
                "rounded-md px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
                t.key === tab
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="w-64">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name…"
          />
        </div>
      </div>

      <LeadsTable entityType={tab} search={search} onOpen={setDetailId} />

      <LeadDetailDialog
        entityType={tab}
        id={detailId}
        open={detailId !== null}
        onOpenChange={(o) => {
          if (!o) setDetailId(null);
        }}
      />
    </div>
  );
}
