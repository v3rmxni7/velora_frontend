import type { MessageStatus, ThreadStatus } from "@/lib/api-types";
import { cn } from "@/lib/utils";

// Shared evidence-layer chips for the inbox. Mono, restrained tone — color carries meaning, not decoration.

const CHIP = "rounded border px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap";
const MUTED = "border-border bg-card text-muted-foreground";

/** Compact absolute timestamp (the inbox is an audit log, not a feed — exact beats "2h ago"). */
export function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const THREAD_TONE: Record<ThreadStatus, string> = {
  needs_action: "border-primary/30 bg-accent text-accent-foreground",
  handled: MUTED,
  auto_handled: MUTED,
  active: MUTED,
};
export function ThreadStatusChip({ status }: { status: ThreadStatus }) {
  return <span className={cn(CHIP, THREAD_TONE[status])}>{status.replace(/_/g, " ")}</span>;
}

const CATEGORY_TONE: Record<string, string> = {
  interested: "border-emerald-200 bg-emerald-50 text-emerald-700",
  objection: "border-amber-200 bg-amber-50 text-amber-700",
  unsubscribe: "border-red-200 bg-red-50 text-red-700",
  not_interested: MUTED,
  out_of_office: MUTED,
  other: MUTED,
};
export function CategoryChip({ category }: { category: string }) {
  return <span className={cn(CHIP, CATEGORY_TONE[category] ?? MUTED)}>{category.replace(/_/g, " ")}</span>;
}

const MESSAGE_TONE: Record<string, string> = {
  replied: "border-emerald-200 bg-emerald-50 text-emerald-700",
  bounced: "border-red-200 bg-red-50 text-red-700",
  complained: "border-red-200 bg-red-50 text-red-700",
  failed: "border-red-200 bg-red-50 text-red-700",
};
export function MessageStatusChip({ status }: { status: MessageStatus }) {
  return <span className={cn(CHIP, MESSAGE_TONE[status] ?? MUTED)}>{status}</span>;
}