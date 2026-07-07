"use client";

import { Loader2, Sparkles, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLeads } from "@/lib/hooks/use-leads";
import { useGenerateDraft, useTasks } from "@/lib/hooks/use-tasks";

// Honest narration of the real pipeline order while the sync route runs (~10s).
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

// The org's saved people (RLS-scoped) — the generate-draft launch surface.
export function SavedLeads() {
  const leads = useLeads();
  const tasks = useTasks();
  const generate = useGenerateDraft();

  // Leads that already have a draft show "View draft →" — regeneration would re-run
  // the (paid) pipeline, so the UI doesn't offer it.
  const taskByLead = new Map(
    (tasks.data?.data ?? []).filter((t) => t.lead_id).map((t) => [t.lead_id as string, t]),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Saved leads</CardTitle>
      </CardHeader>
      <CardContent>
        {leads.isPending && (
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded" />
            ))}
          </div>
        )}
        {leads.isError && (
          <p className="font-mono text-xs text-destructive">
            Couldn’t load saved leads — check that the backend is running.
          </p>
        )}
        {leads.isSuccess &&
          (leads.data.data.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="Nothing saved yet"
              description="Search above and save your first leads."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                    Saved
                  </TableHead>
                  <TableHead className="font-mono text-[11px] uppercase tracking-[0.12em]">
                    Draft
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.data.data.map((p) => {
                  const existing = taskByLead.get(p.id);
                  const generatingThis = generate.isPending && generate.variables === p.id;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-foreground">
                        {p.full_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.title ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.company_name ?? "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {/* Fixed-height line box so link rows and button rows render identical row
                            heights (the mixed treatments made the table rhythm ragged). */}
                        <div className="flex h-8 items-center">
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
                              onClick={() => generate.mutate(p.id)}
                              // Single-flight: one generation at a time — each click runs a
                              // real (paid) LLM pipeline.
                              disabled={generate.isPending}
                            >
                              <Sparkles className="size-3.5" />
                              Generate draft
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ))}
      </CardContent>
    </Card>
  );
}