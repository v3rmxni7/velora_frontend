"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCampaign,
  useEnrollments,
  useLaunchCampaign,
  usePauseCampaign,
  useUpdateCampaignSender,
} from "@/lib/hooks/use-campaigns";
import { useSenders } from "@/lib/hooks/use-senders";
import type { EnrollmentStatus } from "@/lib/api-types";
import { CampaignStatusChip, EnrollmentCount, ENROLLMENT_ORDER } from "./campaigns-ui";
import { SequenceBuilder } from "./sequence-builder";
import { VariantEditor } from "./variant-editor";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const CHIP = "rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground";

export function CampaignDetail({ id }: { id: string }) {
  const campaign = useCampaign(id);
  const enrollments = useEnrollments(id);
  const launch = useLaunchCampaign(id);
  const pause = usePauseCampaign(id);
  const senders = useSenders();
  const updateSender = useUpdateCampaignSender(id);

  if (campaign.isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-2/3 rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    );
  }
  if (campaign.isError) {
    return (
      <p className="font-mono text-xs text-destructive">
        Couldn’t load this campaign — it may not exist, or the backend is down.
      </p>
    );
  }

  const c = campaign.data.data;
  const counts = (enrollments.data?.data ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});
  const total = enrollments.data?.data.length ?? 0;
  // Honest per-reason tallies from the enrollments' real error codes (E4). Known codes get plain
  // language; anything else surfaces as its raw code rather than disappearing.
  const REASON_LABEL: Record<string, string> = {
    no_email: "no verified email found — enrichment couldn't produce one",
    enrich_quota: "enrichment deferred — daily quota reached, retries on the next run",
    enrich_insufficient_credit: "enrichment deferred — needs credits",
    email_invalid: "undeliverable address (failed verification)",
    email_disposable: "undeliverable address (disposable domain)",
  };
  const reasons = Object.entries(
    (enrollments.data?.data ?? []).reduce<Record<string, number>>((acc, e) => {
      if (!e.error) return acc;
      const label = REASON_LABEL[e.error] ?? e.error.replace(/_/g, " ");
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {}),
  );
  const busy = launch.isPending || pause.isPending;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Campaigns
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-semibold text-foreground">{c.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <CampaignStatusChip status={c.status} />
            <span className={CHIP}>{c.campaign_type.replace(/_/g, " ")}</span>
            <span className={CHIP}>
              sending: {c.smartlead_campaign_id ? "ready" : "setting up"}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {c.status === "active" ? (
            <Button size="sm" variant="outline" onClick={() => pause.mutate()} disabled={busy}>
              Pause
            </Button>
          ) : (
            <Button size="sm" onClick={() => launch.mutate()} disabled={busy}>
              {c.status === "draft" ? "Launch" : "Resume"}
            </Button>
          )}
        </div>
      </div>

      {/* Sender picker — the campaign's sending identity. A live campaign with no sender defers
          (never blasts every warm mailbox); a paused sender's mailbox never sends. */}
      <section>
        <h2 className={`${EYEBROW} mb-2`}>Sender</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Campaign sender"
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
            value={c.sender_id ?? ""}
            disabled={updateSender.isPending || senders.isPending}
            onChange={(e) => updateSender.mutate(e.target.value === "" ? null : e.target.value)}
          >
            <option value="">— No sender assigned —</option>
            {(senders.data?.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.display_name ?? "(unnamed)"}
                {s.status !== "active" ? ` · ${s.status}` : ""}
              </option>
            ))}
          </select>
          {!c.sender_id && (
            <span className="font-mono text-[11px] text-amber-600">
              unassigned — live sends wait until you assign a sender
            </span>
          )}
        </div>
        {senders.isSuccess && (senders.data?.data.length ?? 0) === 0 && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            No senders yet — create one on the{" "}
            <Link href="/senders" className="text-primary hover:underline">
              Senders
            </Link>{" "}
            page first.
          </p>
        )}
      </section>

      {/* Sequence — editable while draft, locked once launched (4.3) */}
      <section>
        <h2 className={`${EYEBROW} mb-3`}>Sequence</h2>
        <SequenceBuilder campaignId={id} steps={c.steps} editable={c.status === "draft"} />
      </section>

      {/* A/Z variants — editable while draft, locked once launched (4.4) */}
      <section>
        <h2 className={`${EYEBROW} mb-3`}>A/Z variants</h2>
        <VariantEditor campaignId={id} variants={c.variants ?? []} editable={c.status === "draft"} />
      </section>

      {/* Enrollment breakdown */}
      <section>
        <h2 className={`${EYEBROW} mb-3`}>Audience · {total} enrolled</h2>
        {enrollments.isPending && <Skeleton className="h-8 w-full rounded-md" />}
        {enrollments.isError && (
          <p className="font-mono text-xs text-destructive">Couldn’t load enrollments.</p>
        )}
        {enrollments.isSuccess &&
          (total === 0 ? (
            <p className="text-sm text-muted-foreground">
              No one enrolled yet — launch to enroll this campaign’s list.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {ENROLLMENT_ORDER.filter((s) => counts[s]).map((s) => (
                  <EnrollmentCount key={s} status={s as EnrollmentStatus} n={counts[s]} />
                ))}
              </div>
              {/* Honest reason breakdown (E4): the WHY behind failed/deferred enrollments, from the
                  real error codes — a lead either has a verified address or an honest reason it
                  doesn't. Unknown codes fall back to the raw code (never hidden). */}
              {reasons.length > 0 && (
                <ul className="mt-2 space-y-0.5 font-mono text-[11px] text-muted-foreground">
                  {reasons.map(([label, n]) => (
                    <li key={label}>
                      {n} {label}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ))}
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          launching enrolls the audience and generates drafts in Tasks — sending is dry-run until
          go-live
        </p>
        <Link
          href="/engage"
          className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
        >
          Review drafts in Tasks →
        </Link>
      </section>
    </div>
  );
}