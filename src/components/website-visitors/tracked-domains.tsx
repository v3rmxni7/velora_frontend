"use client";

import { Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TrackedDomainRow } from "@/lib/api-types";
import { useCampaigns } from "@/lib/hooks/use-campaigns";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import {
  useCreateTrackedDomain,
  useLinkDomainToCampaign,
} from "@/lib/hooks/use-website-visitors";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";
const SELECT_CLASS =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const installSnippet = (siteKey: string) =>
  `<script async src="${API_BASE}/pixel/${siteKey}.js"></script>`;

export function TrackedDomains({ domains }: { domains: TrackedDomainRow[] }) {
  const create = useCreateTrackedDomain();
  // One campaigns query for the whole list (not per row); the website_visitor subset is the link target.
  const campaigns = useCampaigns();
  const visitorCampaigns = (campaigns.data?.data ?? []).filter(
    (c) => c.campaign_type === "website_visitor",
  );
  const [domain, setDomain] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = domain.trim();
    if (!v) return;
    create.mutate(v, { onSuccess: () => setDomain("") });
  };
  return (
    <section>
      <h2 className={`${EYEBROW} mb-3`}>Tracking domains</h2>
      <form onSubmit={submit} className="mb-3 flex gap-2">
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="your marketing site (e.g. acme.com)"
          disabled={create.isPending}
        />
        <Button type="submit" size="sm" disabled={create.isPending || !domain.trim()}>
          Add
        </Button>
      </form>
      {domains.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">No tracking domains yet.</p>
          <p className={FOOTNOTE}>add your site, then drop the snippet in its &lt;head&gt; to start collecting visits</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {domains.map((d) => (
            <li key={d.id}>
              <DomainRow
                d={d}
                visitorCampaigns={visitorCampaigns}
                campaignsPending={campaigns.isPending}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DomainRow({
  d,
  visitorCampaigns,
  campaignsPending,
}: {
  d: TrackedDomainRow;
  visitorCampaigns: { id: string; name: string }[];
  campaignsPending: boolean;
}) {
  const copy = useCopyToClipboard();
  const link = useLinkDomainToCampaign();
  const [campaignId, setCampaignId] = useState("");

  const linked = visitorCampaigns.find((c) => c.id === d.campaign_id);
  const snippet = installSnippet(d.site_key);

  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-medium text-foreground">{d.domain}</span>
      </div>

      {/* The install snippet — copyable. */}
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded border border-border bg-secondary/40 px-2 py-1.5 font-mono text-[11px] text-foreground">
          {snippet}
        </code>
        <Button type="button" size="sm" variant="outline" onClick={() => copy(snippet, "Snippet copied")}>
          <Copy className="size-4" />
          Copy
        </Button>
      </div>

      {/* Which website_visitor campaign identified people enroll into. */}
      <div className="border-t border-border/60 pt-3">
        {linked ? (
          <p className={FOOTNOTE}>
            identified people enroll into{" "}
            <Link href={`/campaigns/${linked.id}`} className="font-medium text-primary hover:underline">
              {linked.name}
            </Link>
          </p>
        ) : campaignsPending ? (
          <p className={FOOTNOTE}>loading campaigns…</p>
        ) : visitorCampaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No website-visitor campaign yet —{" "}
            <Link href="/campaigns" className="font-medium text-primary hover:underline">
              create one to enroll identified people →
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
              {visitorCampaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              disabled={link.isPending || !campaignId}
              onClick={() => link.mutate({ id: d.id, campaignId })}
            >
              Link
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
