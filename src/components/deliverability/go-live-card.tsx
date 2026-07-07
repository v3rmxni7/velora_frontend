"use client";

import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGoLive, useGoLiveReadiness, usePauseLive } from "@/lib/hooks/use-go-live";
import { useTeamMe } from "@/lib/hooks/use-team";
import { cn } from "@/lib/utils";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
      {children}
    </div>
  );
}

// S1 — the productized go-live surface. Read-only readiness checklist for everyone; the flip + pause
// are owner-only (also enforced server-side — this gate is UX, not the security boundary). Honest
// throughout: go-live is a deliberate owner act behind a full readiness re-check + a typed org-name
// confirm; nothing here can send without the postal address (the L1 guard is the runtime backstop).
export function GoLiveCard() {
  const readiness = useGoLiveReadiness();
  const me = useTeamMe();
  const goLive = useGoLive();
  const pause = usePauseLive();
  const [confirm, setConfirm] = useState("");

  if (readiness.isPending) return <Skeleton className="h-40 w-full rounded-md" />;
  if (readiness.isError) {
    return (
      <Card>
        <h2 className={EYEBROW}>Live sending</h2>
        <p className="mt-2 font-mono text-xs text-destructive">
          Couldn’t load go-live readiness — check the backend.
        </p>
      </Card>
    );
  }

  const { ready, items, confirmPhrase, mode } = readiness.data.data;
  const isLive = mode.sendingEnabled && !mode.dryRun;
  const isOwner = me.data?.data.user.role === "owner";
  const canConfirm = confirm.trim() === confirmPhrase && confirmPhrase.length > 0;

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className={EYEBROW}>Live sending</h2>
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 font-mono text-[11px]",
            isLive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700",
          )}
        >
          {isLive ? "live" : "dry-run"}
        </span>
      </div>

      {isLive ? (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Sending is live — approved drafts reach real inboxes. Pause any time to return to dry-run.
          </p>
          {isOwner ? (
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pause.isPending}
                onClick={() => pause.mutate()}
              >
                {pause.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                Pause live sending
              </Button>
            </div>
          ) : (
            <p className={`${FOOTNOTE} mt-3`}>Only an owner can pause live sending.</p>
          )}
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            In dry-run, the full pipeline runs but nothing reaches a real inbox. Going live is a
            deliberate owner action, gated on the checklist below.
          </p>

          {/* Readiness checklist — every item must be green (re-checked server-side at go-live). */}
          <ul className="mt-3 space-y-1.5">
            {items.map((it) => (
              <li key={it.key} className="flex items-start gap-2 text-sm">
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                    it.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
                  )}
                  aria-hidden
                >
                  {it.ok ? <Check className="size-3" /> : <X className="size-3" />}
                </span>
                <span className="min-w-0">
                  <span className="text-foreground">{it.label}</span>{" "}
                  <span className={FOOTNOTE}>— {it.detail}</span>
                </span>
              </li>
            ))}
          </ul>

          {!isOwner ? (
            <p className={`${FOOTNOTE} mt-3`}>Only an owner can start live sending.</p>
          ) : !ready ? (
            <p className={`${FOOTNOTE} mt-3`}>
              Resolve every item above before you can go live.
            </p>
          ) : (
            <div className="mt-4 border-t border-border/60 pt-3">
              <label htmlFor="golive-confirm" className="text-sm text-foreground">
                Type{" "}
                <span className="font-mono text-[13px] text-foreground">{confirmPhrase}</span> to
                confirm going live:
              </label>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  id="golive-confirm"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={confirmPhrase}
                  autoComplete="off"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!canConfirm || goLive.isPending}
                  onClick={() => goLive.mutate(confirm.trim())}
                >
                  {goLive.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  Go live
                </Button>
              </div>
              <p className={`${FOOTNOTE} mt-2`}>
                This starts real sending for your organization. Every send still carries your postal
                address + an unsubscribe link, and you can pause any time.
              </p>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
