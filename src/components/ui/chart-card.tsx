import { cn } from "@/lib/utils";

// D0 — a presentational frame that promotes a chart to a first-class card: a mono EYEBROW title (the
// evidence voice), an optional right-aligned slot (legend chips / Export), and the chart as children.
// PURELY presentational — it renders whatever chart/series it's given and never computes or fetches
// data. The consuming screen keeps its own honest-empty routing: when a series is empty it should
// render its NotYet/empty state, not an empty axis inside this frame.
export function ChartCard({
  title,
  action,
  className,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-md border border-border bg-card p-5 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{title}</p>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}
