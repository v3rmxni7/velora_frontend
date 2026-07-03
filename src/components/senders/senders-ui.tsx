import type { DomainAuthStatus, MailboxReputation, MailboxStatus } from "@/lib/api-types";
import { cn } from "@/lib/utils";

const CHIP = "rounded border px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap";
const MUTED = "border-border bg-card text-muted-foreground";

// Warmth is the gate: only 'warm' may send (Slice 2.8). Color encodes readiness — green = ready.
const WARMTH_TONE: Record<MailboxStatus, string> = {
  warm: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warming: "border-amber-200 bg-amber-50 text-amber-700",
  connected: MUTED,
  pending: MUTED,
  paused: "border-red-200 bg-red-50 text-red-700",
};
export function WarmthChip({ status, count }: { status: MailboxStatus | string; count?: number }) {
  // Tolerant of plain-string statuses (e.g. the deliverability roll-up's Record<string, number>)
  // so 'warm' reads emerald EVERYWHERE, not just on Senders; unknown values fall back to muted.
  const tone = WARMTH_TONE[status as MailboxStatus] ?? MUTED;
  return (
    <span className={cn(CHIP, tone)}>
      {status}
      {count != null ? ` ${count}` : ""}
    </span>
  );
}

export function Reputation({ rep }: { rep: MailboxReputation | null }) {
  if (!rep || rep.sent == null) {
    return <span className="font-mono text-[11px] text-muted-foreground">no warmup stats yet</span>;
  }
  return (
    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
      sent {rep.sent ?? 0} · inbox {rep.inbox ?? 0} · spam {rep.spam ?? 0}
    </span>
  );
}

const AUTH_TONE: Record<DomainAuthStatus, string> = {
  pass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  fail: "border-red-200 bg-red-50 text-red-700",
  unknown: MUTED,
};
export function AuthChip({ label, status }: { label: string; status: DomainAuthStatus }) {
  return (
    <span className={cn(CHIP, AUTH_TONE[status])}>
      {label} {status}
    </span>
  );
}