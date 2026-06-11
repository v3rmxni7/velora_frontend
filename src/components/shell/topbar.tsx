// Topbar: page-title slot + account chip. The chip goes live (real email + sign-out) in B1.
export function Topbar({ title }: { title?: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="font-heading text-base font-semibold text-foreground">{title ?? ""}</h1>
      <div className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs text-muted-foreground">
        demo
      </div>
    </header>
  );
}