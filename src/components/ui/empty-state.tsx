import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared illustrated zero-state: a consistent icon + heading + subcopy (+ optional action) block.
// PRESENTATION ONLY — it standardizes how an honest-empty message is shown; it never changes what the
// message SAYS (callers pass the existing honest copy verbatim) and never makes an empty state look
// populated. The analytics honest-empty logic (NotYet / RateOrEmpty / denominator>0) is separate and
// must not be routed through this.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-card/40 px-6 py-10 text-center",
        className,
      )}
    >
      {Icon && (
        <span
          className="flex size-10 items-center justify-center rounded-full bg-secondary/60 text-muted-foreground"
          aria-hidden
        >
          <Icon className="size-5" />
        </span>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
