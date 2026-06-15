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
} from "@/lib/hooks/use-campaigns";
import type { EnrollmentStatus } from "@/lib/api-types";
import { CampaignStatusChip, EnrollmentCount, ENROLLMENT_ORDER } from "./campaigns-ui";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const CHIP = "rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground";

export function CampaignDetail({ id }: { id: string }) {
  const campaign = useCampaign(id);
  const enrollments = useEnrollments(id);
  const launch = useLaunchCampaign(id);
  const pause = usePauseCampaign(id);

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
              smartlead: {c.smartlead_campaign_id ? "provisioned" : "not provisioned"}
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

      {/* Steps */}
      <section>
        <h2 className={`${EYEBROW} mb-3`}>Sequence</h2>
        <ul className="space-y-2">
          {[...c.steps]
            .sort((a, b) => a.step_number - b.step_number)
            .map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-2.5"
              >
                <span className="text-sm text-foreground">Step {s.step_number}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {s.channel} · {s.body_mode.replace(/_/g, " ")} · delay {s.delay_days}d
                </span>
              </li>
            ))}
        </ul>
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
          single step in this phase — multi-step sequences arrive later
        </p>
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
            <div className="flex flex-wrap gap-1.5">
              {ENROLLMENT_ORDER.filter((s) => counts[s]).map((s) => (
                <EnrollmentCount key={s} status={s as EnrollmentStatus} n={counts[s]} />
              ))}
            </div>
          ))}
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          launching enrolls the list and generates drafts in Tasks — sending happens after warmup +
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