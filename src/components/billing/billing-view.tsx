"use client";

import { CountUp } from "@/components/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useBilling } from "@/lib/hooks/use-billing";
import { cn } from "@/lib/utils";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-md border border-border bg-card p-5 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]", className)}>
      {children}
    </div>
  );
}

// Billing (Slice 4.10) — HONEST SHELL. Plan + tiers + the real ledger balance are shown, but the
// top-up / upgrade controls are disabled with an honest "not configured" state: no payment provider
// is connected, so nothing here charges a card or fabricates a balance. The plan tier is real stored
// data set by the account, not by a purchase.
export function BillingView() {
  const q = useBilling();

  if (q.isPending) return <Skeleton className="mx-auto h-96 w-full max-w-3xl rounded-md" />;
  if (q.isError)
    return (
      <p className="mx-auto max-w-3xl font-mono text-xs text-destructive">
        Couldn’t load billing — check the backend.
      </p>
    );

  const { plan, tiers, balance, lowBalance, topUpConfigured } = q.data.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Honest top-up status — no payment provider connected. */}
      {!topUpConfigured && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em]">Billing not connected</p>
          <p className="mt-1 text-sm">
            Your plan is set by your account — no card is charged here. Top-ups and upgrades activate
            once a payment provider is connected.
          </p>
        </div>
      )}

      {/* Current balance + plan */}
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={EYEBROW}>Credit balance</h2>
            <p className="mt-1 font-mono text-2xl tabular-nums text-foreground">
              <CountUp value={balance} />
            </p>
            {lowBalance && (
              <p className="mt-1 font-mono text-[11px] text-amber-700 dark:text-amber-400">
                low balance — real sends require credits
              </p>
            )}
          </div>
          <div className="text-right">
            <h2 className={EYEBROW}>Current plan</h2>
            <p className="mt-1 text-lg font-medium capitalize text-foreground">{plan}</p>
          </div>
        </div>
        <div className="mt-4 border-t border-border/60 pt-3">
          {/* Hard-disabled while topUpConfigured is false (always, this slice). Go-live: wire
              disabled={!topUpConfigured} + a real label/handler once a payment provider is connected. */}
          <button
            type="button"
            disabled
            title="Connect a payment provider to enable top-ups"
            className="cursor-not-allowed rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground"
          >
            Add credits — coming soon
          </button>
        </div>
      </Card>

      {/* Plan tiers */}
      <div>
        <h2 className={`${EYEBROW} mb-3`}>Plans</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {tiers.map((t) => {
            const current = t.tier === plan;
            return (
              <Card key={t.tier} className={cn(current && "border-primary/50 ring-1 ring-primary/20")}>
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-foreground">{t.name}</span>
                  {current && (
                    <span className="rounded border border-primary/40 px-1 font-mono text-[10px] uppercase tracking-[0.1em] text-primary">
                      current
                    </span>
                  )}
                </div>
                <p className="mt-1 font-mono text-lg tabular-nums text-foreground">
                  ${t.priceUsdMonthly.toLocaleString()}
                  <span className="text-[11px] text-muted-foreground">/mo</span>
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {t.includedCredits.toLocaleString()} credits · ~{t.leadsPerMonth.toLocaleString()} leads/mo
                </p>
                <p className="mt-2 text-[13px] text-muted-foreground">{t.blurb}</p>
                <button
                  type="button"
                  disabled
                  title="Connect a payment provider to enable plan changes"
                  className="mt-3 w-full cursor-not-allowed rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground"
                >
                  {current ? "Your plan" : "Upgrade — coming soon"}
                </button>
              </Card>
            );
          })}
        </div>
      </div>

      <p className="font-mono text-[11px] text-muted-foreground">
        AI &amp; data work is metered in credits; sending infrastructure is billed in dollars. Credits
        post from onboarding quests and grants today; purchases activate at go-live when a payment
        provider is connected — no charge is ever simulated.
      </p>
    </div>
  );
}
