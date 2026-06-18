"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useCallBrief } from "@/lib/hooks/use-dialer";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";

// The call brief — REAL structured data (lead + past interactions + grounding). No LLM: talking-point
// synthesis is honestly deferred, the labeled grounding sections ARE the brief.
export function CallBriefCard({ callId }: { callId: string }) {
  const q = useCallBrief(callId);
  if (q.isPending) return <Skeleton className="h-40 w-full rounded-md" />;
  if (q.isError)
    return <p className="font-mono text-xs text-destructive">Couldn’t load the brief.</p>;
  const b = q.data.data;

  return (
    <div className="space-y-4 rounded-md border border-border bg-secondary/30 p-4">
      <div>
        <div className={EYEBROW}>Lead</div>
        <p className="mt-1 text-sm font-medium text-foreground">{b.lead.name ?? "(unnamed)"}</p>
        <p className={FOOTNOTE}>
          {[b.lead.title, b.lead.company, b.lead.industry, b.lead.location].filter(Boolean).join(" · ") || "—"}
        </p>
        <p className={FOOTNOTE}>{b.lead.phone ? `☎ ${b.lead.phone}` : "No phone on file"}</p>
      </div>

      <div>
        <div className={EYEBROW}>Past interactions</div>
        {b.pastInteractions.threadCount === 0 ? (
          <p className={`${FOOTNOTE} mt-1`}>No prior emails on record.</p>
        ) : (
          <ul className="mt-1 space-y-1.5">
            {b.pastInteractions.summary.map((m, i) => (
              <li key={`${m.at}-${i}`} className="text-[13px] text-muted-foreground">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em]">
                  {m.direction}
                </span>{" "}
                {m.subject ? <span className="text-foreground">{m.subject}</span> : null}
                {m.category ? <span className="text-primary"> · {m.category}</span> : null}
                <span className="block truncate">{m.snippet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {b.grounding.campaignAngle && (
        <div>
          <div className={EYEBROW}>Angle</div>
          <p className="mt-1 text-[13px] text-muted-foreground">{b.grounding.campaignAngle}</p>
        </div>
      )}

      <GroundingList title="Proof points" items={b.grounding.proofItems.map((p) => p.text)} />
      <GroundingList title="Coaching" items={b.grounding.coachingPoints} />
      <GroundingList title="From your knowledge base" items={b.grounding.kbChunks.map((k) => k.content)} />
      {b.grounding.icp.length > 0 && (
        <GroundingList title="ICP" items={b.grounding.icp.map((i) => i.name)} />
      )}

      <div>
        <div className={EYEBROW}>Talking points</div>
        {b.talkingPoints.status === "generated" && b.talkingPoints.items.length > 0 ? (
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[13px] text-foreground">
            {b.talkingPoints.items.map((t, i) => (
              <li key={`tp-${i}`}>{t}</li>
            ))}
          </ul>
        ) : (
          <p className={`${FOOTNOTE} mt-1`}>
            Talking points generate when the writer is available — use the proof points + coaching
            above to guide the call.
          </p>
        )}
      </div>
    </div>
  );
}

function GroundingList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className={EYEBROW}>{title}</div>
      <ul className="mt-1 space-y-0.5 text-[13px] text-muted-foreground">
        {items.map((it, i) => (
          <li key={`${title}-${i}`} className="line-clamp-2">
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
