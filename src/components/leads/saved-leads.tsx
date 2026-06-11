"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// The org's saved people (RLS-scoped) — also B3's generate-draft launch surface.
export function SavedLeads() {
  const leads = useLeads();

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
            <p className="text-sm text-muted-foreground">
              Nothing saved yet — search above and save your first leads.
            </p>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.data.data.map((p) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ))}
      </CardContent>
    </Card>
  );
}