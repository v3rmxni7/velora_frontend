"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useCredits } from "@/lib/hooks/use-credits";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";

// Persistent footer credits indicator — the REAL ledger balance, never a fabricated number.
// An ungranted org honestly shows 0 + an empty bar + "credits granted at go-live".
export function CreditsIndicator() {
  const q = useCredits();

  return (
    <div className="border-t border-border px-5 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className={EYEBROW}>Credits</span>
        {q.isPending ? (
          <Skeleton className="h-4 w-10 rounded" />
        ) : q.isError ? (
          <span className="font-mono text-sm text-muted-foreground">—</span>
        ) : (
          <span className="font-mono text-sm tabular-nums text-foreground">
            {q.data.data.balance.toLocaleString()}
          </span>
        )}
      </div>

      {q.isSuccess &&
        (() => {
          const { granted, used } = q.data.data;
          const pct = granted > 0 ? Math.min(100, Math.round((used / granted) * 100)) : 0;
          return (
            <>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} aria-hidden />
              </div>
              <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                {granted > 0
                  ? `${used.toLocaleString()} of ${granted.toLocaleString()} used`
                  : "credits granted at go-live"}
              </p>
            </>
          );
        })()}
    </div>
  );
}
