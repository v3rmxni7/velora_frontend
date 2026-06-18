"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useWebsiteVisitorSummary } from "@/lib/hooks/use-website-visitors";
import { TrackedDomains } from "./tracked-domains";
import { VisitorMetrics } from "./visitor-metrics";
import { VisitorTabs } from "./visitor-tabs";

const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";

export function WebsiteVisitorsView() {
  const summary = useWebsiteVisitorSummary();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <p className={FOOTNOTE}>
        Install the pixel on your site to record anonymous visits (real, now). Person- and
        company-level identification activates when a de-anonymization provider is connected.
      </p>

      {summary.isPending && <Skeleton className="h-40 w-full rounded-md" />}
      {summary.isError && (
        <p className="font-mono text-xs text-destructive">
          Couldn’t load website visitors — check that the backend is running.
        </p>
      )}
      {summary.isSuccess && (
        <>
          <VisitorMetrics summary={summary.data.data} />
          <TrackedDomains domains={summary.data.data.domains} />
          <VisitorTabs />
        </>
      )}
    </div>
  );
}
