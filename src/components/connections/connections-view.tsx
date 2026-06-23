"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaigns } from "@/lib/hooks/use-campaigns";
import { useIntegrations } from "@/lib/hooks/use-integrations";
import { CrmConnectionCard } from "./crm-connection-card";

const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";
const CRM_PROVIDERS = [
  { id: "hubspot", label: "HubSpot" },
  { id: "salesforce", label: "Salesforce" },
];

// The OAuth callback redirects back with ?status=...; surface it as a toast (honest about the outcome).
const STATUS_TOAST: Record<string, { kind: "success" | "error" | "info"; msg: string }> = {
  connected: { kind: "success", msg: "CRM connected." },
  denied: { kind: "info", msg: "Connection cancelled." },
  error: { kind: "error", msg: "Connection failed — try again." },
  not_configured: { kind: "info", msg: "This CRM isn’t available yet." },
};

export function ConnectionsView() {
  const integrations = useIntegrations();
  const campaigns = useCampaigns();
  const qc = useQueryClient();

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("status");
    if (!status) return;
    const t = STATUS_TOAST[status];
    if (t) {
      if (t.kind === "success") toast.success(t.msg);
      else if (t.kind === "error") toast.error(t.msg);
      else toast(t.msg);
    }
    qc.invalidateQueries({ queryKey: ["integrations"] });
    // clean only the status param (preserve pathname + any other query/hash)
    const url = new URL(window.location.href);
    url.searchParams.delete("status");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  }, [qc]);

  const crmCampaigns = (campaigns.data?.data ?? [])
    .filter((c) => c.campaign_type === "warm_outbound" || c.campaign_type === "cross_sell")
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className={FOOTNOTE}>
        Connect your CRM to source warm + cross-sell campaigns. Synced contacts enroll automatically;
        nothing sends until go-live.
      </p>

      {integrations.isPending && <Skeleton className="h-28 w-full rounded-md" />}
      {integrations.isError && (
        <p className="font-mono text-xs text-destructive">
          Couldn’t load connections — check that the backend is running.
        </p>
      )}
      {integrations.isSuccess && (
        <div className="space-y-2">
          {CRM_PROVIDERS.map((p) => (
            <CrmConnectionCard
              key={p.id}
              provider={p}
              integration={integrations.data.data.integrations.find((i) => i.provider === p.id)}
              configurable={integrations.data.data.configurableProviders.includes(p.id)}
              crmCampaigns={crmCampaigns}
              campaignsPending={campaigns.isPending}
            />
          ))}
        </div>
      )}

      {/* Outreach channels — honest 🔌 placeholder (4.14). Email is live; LinkedIn automation is
          deferred (SPEC §14) and NOT connected. No backend, no fake connection or activity counts. */}
      <div className="rounded-md border border-border bg-card p-4 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Outreach channels
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
            Email · live
          </span>
          <span className="rounded border border-dashed border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            LinkedIn · coming
          </span>
        </div>
        <p className={`${FOOTNOTE} mt-2`}>
          Email is your live channel. LinkedIn outreach is on the roadmap — not connected yet.
        </p>
      </div>
    </div>
  );
}
