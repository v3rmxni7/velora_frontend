"use client";

import {
  Flame,
  type LucideIcon,
  Megaphone,
  MousePointerClick,
  Radar,
  Repeat2,
  Snowflake,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { type CampaignType, SUPPORTED_CAMPAIGN_TYPES } from "@/lib/api-types";
import { useCampaigns, useCreateCampaign, useLists } from "@/lib/hooks/use-campaigns";
import { cn } from "@/lib/utils";
import { CampaignStatusChip } from "./campaigns-ui";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";
const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

// The 5 campaign types (SPEC §3.2). `source` is the honest "connect X" copy for types whose audience
// source isn't connected yet (everything but cold). One engine; the lead source differs.
const TYPE_META: { type: CampaignType; label: string; desc: string; source: string; icon: LucideIcon }[] = [
  { type: "cold_outbound", label: "Cold outbound", desc: "Net-new prospects from a saved list.", source: "", icon: Snowflake },
  { type: "warm_outbound", label: "Warm outbound", desc: "Existing contacts in your CRM.", source: "a CRM (HubSpot or Salesforce)", icon: Flame },
  { type: "cross_sell", label: "Cross-sell / upsell", desc: "Existing customers — expansion.", source: "a CRM (HubSpot or Salesforce)", icon: Repeat2 },
  { type: "website_visitor", label: "Website visitor", desc: "De-anonymized site visitors.", source: "website-visitor tracking", icon: MousePointerClick },
  { type: "intent_signals", label: "Intent signals", desc: "Prospects surfaced by a signal.", source: "an intent signal", icon: Radar },
];

function NewCampaign() {
  const router = useRouter();
  const lists = useLists();
  const create = useCreateCampaign();
  const [type, setType] = useState<CampaignType>("cold_outbound");
  const [name, setName] = useState("");
  const [listId, setListId] = useState("");

  const supported = SUPPORTED_CAMPAIGN_TYPES.includes(type);
  const meta = TYPE_META.find((m) => m.type === type) ?? TYPE_META[0];
  const noLists = lists.isSuccess && lists.data.data.length === 0;
  // Only cold_outbound takes a list; intent_signals sources its audience from a signal subscription
  // (set up later on the Signals page), so it's creatable with no list.
  const requiresList = type === "cold_outbound";
  const canSubmit = supported && !!name.trim() && (!requiresList || !!listId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    create.mutate(
      { name: name.trim(), ...(requiresList ? { listId } : {}), campaignType: type },
      { onSuccess: ({ data }) => router.push(`/campaigns/${data.id}`) },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-md border border-border bg-card p-4 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {TYPE_META.map((m) => {
          const active = m.type === type;
          const ready = SUPPORTED_CAMPAIGN_TYPES.includes(m.type);
          const Icon = m.icon;
          return (
            <button
              type="button"
              key={m.type}
              onClick={() => setType(m.type)}
              className={cn(
                "rounded-md border p-2.5 text-left transition-all",
                active
                  ? "border-primary/40 bg-accent shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]"
                  : "border-border hover:-translate-y-0.5 hover:border-primary/20 hover:bg-accent/50 hover:shadow-[0_2px_10px_-4px_rgba(16,24,40,0.1)]",
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-md border",
                    active
                      ? "border-primary/30 bg-card text-primary"
                      : "border-border bg-secondary/40 text-muted-foreground",
                  )}
                  aria-hidden
                >
                  <Icon className="size-3.5" />
                </span>
                {!ready && (
                  <span className="rounded border border-border px-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70">
                    soon
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm font-medium text-foreground">{m.label}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{m.desc}</p>
            </button>
          );
        })}
      </div>

      {supported ? (
        <>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Campaign name"
            disabled={create.isPending}
          />
          {requiresList ? (
            lists.isPending ? (
              <Skeleton className="h-8 w-full rounded-lg" />
            ) : noLists ? (
              <p className="text-sm text-muted-foreground">
                No lists yet —{" "}
                <Link href="/lead-discovery" className="font-medium text-primary hover:underline">
                  find leads and save a list first →
                </Link>
              </p>
            ) : (
              <select
                value={listId}
                onChange={(e) => setListId(e.target.value)}
                disabled={create.isPending}
                className={SELECT_CLASS}
              >
                <option value="">Select an audience list…</option>
                {lists.data?.data.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} · {l.entity_type}
                  </option>
                ))}
              </select>
            )
          ) : type === "website_visitor" ? (
            <p className="text-sm text-muted-foreground">
              No list needed — the audience comes from your website-visitor pixel.{" "}
              <Link href="/website-visitors" className="font-medium text-primary hover:underline">
                install the pixel →
              </Link>
            </p>
          ) : type === "warm_outbound" || type === "cross_sell" ? (
            <p className="text-sm text-muted-foreground">
              No list needed — the audience comes from your connected CRM.{" "}
              <Link href="/connections" className="font-medium text-primary hover:underline">
                connect a CRM →
              </Link>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No list needed — the audience comes from your signal subscriptions.{" "}
              <Link href="/signals" className="font-medium text-primary hover:underline">
                subscribe live signals →
              </Link>
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className={FOOTNOTE}>
              {requiresList
                ? "launching enrolls the list + drafts in Tasks — dry-run until go-live"
                : type === "website_visitor"
                  ? "create, then install the pixel — identified visitors enroll as they’re matched (dry-run until go-live)"
                  : type === "warm_outbound" || type === "cross_sell"
                    ? "create, then connect a CRM — synced contacts enroll as they import (dry-run until go-live)"
                    : "create, then subscribe signals — leads enroll as they fire (dry-run until go-live)"}
            </p>
            <Button type="submit" size="sm" disabled={create.isPending || !canSubmit}>
              Create campaign
            </Button>
          </div>
        </>
      ) : (
        <div className="rounded-md border border-dashed border-border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Connect {meta.source} to source this campaign type.
          </p>
          <p className={`${FOOTNOTE} mt-1`}>
            the {meta.label.toLowerCase()} engine is ready — it lights up when its source is connected
          </p>
        </div>
      )}
    </form>
  );
}

export function CampaignList() {
  const campaigns = useCampaigns();
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section>
        <h2 className={`${EYEBROW} mb-3`}>New campaign</h2>
        <NewCampaign />
      </section>

      <section>
        <h2 className={`${EYEBROW} mb-3`}>Campaigns</h2>
        {campaigns.isPending && <Skeleton className="h-16 w-full rounded-md" />}
        {campaigns.isError && (
          <p className="font-mono text-xs text-destructive">
            Couldn’t load campaigns — check that the backend is running.
          </p>
        )}
        {campaigns.isSuccess && campaigns.data.data.length === 0 && (
          <EmptyState icon={Megaphone} title="No campaigns yet." description="Pick a type above to create your first campaign." />
        )}
        {campaigns.isSuccess && campaigns.data.data.length > 0 && (
          <ul className="space-y-2">
            {campaigns.data.data.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/campaigns/${c.id}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-accent/50 hover:shadow-[0_2px_10px_-4px_rgba(16,24,40,0.1)]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                    <p className={`${FOOTNOTE} mt-0.5`}>{c.campaign_type.replace(/_/g, " ")}</p>
                  </div>
                  <CampaignStatusChip status={c.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
