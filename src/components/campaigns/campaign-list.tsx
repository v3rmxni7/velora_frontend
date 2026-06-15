"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaigns, useCreateCampaign, useLists } from "@/lib/hooks/use-campaigns";
import { CampaignStatusChip } from "./campaigns-ui";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";
const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

function CreateCampaignForm() {
  const router = useRouter();
  const lists = useLists();
  const create = useCreateCampaign();
  const [name, setName] = useState("");
  const [listId, setListId] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !listId) return;
    create.mutate(
      { name: name.trim(), listId, campaignType: "cold_outbound" },
      { onSuccess: ({ data }) => router.push(`/campaigns/${data.id}`) },
    );
  };

  const noLists = lists.isSuccess && lists.data.data.length === 0;

  return (
    <form onSubmit={submit} className="space-y-3 rounded-md border border-border bg-card p-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Campaign name"
        disabled={create.isPending}
      />
      {lists.isPending ? (
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
      )}
      <div className="flex items-center justify-between gap-3">
        <p className={FOOTNOTE}>only cold outbound ships in this phase</p>
        <Button type="submit" size="sm" disabled={create.isPending || !name.trim() || !listId}>
          Create campaign
        </Button>
      </div>
    </form>
  );
}

export function CampaignList() {
  const campaigns = useCampaigns();
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section>
        <h2 className={`${EYEBROW} mb-3`}>New campaign</h2>
        <CreateCampaignForm />
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
          <p className="text-sm text-muted-foreground">No campaigns yet.</p>
        )}
        {campaigns.isSuccess && campaigns.data.data.length > 0 && (
          <ul className="space-y-2">
            {campaigns.data.data.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/campaigns/${c.id}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary/60"
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