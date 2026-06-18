"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CrmIntegration } from "@/lib/api-types";
import {
  useConnectCrm,
  useDisconnectCrm,
  useLinkCrmToCampaign,
} from "@/lib/hooks/use-integrations";
import { cn } from "@/lib/utils";

const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";
const SELECT_CLASS =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";
const STATUS_TONE: Record<string, string> = {
  connected: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  disconnected: "border-border bg-card text-muted-foreground",
};

type ProviderMeta = { id: string; label: string };

export function CrmConnectionCard({
  provider,
  integration,
  configurable,
  crmCampaigns,
  campaignsPending,
}: {
  provider: ProviderMeta;
  integration?: CrmIntegration;
  configurable: boolean;
  crmCampaigns: { id: string; name: string }[];
  campaignsPending: boolean;
}) {
  const connect = useConnectCrm();
  const disconnect = useDisconnectCrm();
  const link = useLinkCrmToCampaign();
  const [campaignId, setCampaignId] = useState("");

  const status = integration?.status ?? "disconnected";
  const connected = status === "connected";
  const linked = crmCampaigns.find((c) => c.id === integration?.campaign_id);

  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{provider.label}</span>
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
            configurable
              ? (STATUS_TONE[status] ?? STATUS_TONE.disconnected)
              : "border-border text-muted-foreground/70",
          )}
        >
          {configurable ? status : "not configured"}
        </span>
      </div>

      {!configurable ? (
        <p className={FOOTNOTE}>
          connecting {provider.label} requires CRM app credentials (not configured yet)
        </p>
      ) : status === "pending" ? (
        <div className="flex items-center justify-between gap-3">
          <p className={FOOTNOTE}>finishing the connection…</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={connect.isPending}
            onClick={() => connect.mutate(provider.id)}
          >
            Reconnect
          </Button>
        </div>
      ) : connected ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className={FOOTNOTE}>
              last synced:{" "}
              {integration?.last_synced_at
                ? new Date(integration.last_synced_at).toLocaleString()
                : "never"}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disconnect.isPending}
              onClick={() => disconnect.mutate(provider.id)}
            >
              Disconnect
            </Button>
          </div>
          {/* Which warm/cross-sell campaign synced contacts enroll into. */}
          <div className="border-t border-border/60 pt-3">
            {linked ? (
              <p className={FOOTNOTE}>
                synced contacts enroll into{" "}
                <Link href={`/campaigns/${linked.id}`} className="font-medium text-primary hover:underline">
                  {linked.name}
                </Link>
              </p>
            ) : campaignsPending ? (
              <p className={FOOTNOTE}>loading campaigns…</p>
            ) : integration?.campaign_id ? (
              // The backend says a campaign is linked, but it's no longer a usable warm/cross-sell
              // campaign (deleted / type-changed) — say so honestly, and let them re-link.
              <div className="space-y-2">
                <p className={FOOTNOTE}>linked campaign is no longer available — re-link below</p>
                {crmCampaigns.length > 0 && (
                  <div className="flex items-center gap-2">
                    <select
                      value={campaignId}
                      onChange={(e) => setCampaignId(e.target.value)}
                      disabled={link.isPending}
                      className={SELECT_CLASS}
                    >
                      <option value="">Enroll into which campaign…</option>
                      {crmCampaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      size="sm"
                      disabled={link.isPending || !campaignId}
                      onClick={() => link.mutate({ provider: provider.id, campaignId })}
                    >
                      Re-link
                    </Button>
                  </div>
                )}
              </div>
            ) : crmCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No warm/cross-sell campaign yet —{" "}
                <Link href="/campaigns" className="font-medium text-primary hover:underline">
                  create one to enroll synced contacts →
                </Link>
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  disabled={link.isPending}
                  className={SELECT_CLASS}
                >
                  <option value="">Enroll into which campaign…</option>
                  {crmCampaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  disabled={link.isPending || !campaignId}
                  onClick={() => link.mutate({ provider: provider.id, campaignId })}
                >
                  Link
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className={FOOTNOTE}>
            {status === "error"
              ? "connection failed — reconnect to retry"
              : "connect to start syncing contacts"}
          </p>
          <Button
            type="button"
            size="sm"
            disabled={connect.isPending}
            onClick={() => connect.mutate(provider.id)}
          >
            Connect
          </Button>
        </div>
      )}
    </div>
  );
}
