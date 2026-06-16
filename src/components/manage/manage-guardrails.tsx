"use client";

import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AutonomyEventRow } from "@/lib/api-types";
import { useAutonomy, useAutonomyEvents, usePauseAutonomy } from "@/lib/hooks/use-autonomy";
import { useSendingMode } from "@/lib/hooks/use-knowledge";
import { cn } from "@/lib/utils";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const CHIP = "rounded border px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap";
const SAFE = "border-emerald-200 bg-emerald-50 text-emerald-700";
const WARN = "border-amber-200 bg-amber-50 text-amber-700";
const MUTED = "border-border bg-card text-muted-foreground";
const ON = "border-primary/30 bg-accent text-accent-foreground";

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border border-border bg-card p-5">{children}</div>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-foreground">{label}</span>
      {children}
    </div>
  );
}

/** A coarse relative time — autonomy events are recent + low-volume; precision isn't the point. */
function when(iso: string): string {
  const d = new Date(iso).getTime();
  const s = Math.max(0, Math.round((Date.now() - d) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

function EventRow({ e }: { e: AutonomyEventRow }) {
  const isPause = e.kind === "auto_pause";
  return (
    <li className="flex items-start justify-between gap-3 border-b border-border/60 py-2 last:border-b-0">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn(CHIP, isPause ? WARN : MUTED)}>{e.kind}</span>
          <span className="font-mono text-[11px] text-foreground">{e.decision}</span>
        </div>
        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{e.reason}</p>
      </div>
      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{when(e.created_at)}</span>
    </li>
  );
}

export function ManageGuardrails() {
  const autonomy = useAutonomy();
  const sending = useSendingMode();
  const events = useAutonomyEvents({ limit: 50 });
  const pause = usePauseAutonomy();

  const a = autonomy.data?.data;
  const live = !!sending.data?.data?.sendingEnabled && !sending.data?.data?.dryRun;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Safety posture — the trust anchor. */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <h2 className={EYEBROW}>Safety posture</h2>
        </div>
        {sending.isPending || autonomy.isPending ? (
          <Skeleton className="h-16 w-full rounded-md" />
        ) : (
          <div className="divide-y divide-border/60">
            <Row label="Live email">
              <span className={cn(CHIP, live ? WARN : SAFE)}>
                {live ? "LIVE" : "OFF · dry-run"}
              </span>
            </Row>
            <Row label="Autonomy">
              <span className={cn(CHIP, a?.autonomyEnabled ? ON : MUTED)}>
                {a?.autonomyEnabled ? "ON" : "OFF"}
              </span>
            </Row>
            <Row label="Reply mode">
              <span className={cn(CHIP, a?.autoReplyMode && a.autoReplyMode !== "off" ? ON : MUTED)}>
                {a?.autoReplyMode ?? "—"}
              </span>
            </Row>
          </div>
        )}
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          real email requires the deliberate go-live flip (sending on + dry-run off) — there is no UI
          toggle for it.
        </p>
      </Card>

      {/* Thresholds — the circuit-breaker config (read-only). */}
      <Card>
        <h2 className={`${EYEBROW} mb-3`}>Guardrail thresholds</h2>
        {autonomy.isPending ? (
          <Skeleton className="h-20 w-full rounded-md" />
        ) : autonomy.isError || !a ? (
          <p className="font-mono text-xs text-destructive">Couldn’t load the guardrails.</p>
        ) : (
          <div className="divide-y divide-border/60">
            <Row label="Auto-send confidence floor">
              <span className="font-mono text-sm tabular-nums text-foreground">
                {a.autoSendMinConfidence}
              </span>
            </Row>
            <Row label="Auto-pause if bounce rate over">
              <span className="font-mono text-sm tabular-nums text-foreground">
                {Math.round(a.guardrails.bounceRate * 100)}%
              </span>
            </Row>
            <Row label="…over the last (window)">
              <span className="font-mono text-sm tabular-nums text-foreground">
                {a.guardrails.windowHours}h
              </span>
            </Row>
            <Row label="Min sends before judging the rate">
              <span className="font-mono text-sm tabular-nums text-foreground">
                {a.guardrails.minSends}
              </span>
            </Row>
            <Row label="Auto-pause if complaints over">
              <span className="font-mono text-sm tabular-nums text-foreground">
                {a.guardrails.maxComplaints}
              </span>
            </Row>
          </div>
        )}
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          the monitor sweeps every 15 min and auto-pauses autonomy on a breach.
        </p>
      </Card>

      {/* Pause — the kill switch (off-direction only). */}
      <Card>
        <h2 className={`${EYEBROW} mb-3`}>Emergency pause</h2>
        {a?.autonomyEnabled ? (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              Immediately halt all autonomous activity (auto-approval, follow-ups, reply sends). Safe
              to use any time; turning autonomy back on is a deliberate step.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => pause.mutate()}
              disabled={pause.isPending}
            >
              Pause autonomy
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Autonomy is off — nothing to pause.</p>
        )}
      </Card>

      {/* Activity — the audit log. */}
      <Card>
        <h2 className={`${EYEBROW} mb-1`}>Activity</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Every autonomous decision + pause, newest first.
        </p>
        {events.isPending && <Skeleton className="h-24 w-full rounded-md" />}
        {events.isError && (
          <p className="font-mono text-xs text-destructive">Couldn’t load the activity log.</p>
        )}
        {events.isSuccess && events.data.data.events.length === 0 && (
          <p className="text-sm text-muted-foreground">No autonomy activity yet.</p>
        )}
        {events.isSuccess && events.data.data.events.length > 0 && (
          <ul>
            {events.data.data.events.map((e) => (
              <EventRow key={e.id} e={e} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
