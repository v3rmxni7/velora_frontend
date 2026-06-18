"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { CallRow } from "@/lib/api-types";
import { useAddToQueue, useDialerQueue, useSkipCall } from "@/lib/hooks/use-dialer";
import { cn } from "@/lib/utils";
import { CallBriefCard } from "./call-brief-card";
import { CallButton } from "./call-button";
import { LogOutcomeDialog } from "./log-outcome-dialog";

const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";
const PILL = "rounded-md px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors";
const SELECT_CLASS =
  "h-8 min-w-48 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const TABS = [
  { key: "ready", label: "Ready to call" },
  { key: "upcoming", label: "Upcoming" },
  { key: "log", label: "Call log" },
] as const;
type Tab = (typeof TABS)[number]["key"];

export function DialerView() {
  const [tab, setTab] = useState<Tab>("ready");
  const queue = useDialerQueue(tab);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className={FOOTNOTE}>
        The agent prepares briefs + queues leads — you place the call (a tel: link opens your phone).
        In-app calling activates when a calling provider is connected.
      </p>

      <AddToQueue />

      <div className="flex gap-1">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              PILL,
              t.key === tab ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {queue.isPending && <Skeleton className="h-24 w-full rounded-md" />}
      {queue.isError && (
        <p className="font-mono text-xs text-destructive">Couldn’t load the dialer — check the backend.</p>
      )}
      {queue.isSuccess && queue.data.data.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {tab === "log" ? "No calls logged yet." : "Nothing queued — add a lead above."}
        </p>
      )}
      {queue.isSuccess && queue.data.data.length > 0 && (
        <ul className="space-y-2">
          {queue.data.data.map((c) => (
            <li key={c.id}>
              <CallRowItem call={c} tab={tab} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CallRowItem({ call, tab }: { call: CallRow; tab: Tab }) {
  const skip = useSkipCall();
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{call.leadName ?? "(unnamed lead)"}</p>
          <p className={`${FOOTNOTE} mt-0.5`}>
            {call.phone ?? "No phone on file"}
            {/* Outcomes are rep-logged, never agent-placed — label them so the log can't read as
                an automated call result (honesty: the agent never dials). */}
            {tab === "log" && call.outcome ? ` · logged: ${call.outcome.replace(/_/g, " ")}` : ""}
            {tab === "log" && call.called_at ? ` · ${new Date(call.called_at).toLocaleString()}` : ""}
            {tab === "upcoming" && call.scheduled_at
              ? ` · ${new Date(call.scheduled_at).toLocaleString()}`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={() => setOpen((o) => !o)}>
            {open ? "Hide brief" : "Brief"}
          </Button>
          {tab !== "log" && (
            <>
              <CallButton phone={call.phone} />
              <LogOutcomeDialog callId={call.id} />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={skip.isPending}
                onClick={() => skip.mutate(call.id)}
              >
                Skip
              </Button>
            </>
          )}
        </div>
      </div>
      {tab === "log" && call.notes && <p className="text-[13px] text-muted-foreground">{call.notes}</p>}
      {open && <CallBriefCard callId={call.id} />}
    </div>
  );
}

// Add-to-queue is person-only for 4.9b (the SPEC §3.7 dialer is people-first). Queuing companies /
// local_businesses — the latter carries a phone on file — is a deliberate later add, not an oversight.
function AddToQueue() {
  const add = useAddToQueue();
  const people = useQuery({ queryKey: ["dialer-people"], queryFn: () => api.getLeads("person") });
  const [leadId, setLeadId] = useState("");
  const [phone, setPhone] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;
    add.mutate(
      { leadType: "person", leadId, phone: phone.trim() || undefined },
      { onSuccess: () => { setLeadId(""); setPhone(""); } },
    );
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-3">
      <select
        value={leadId}
        onChange={(e) => setLeadId(e.target.value)}
        disabled={add.isPending || people.isPending}
        className={SELECT_CLASS}
      >
        <option value="">{people.isSuccess && people.data.data.length === 0 ? "No saved people — find leads first" : "Add a saved person…"}</option>
        {(people.data?.data ?? []).map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name ?? p.email ?? p.id}
          </option>
        ))}
      </select>
      <Input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="phone (optional)"
        disabled={add.isPending}
        className="w-40"
      />
      <Button type="submit" size="sm" disabled={add.isPending || !leadId}>
        Add to queue
      </Button>
    </form>
  );
}
