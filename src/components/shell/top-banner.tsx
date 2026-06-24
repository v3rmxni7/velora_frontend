// Persistent top strip. Deliberately NOT a "trial ends in N days" countdown — there is no billing
// model yet, so a countdown would be fabricated. This is the honest early-access frame; the dated
// trial/upgrade banner lands with the billing slice. On-brand (indigo accent), not Artisan's magenta.
export function TopBanner() {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between gap-3 border-b border-border bg-accent/60 px-5 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
      <p className="truncate text-xs text-foreground">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-primary">
          Beta
        </span>
        <span className="ml-2 text-muted-foreground">
          grounded autonomous outreach — early access
        </span>
      </p>
      <span className="shrink-0 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
        Plans · soon
      </span>
    </div>
  );
}
