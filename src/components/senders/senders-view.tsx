"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateDomain,
  useCreateSender,
  useDomains,
  useMailboxes,
  useSenders,
  useSyncMailboxes,
} from "@/lib/hooks/use-senders";
import { AuthChip, Reputation, WarmthChip } from "./senders-ui";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";

function SectionError({ what }: { what: string }) {
  return <p className="font-mono text-xs text-destructive">Couldn’t load {what}.</p>;
}

function Mailboxes() {
  const mailboxes = useMailboxes();
  const sync = useSyncMailboxes();
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className={EYEBROW}>Mailboxes</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => sync.mutate()}
          disabled={sync.isPending}
        >
          <RefreshCw className="size-4" />
          Sync from Smartlead
        </Button>
      </div>

      {mailboxes.isPending && <Skeleton className="h-20 w-full rounded-md" />}
      {mailboxes.isError && <SectionError what="mailboxes" />}
      {mailboxes.isSuccess && mailboxes.data.data.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">No mailboxes yet.</p>
          <p className={FOOTNOTE}>
            connect mailboxes in Smartlead during warmup, then sync — they appear here
          </p>
        </div>
      )}
      {mailboxes.isSuccess && mailboxes.data.data.length > 0 && (
        <ul className="space-y-2">
          {mailboxes.data.data.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{m.email}</p>
                <p className={`${FOOTNOTE} mt-0.5`}>
                  {m.provider} · <Reputation rep={m.reputation} />
                </p>
              </div>
              <WarmthChip status={m.status} />
            </li>
          ))}
        </ul>
      )}
      <p className={`${FOOTNOTE} mt-2`}>
        warm = cleared the warmup thresholds — only warm mailboxes can send (Slice 2.8 gate)
      </p>
    </section>
  );
}

function Senders() {
  const senders = useSenders();
  const create = useCreateSender();
  const [name, setName] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = name.trim();
    if (!v) return;
    create.mutate(v, { onSuccess: () => setName("") });
  };
  return (
    <section>
      <h2 className={`${EYEBROW} mb-3`}>Senders</h2>
      <form onSubmit={submit} className="mb-3 flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sender display name (e.g. Jordan Lee)"
          disabled={create.isPending}
        />
        <Button type="submit" size="sm" disabled={create.isPending || !name.trim()}>
          Add
        </Button>
      </form>
      {senders.isPending && <Skeleton className="h-12 w-full rounded-md" />}
      {senders.isError && <SectionError what="senders" />}
      {senders.isSuccess && senders.data.data.length === 0 && (
        <p className="text-sm text-muted-foreground">No senders yet.</p>
      )}
      {senders.isSuccess && senders.data.data.length > 0 && (
        <ul className="space-y-2">
          {senders.data.data.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-2.5"
            >
              <span className="text-sm text-foreground">{s.display_name ?? "(unnamed)"}</span>
              <span className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                {s.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Domains() {
  const domains = useDomains();
  const create = useCreateDomain();
  const [domain, setDomain] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = domain.trim().toLowerCase();
    if (!v) return;
    create.mutate(v, { onSuccess: () => setDomain("") });
  };
  return (
    <section>
      <h2 className={`${EYEBROW} mb-3`}>Sending domains</h2>
      <form onSubmit={submit} className="mb-3 flex gap-2">
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="lookalike sending domain (e.g. get-helloagentic.com)"
          disabled={create.isPending}
        />
        <Button type="submit" size="sm" disabled={create.isPending || !domain.trim()}>
          Add
        </Button>
      </form>
      {domains.isPending && <Skeleton className="h-12 w-full rounded-md" />}
      {domains.isError && <SectionError what="domains" />}
      {domains.isSuccess && domains.data.data.length === 0 && (
        <p className="text-sm text-muted-foreground">No sending domains yet.</p>
      )}
      {domains.isSuccess && domains.data.data.length > 0 && (
        <ul className="space-y-2">
          {domains.data.data.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-4 py-2.5"
            >
              <span className="font-mono text-sm text-foreground">{d.domain}</span>
              <div className="flex flex-wrap gap-1.5">
                <AuthChip label="SPF" status={d.spf_status} />
                <AuthChip label="DKIM" status={d.dkim_status} />
                <AuthChip label="DMARC" status={d.dmarc_status} />
                <AuthChip label="TRACK" status={d.tracking_status} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className={`${FOOTNOTE} mt-2`}>
        DNS records are set at your registrar; automated DNS verification arrives in a later phase
        (statuses read “unknown” until then)
      </p>
    </section>
  );
}

export function SendersView() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Mailboxes />
      <Senders />
      <Domains />
    </div>
  );
}