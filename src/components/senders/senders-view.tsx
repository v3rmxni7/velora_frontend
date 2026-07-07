"use client";

import { PenLine, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { MailboxRow, SenderRow } from "@/lib/api-types";
import {
  useAssignMailbox,
  useCreateDomain,
  useCreateSender,
  useDomains,
  useMailboxes,
  useSenders,
  useSetMailboxWarmupOverride,
  useSetPrimaryMailbox,
  useSyncMailboxes,
  useUpdateSender,
} from "@/lib/hooks/use-senders";
import { AuthChip, Reputation, WarmthChip } from "./senders-ui";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";
const SELECT_CLASS =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

function SectionError({ what }: { what: string }) {
  return <p className="font-mono text-xs text-destructive">Couldn’t load {what}.</p>;
}

function Mailboxes() {
  const mailboxes = useMailboxes();
  const sync = useSyncMailboxes();
  const override = useSetMailboxWarmupOverride();
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
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{m.email}</p>
                <p className={`${FOOTNOTE} mt-0.5`}>
                  {m.provider} · <Reputation rep={m.reputation} />
                  {m.warmup_override ? " · established (override)" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Established-mailbox fast lane: attest a real in-use mailbox so it's send-ready
                    without waiting out the warm-up counter. Only offered while not already warm by
                    the metric gate. */}
                {m.status !== "warm" || m.warmup_override ? (
                  <button
                    type="button"
                    onClick={() =>
                      override.mutate({ mailboxId: m.id, override: !m.warmup_override })
                    }
                    disabled={override.isPending}
                    className={`rounded-md border px-2 py-1 font-mono text-[11px] transition-colors disabled:opacity-50 ${
                      m.warmup_override
                        ? "border-border text-muted-foreground hover:bg-accent/50"
                        : "border-primary/30 text-primary hover:bg-accent"
                    }`}
                  >
                    {m.warmup_override ? "Clear override" : "Mark established"}
                  </button>
                ) : null}
                <WarmthChip status={m.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className={`${FOOTNOTE} mt-2`}>
        warm = cleared the warmup thresholds — only warm mailboxes can send. “Mark established” is for
        a real, in-use mailbox that’s already warm elsewhere; start at low volume and watch
        deliverability (cold sending can affect the domain’s reputation).
      </p>
    </section>
  );
}

function Senders() {
  const senders = useSenders();
  const mailboxes = useMailboxes();
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
            <li key={s.id}>
              <SenderConfig sender={s} mailboxes={mailboxes.data?.data ?? []} />
            </li>
          ))}
        </ul>
      )}
      <p className={`${FOOTNOTE} mt-2`}>
        pausing a sender stops its campaigns’ sends; an active sender still needs a warm, assigned
        mailbox to send. the primary is your default — sending rotates eligible warm mailboxes
      </p>
    </section>
  );
}

// 4.8 — per-sender config (REAL DB state): status (a real send gate), assigned mailboxes + the
// primary, and an honest "no mailboxes yet" state. Assignment uses the org's mailboxes (one query).
function SenderConfig({ sender, mailboxes }: { sender: SenderRow; mailboxes: MailboxRow[] }) {
  const updateSender = useUpdateSender();
  const assign = useAssignMailbox();
  const setPrimary = useSetPrimaryMailbox();
  const [toAssign, setToAssign] = useState("");
  const [sig, setSig] = useState(sender.signature ?? "");

  const mine = mailboxes.filter((m) => m.sender_id === sender.id);
  const unassigned = mailboxes.filter((m) => m.sender_id === null);

  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-4 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{sender.display_name ?? "(unnamed)"}</span>
        <select
          value={sender.status}
          onChange={(e) =>
            updateSender.mutate({
              id: sender.id,
              patch: { status: e.target.value as "setup" | "active" | "paused" },
            })
          }
          disabled={updateSender.isPending}
          className={SELECT_CLASS}
        >
          <option value="setup">Setup</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* Outreach channels (4.14) — honest 🔌 placeholder. Email is the live channel; LinkedIn is
          deferred (SPEC §14), shown as "coming" with no backend field and no fake connection. */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={FOOTNOTE}>Channels</span>
        {/* Channel availability (not the sender's send-state, which is the status select above):
            email is the live channel; linkedin is coming. */}
        <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          email
        </span>
        <span className="rounded border border-dashed border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          linkedin coming
        </span>
      </div>

      {/* Email signature (4.10) — real sending identity; completes the "email signature" quest. */}
      <div className="border-t border-border/60 pt-3">
        <span className={`${FOOTNOTE} mb-1 flex items-center gap-1.5`}>
          <PenLine className="size-3.5" aria-hidden />
          Email signature
        </span>
        <textarea
          value={sig}
          onChange={(e) => setSig(e.target.value)}
          rows={2}
          placeholder="e.g. — Ava, Velora · ava@yourco.com"
          className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        {/* Live preview — renders the current draft signature exactly as it appends below an email.
            Purely presentational: reads the existing `sig` state, no new fetch/mutation. */}
        <div className="mt-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2">
          <span className={`${FOOTNOTE} mb-1 block`}>Preview</span>
          {sig.trim() ? (
            <p className="whitespace-pre-wrap text-sm text-foreground">{sig}</p>
          ) : (
            <p className="text-sm text-muted-foreground/70">Your signature appears here.</p>
          )}
        </div>
        <div className="mt-1.5 flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={updateSender.isPending || (sig.trim() || "") === (sender.signature ?? "")}
            onClick={() =>
              updateSender.mutate({ id: sender.id, patch: { signature: sig.trim() || null } })
            }
          >
            Save signature
          </Button>
        </div>
      </div>

      <div className="border-t border-border/60 pt-3">
        {mine.length === 0 ? (
          <p className={FOOTNOTE}>no mailboxes assigned yet</p>
        ) : (
          <ul className="space-y-1.5">
            {mine.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <input
                    type="radio"
                    name={`primary-${sender.id}`}
                    checked={m.is_primary}
                    onChange={() => setPrimary.mutate({ senderId: sender.id, mailboxId: m.id })}
                    disabled={setPrimary.isPending}
                    aria-label="Set as primary mailbox"
                    className="accent-primary"
                  />
                  <span className="truncate font-mono text-[12px] text-foreground">{m.email}</span>
                  <WarmthChip status={m.status} />
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={assign.isPending}
                  onClick={() => assign.mutate({ mailboxId: m.id, senderId: null })}
                >
                  Unassign
                </Button>
              </li>
            ))}
          </ul>
        )}
        {unassigned.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <select
              value={toAssign}
              onChange={(e) => setToAssign(e.target.value)}
              disabled={assign.isPending}
              className={SELECT_CLASS}
            >
              <option value="">Assign a mailbox…</option>
              {unassigned.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.email}
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              disabled={assign.isPending || !toAssign}
              onClick={() =>
                assign.mutate(
                  { mailboxId: toAssign, senderId: sender.id },
                  { onSuccess: () => setToAssign("") },
                )
              }
            >
              Assign
            </Button>
          </div>
        )}
      </div>
    </div>
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