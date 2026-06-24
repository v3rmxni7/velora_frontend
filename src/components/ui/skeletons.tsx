import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// D0 — layout-shaped skeletons (compose the base animate-pulse Skeleton) that mirror the geometry of
// the real primitives, so a load reads as "this content is arriving" rather than a generic gray block.
// PURELY presentational: these only render while a query is genuinely pending. The consuming screen
// must still swap to its honest-empty (dashed NotYet / "nothing yet") state when data resolves to
// empty — a skeleton must NEVER linger as a stand-in for empty (that would imply data exists).

/** Mirrors an analytics Stat card: eyebrow line + big number block, in the standard card frame. */
export function StatSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-md border border-border bg-card p-5 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]", className)}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-16" />
    </div>
  );
}

/** A grid of StatSkeletons (the analytics/deliverability stat rows). */
export function StatGridSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder list
        <StatSkeleton key={i} />
      ))}
    </div>
  );
}

/** Mirrors a data table/list: a header strip + N muted rows, in the standard card frame. */
export function TableSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]", className)}>
      <div className="border-b border-border bg-muted/30 px-4 py-2.5">
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder list
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mirrors a chart block at roughly its aspect, inside the standard card frame. */
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-md border border-border bg-card p-5 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]", className)}>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-4 h-48 w-full" />
    </div>
  );
}
