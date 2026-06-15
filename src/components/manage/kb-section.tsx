"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { KbDocumentStatus } from "@/lib/api-types";
import { useIngestKb, useKbDocuments } from "@/lib/hooks/use-knowledge";
import { cn } from "@/lib/utils";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const CHIP = "rounded border px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap";
const STATUS_TONE: Record<KbDocumentStatus, string> = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  pending: "border-border bg-card text-muted-foreground",
  scraping: "border-border bg-card text-muted-foreground",
  chunking: "border-border bg-card text-muted-foreground",
  embedding: "border-border bg-card text-muted-foreground",
};

export function KbSection() {
  const docs = useKbDocuments();
  const ingest = useIngestKb();
  const [url, setUrl] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = url.trim();
    if (!v) return;
    ingest.mutate(v, { onSuccess: () => setUrl("") });
  };

  return (
    <section>
      <h3 className={`${EYEBROW} mb-1`}>Knowledge sources</h3>
      <p className="mb-3 text-sm text-muted-foreground">
        Pages the agent scrapes &amp; embeds for grounding (RAG).
      </p>
      <form onSubmit={submit} className="mb-3 flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-site.com/page-to-ingest"
          disabled={ingest.isPending}
        />
        <Button type="submit" size="sm" disabled={ingest.isPending || !url.trim()}>
          Ingest
        </Button>
      </form>

      {docs.isPending && <Skeleton className="h-12 w-full rounded-md" />}
      {docs.isError && <p className="font-mono text-xs text-destructive">Couldn’t load sources.</p>}
      {docs.isSuccess && docs.data.data.length === 0 && (
        <p className="text-sm text-muted-foreground">No knowledge sources yet.</p>
      )}
      {docs.isSuccess && docs.data.data.length > 0 && (
        <ul className="space-y-2">
          {docs.data.data.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{d.title ?? d.source_url ?? "—"}</p>
                <p className="truncate font-mono text-[10px] text-muted-foreground">
                  {d.kind}
                  {d.source_url ? ` · ${d.source_url}` : ""}
                </p>
              </div>
              <span className={cn(CHIP, STATUS_TONE[d.status])}>{d.status}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 font-mono text-[11px] text-muted-foreground">
        ingestion runs in the background (scrape → chunk → embed); documents appear here as they
        process — activates at go-live if the key isn’t set
      </p>
    </section>
  );
}
