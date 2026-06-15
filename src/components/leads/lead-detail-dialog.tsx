"use client";

import { Fragment } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { EntityType } from "@/lib/api-types";
import { useLeadDetail } from "@/lib/hooks/use-leads";
import { cn } from "@/lib/utils";

type FieldDef = { label: string; key: string; mono?: boolean };

// The real columns per entity (mirrors the leads migration). Mono on the evidence-layer values.
const FIELDS: Record<EntityType, FieldDef[]> = {
  person: [
    { label: "Title", key: "title" },
    { label: "Company", key: "company_name" },
    { label: "Email", key: "email", mono: true },
    { label: "Seniority", key: "seniority" },
    { label: "Department", key: "department" },
    { label: "Location", key: "location" },
    { label: "Country", key: "country" },
    { label: "LinkedIn", key: "linkedin_url", mono: true },
    { label: "Source", key: "source", mono: true },
  ],
  company: [
    { label: "Domain", key: "domain", mono: true },
    { label: "Industry", key: "industry" },
    { label: "Size", key: "size_band", mono: true },
    { label: "Employees", key: "employee_count", mono: true },
    { label: "Location", key: "location" },
    { label: "Country", key: "country" },
    { label: "LinkedIn", key: "linkedin_url", mono: true },
    { label: "Source", key: "source", mono: true },
  ],
  local_business: [
    { label: "Category", key: "category" },
    { label: "Phone", key: "phone", mono: true },
    { label: "Address", key: "address" },
    { label: "City", key: "city" },
    { label: "Country", key: "country" },
    { label: "Website", key: "website", mono: true },
    { label: "Rating", key: "rating", mono: true },
    { label: "Source", key: "source", mono: true },
  ],
};

export function LeadDetailDialog({
  entityType,
  id,
  open,
  onOpenChange,
}: {
  entityType: EntityType;
  id: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const detail = useLeadDetail(entityType, open ? id : null);
  const row = detail.data?.data as unknown as Record<string, unknown> | undefined;
  const title = row ? String(row.full_name ?? row.name ?? "Lead") : "Lead";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {detail.isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full rounded" />
            <Skeleton className="h-5 w-2/3 rounded" />
          </div>
        ) : detail.isError ? (
          <p className="font-mono text-xs text-destructive">Couldn’t load this lead.</p>
        ) : (
          <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 text-sm">
            {FIELDS[entityType].map((f) => {
              const v = row?.[f.key];
              const display = v === null || v === undefined || v === "" ? "—" : String(v);
              return (
                <Fragment key={f.key}>
                  <dt className="self-center font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    {f.label}
                  </dt>
                  <dd className={cn("break-words text-foreground", f.mono && "font-mono text-xs")}>
                    {display}
                  </dd>
                </Fragment>
              );
            })}
          </dl>
        )}
      </DialogContent>
    </Dialog>
  );
}
