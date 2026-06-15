import type { CampaignStatus, EnrollmentStatus } from "@/lib/api-types";
import { cn } from "@/lib/utils";

const CHIP = "rounded border px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap";
const MUTED = "border-border bg-card text-muted-foreground";

const STATUS_TONE: Record<CampaignStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  paused: "border-amber-200 bg-amber-50 text-amber-700",
  draft: MUTED,
  completed: MUTED,
  archived: MUTED,
};
export function CampaignStatusChip({ status }: { status: CampaignStatus }) {
  return <span className={cn(CHIP, STATUS_TONE[status])}>{status}</span>;
}

// The order we present enrollment states in — the lifecycle left→right.
export const ENROLLMENT_ORDER: EnrollmentStatus[] = [
  "pending",
  "awaiting_approval",
  "queued",
  "sent",
  "replied",
  "bounced",
  "unsubscribed",
  "failed",
  "completed",
];

const ENROLL_TONE: Partial<Record<EnrollmentStatus, string>> = {
  replied: "border-emerald-200 bg-emerald-50 text-emerald-700",
  bounced: "border-red-200 bg-red-50 text-red-700",
  unsubscribed: "border-red-200 bg-red-50 text-red-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  awaiting_approval: "border-primary/30 bg-accent text-accent-foreground",
};
export function EnrollmentCount({ status, n }: { status: EnrollmentStatus; n: number }) {
  return (
    <span className={cn(CHIP, ENROLL_TONE[status] ?? MUTED, "tabular-nums")}>
      {status.replace(/_/g, " ")} {n}
    </span>
  );
}