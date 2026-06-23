"use client";

import { Loader2 } from "lucide-react";
import { AuthChip } from "@/components/senders/senders-ui";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLog, useCompliance, useVerifyDomain } from "@/lib/hooks/use-compliance";
import { cn } from "@/lib/utils";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";
const CHIP = "rounded border border-border px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
      {children}
    </div>
  );
}

// A short human detail for an audit row: its reason, else the most telling arg (real row data).
function auditDetail(e: { reason: string | null; args: Record<string, unknown> | null }): string | null {
  if (e.reason) return e.reason;
  const a = e.args ?? {};
  for (const key of ["domain", "newStatus", "newRole", "actionKind"]) {
    const v = a[key];
    if (typeof v === "string") return v;
  }
  return null;
}

function when(iso: string): string {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86_400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86_400)}d ago`;
}

export function ComplianceView() {
  const c = useCompliance();
  const audit = useAuditLog();
  const verify = useVerifyDomain();
  const verifyingId = verify.isPending ? verify.variables : null;

  if (c.isPending) return <Skeleton className="mx-auto h-96 w-full max-w-3xl rounded-md" />;
  if (c.isError)
    return (
      <p className="mx-auto max-w-3xl font-mono text-xs text-destructive">
        Couldn’t load compliance — check the backend.
      </p>
    );

  const { domains, retention, suppression } = c.data.data;
  const anyDkimUnknown = domains.some((d) => d.dkim_status === "unknown");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Domain authentication — REAL DNS SPF/DKIM/DMARC. */}
      <Card>
        <div className="flex items-baseline justify-between">
          <h2 className={EYEBROW}>Domain authentication</h2>
          <span className={FOOTNOTE}>SPF · DKIM · DMARC</span>
        </div>
        {domains.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No sending domains yet — add one in Senders to verify SPF, DKIM, and DMARC.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {domains.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2 last:border-b-0"
              >
                <div className="min-w-0">
                  <span className="font-mono text-sm text-foreground">{d.domain}</span>
                  <span className={`${FOOTNOTE} ml-2`}>
                    {d.verified_at ? `checked ${when(d.verified_at)}` : "not checked yet"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <AuthChip label="SPF" status={d.spf_status} />
                  <AuthChip label="DKIM" status={d.dkim_status} />
                  <AuthChip label="DMARC" status={d.dmarc_status} />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={verify.isPending}
                    onClick={() => verify.mutate(d.id)}
                  >
                    {verifyingId === d.id ? <Loader2 className="size-3.5 animate-spin" /> : null}
                    Verify now
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {anyDkimUnknown && (
          <p className={`${FOOTNOTE} mt-3`}>
            DKIM shows “unknown” until a DKIM selector is configured — SPF and DMARC verify regardless.
            A real DNS lookup never reports a fabricated “pass”.
          </p>
        )}
      </Card>

      {/* Data retention — dry-run-first. */}
      <Card>
        <div className="flex items-baseline justify-between gap-2">
          <h2 className={EYEBROW}>Data retention</h2>
          <span
            className={cn(
              CHIP,
              retention.dryRun
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700",
            )}
          >
            {retention.dryRun ? "report-only" : "active"}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Anonymous website visits are kept{" "}
          <span className="font-mono text-foreground">{retention.websiteVisitsDays}d</span>; processed
          signal events <span className="font-mono text-foreground">{retention.signalEventsDays}d</span>.
          Message and conversation history is never auto-purged.
        </p>
        <p className={`${FOOTNOTE} mt-2`}>
          {retention.dryRun
            ? "Report-only until go-live: the daily sweep records what would be purged and deletes nothing until retention is deliberately enabled."
            : "Live: the daily sweep purges telemetry past the window above."}
        </p>
      </Card>

      {/* Suppression — the real opt-out/bounce/complaint enforcement signal. */}
      <Card>
        <div className="flex items-baseline justify-between">
          <h2 className={EYEBROW}>Suppression list</h2>
          <span className="font-mono text-sm tabular-nums text-foreground">{suppression.total}</span>
        </div>
        {suppression.total === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No suppressed contacts — unsubscribes, bounces, and complaints land here and are enforced
            on every send.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(suppression.byReason).map(([reason, n]) => (
              <span key={reason} className={CHIP}>
                {reason} {n}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Audit log — immutable, append-only. */}
      <Card>
        <h2 className={`${EYEBROW} mb-1`}>Audit log</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Security-relevant changes (roles, senders, suppression, agentic actions, verifications),
          newest first. Append-only.
        </p>
        {audit.isPending && <Skeleton className="h-24 w-full rounded-md" />}
        {audit.isError && (
          <p className="font-mono text-xs text-destructive">Couldn’t load the audit log.</p>
        )}
        {audit.isSuccess && audit.data.data.events.length === 0 && (
          <p className="text-sm text-muted-foreground">No audit activity yet.</p>
        )}
        {audit.isSuccess && audit.data.data.events.length > 0 && (
          <ul>
            {audit.data.data.events.map((e) => (
              <li
                key={e.id}
                className="flex items-start justify-between gap-3 border-b border-border/60 py-2 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={CHIP}>{e.kind.replace(/_/g, " ")}</span>
                    {e.source ? (
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        {e.source}
                      </span>
                    ) : null}
                  </div>
                  {auditDetail(e) ? (
                    <p className={`${FOOTNOTE} mt-0.5 truncate`}>{auditDetail(e)}</p>
                  ) : null}
                </div>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {when(e.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
