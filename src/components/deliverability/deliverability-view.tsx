"use client";

import Link from "next/link";
import { GoLiveCard } from "@/components/deliverability/go-live-card";
import { CountUp } from "@/components/motion";
import { WarmthChip } from "@/components/senders/senders-ui";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeliverability } from "@/lib/hooks/use-deliverability";
import { cn } from "@/lib/utils";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";
const CHIP =
  "rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground";

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-md border border-border bg-card p-5 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]", className)}>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <div className={EYEBROW}>{label}</div>
      <div className="mt-2 font-mono text-2xl tabular-nums text-foreground"><CountUp value={value} /></div>
    </Card>
  );
}

export function DeliverabilityView() {
  const q = useDeliverability();

  if (q.isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-28 w-full rounded-md" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Skeleton className="h-20 rounded-md" />
          <Skeleton className="h-20 rounded-md" />
          <Skeleton className="h-20 rounded-md" />
        </div>
      </div>
    );
  }
  if (q.isError) {
    return (
      <p className="font-mono text-xs text-destructive">
        Couldn’t load deliverability — check that the backend is running.
      </p>
    );
  }

  const d = q.data.data;
  const pct =
    d.sends.dailyCap > 0 ? Math.min(100, Math.round((d.sends.today / d.sends.dailyCap) * 100)) : 0;
  const suppressionReasons = Object.entries(d.suppression.byReason);
  const warmth = Object.entries(d.mailboxes.byStatus);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Productized go-live (S1) — readiness checklist + owner typed-confirm flip / pause. */}
      <GoLiveCard />

      {/* Hero — sends today vs the per-org governor cap */}
      <Card className="relative overflow-hidden pl-6">
        <span className="absolute inset-y-0 left-0 w-[3px] bg-primary" aria-hidden />
        <div className={EYEBROW}>Sends today</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-3xl tabular-nums text-foreground"><CountUp value={d.sends.today} /></span>
          <span className="font-mono text-sm text-muted-foreground">
            / {d.sends.dailyCap} daily cap
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary" style={{ width: `${pct}%` }} aria-hidden />
        </div>
        <p className={`${FOOTNOTE} mt-2`}>
          {d.sends.remaining} remaining today · per-org volume governor
        </p>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Credits" value={d.credits.balance} />
        <Stat label="Bounces" value={d.bounces.total} />
        <Stat label="Suppressed" value={d.suppression.total} />
      </div>

      {/* Suppression breakdown */}
      <Card>
        <div className={EYEBROW}>Suppression by reason</div>
        {suppressionReasons.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No suppressed contacts.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suppressionReasons.map(([reason, n]) => (
              <span key={reason} className={CHIP}>
                {reason.replace(/_/g, " ")} {n}
              </span>
            ))}
          </div>
        )}
        <p className={`${FOOTNOTE} mt-2`}>
          contacts who replied, bounced, or unsubscribed are never contacted again
        </p>
      </Card>

      {/* Mailbox warmth roll-up */}
      <Card>
        <div className={EYEBROW}>Mailbox warmth</div>
        {warmth.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No mailboxes yet —{" "}
            <Link href="/senders" className="font-medium text-primary hover:underline">
              connect them on the Senders screen →
            </Link>
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {/* Same tone map as Senders — 'warm' is emerald on both screens (one semantic, one color). */}
            {warmth.map(([status, n]) => (
              <WarmthChip key={status} status={status} count={n} />
            ))}
          </div>
        )}
        <p className={`${FOOTNOTE} mt-2`}>only warm mailboxes can send</p>
      </Card>

      {/* Honest deferral — the not-yet-real series */}
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Open &amp; reply trends</p>
        <p className={FOOTNOTE}>these populate after your first real sends</p>
      </div>
    </div>
  );
}