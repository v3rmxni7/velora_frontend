"use client";

import { Button } from "@/components/ui/button";
import { useApproveTask, useRejectTask } from "@/lib/hooks/use-tasks";
import type { GroundingFact, Task } from "@/lib/api-types";
import { cn } from "@/lib/utils";

// The evidence rail: confidence, encoded in color. No gauges — the audit register.
function railColor(task: Task): string {
  if (task.draft_mode === "template") return "bg-[#9CA3AF]";
  const c = task.confidence ?? 0;
  if (c >= 0.75) return "bg-primary";
  if (c >= 0.5) return "bg-indigo-300";
  return "bg-[#9CA3AF]";
}

// Humanize a fact's source for the chip: "lead.title" → "lead · title"; proof/kb refs
// are uuids, so the type label alone is the honest summary.
function sourceLabel(fact: GroundingFact): string {
  if (fact.sourceType === "lead_field") return `lead · ${fact.sourceRef.replace(/^lead\./, "")}`;
  if (fact.sourceType === "proof_item") return "proof";
  return "kb";
}

function FactRow({ fact, used }: { fact: GroundingFact; used: boolean }) {
  return (
    <li className={cn("flex items-baseline gap-2.5 py-1", !used && "opacity-50")}>
      <span
        className={cn("size-1.5 shrink-0 self-center rounded-full", used ? "bg-primary" : "bg-border")}
        aria-hidden
      />
      <span className="w-10 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
        {fact.confidence.toFixed(2)}
      </span>
      <span className="text-sm text-foreground">{fact.text}</span>
      <span className="ml-auto shrink-0 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        {sourceLabel(fact)}
      </span>
      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
        {used ? "cited in draft" : "verified, not used"}
      </span>
    </li>
  );
}

export function DraftCard({ task, reveal }: { task: Task; reveal?: boolean }) {
  const approve = useApproveTask();
  const reject = useRejectTask();
  const grounding = task.grounding;
  const used = new Set(grounding?.usedFactIds ?? []);
  const resolved = task.status !== "pending";
  const isTemplate = task.draft_mode === "template";

  return (
    <article
      id={`task-${task.id}`}
      className={cn(
        "relative overflow-hidden rounded-md border border-border bg-card p-5 pl-6 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]",
        resolved && "opacity-70",
        reveal && "animate-draft-reveal",
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-[3px] origin-top",
          railColor(task),
          reveal && "animate-rail-draw",
        )}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-foreground">{task.subject ?? "(no subject)"}</h3>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            {isTemplate
              ? "template · safe fallback"
              : `personalized · ${(task.confidence ?? 0).toFixed(2)}`}
          </span>
          {task.status === "approved" && (
            <span className="font-mono text-[11px] text-emerald-600">approved</span>
          )}
          {task.status === "rejected" && (
            <span className="font-mono text-[11px] text-muted-foreground">rejected</span>
          )}
        </div>
      </div>

      <div className="mt-3 whitespace-pre-line rounded-md bg-secondary/50 p-4 text-sm text-foreground">
        {task.body}
      </div>

      <div className="mt-4">
        {isTemplate ? (
          <p className="text-sm text-muted-foreground">
            Not enough verified facts — Velora used the safe template instead of guessing.
          </p>
        ) : (
          grounding && (
            <>
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Grounded on {grounding.facts.length} verified fact
                {grounding.facts.length === 1 ? "" : "s"}
              </div>
              <ul className="mt-1.5 divide-y divide-border/60">
                {grounding.facts.map((f) => (
                  <FactRow key={f.id} fact={f} used={used.has(f.id)} />
                ))}
              </ul>
            </>
          )
        )}
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
          {isTemplate
            ? `reason: ${task.reason ?? "insufficient verified facts"}`
            : `verification: ${grounding?.verification.ok ? "passed" : "failed"}${
                grounding?.verification.regenerated ? " · regenerated once" : ""
              }`}
        </p>
      </div>

      {!resolved && (
        <div className="mt-4 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => approve.mutate(task.id)}
              disabled={approve.isPending || reject.isPending}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => reject.mutate(task.id)}
              disabled={approve.isPending || reject.isPending}
            >
              Reject
            </Button>
          </div>
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            approving queues the send — dry-run until go-live, no real email before then
          </p>
        </div>
      )}
    </article>
  );
}