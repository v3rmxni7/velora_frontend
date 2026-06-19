"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CampaignStepInput, CampaignStepRow } from "@/lib/api-types";
import { useUpdateCampaignSteps } from "@/lib/hooks/use-campaigns";
import { cn } from "@/lib/utils";

const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";
const SELECT_CLASS =
  "h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const toInput = (s: CampaignStepRow): CampaignStepInput => ({
  delayDays: s.delay_days,
  bodyMode: s.body_mode,
  subjectTemplate: s.subject_template,
});
const blankStep: CampaignStepInput = { delayDays: 0, bodyMode: "ai_grounded", subjectTemplate: null };
const MAX_STEPS = 20;

/**
 * The sequence the durable follow-up sequencer runs (Slice 4.3). Editable only while the campaign is
 * a draft — once launched it's read-only (an in-flight enrollment must not have its steps mutated).
 * Save replaces the whole ordered list (PUT) → the backend renumbers to contiguous step_numbers.
 */
export function SequenceBuilder({
  campaignId,
  steps: initial,
  editable,
}: {
  campaignId: string;
  steps: CampaignStepRow[];
  editable: boolean;
}) {
  const sorted = [...initial].sort((a, b) => a.step_number - b.step_number);
  const update = useUpdateCampaignSteps(campaignId);
  const [steps, setSteps] = useState<CampaignStepInput[]>(() =>
    sorted.length > 0 ? sorted.map(toInput) : [{ ...blankStep }],
  );

  if (!editable) {
    return (
      <ul className="space-y-2">
        {sorted.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-2.5"
          >
            <span className="text-sm text-foreground">Step {s.step_number}</span>
            <span className={FOOTNOTE}>
              {s.channel} · {s.body_mode.replace(/_/g, " ")} · delay {s.delay_days}d
              {s.subject_template ? ` · “${s.subject_template}”` : ""}
            </span>
          </li>
        ))}
        <p className={`${FOOTNOTE} mt-1`}>sequence locked after launch</p>
      </ul>
    );
  }

  const set = (i: number, patch: Partial<CampaignStepInput>) =>
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const move = (i: number, dir: -1 | 1) =>
    setSteps((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j] as CampaignStepInput, next[i] as CampaignStepInput];
      return next;
    });
  const remove = (i: number) => setSteps((prev) => prev.filter((_, idx) => idx !== i));
  const add = () => setSteps((prev) => (prev.length >= MAX_STEPS ? prev : [...prev, { ...blankStep }]));

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {steps.map((s, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional + reorderable by index.
          <li key={i} className="rounded-md border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Step {i + 1}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => move(i, 1)}
                  disabled={i === steps.length - 1}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(i)}
                  disabled={steps.length === 1}
                  aria-label="Delete step"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                delay
                <input
                  type="number"
                  min={0}
                  max={365}
                  value={s.delayDays}
                  onChange={(e) => set(i, { delayDays: Math.max(0, Number(e.target.value) || 0) })}
                  className={cn(SELECT_CLASS, "w-16 tabular-nums")}
                />
                days
              </label>
              <select
                value={s.bodyMode}
                onChange={(e) =>
                  set(i, { bodyMode: e.target.value as CampaignStepInput["bodyMode"] })
                }
                className={SELECT_CLASS}
              >
                <option value="ai_grounded">AI-grounded</option>
                <option value="template">Template</option>
              </select>
              {/* Channel: email is the live channel; LinkedIn is deferred (SPEC §14). Disabled +
                  never persisted (no channel in CampaignStepInput) — an honest 🔌 placeholder (4.14). */}
              <select
                value="email"
                disabled
                aria-label="Channel"
                title="Steps send by email today; LinkedIn steps are coming"
                className={cn(SELECT_CLASS, "opacity-60")}
              >
                <option value="email">Email</option>
                <option value="linkedin" disabled>
                  LinkedIn (coming)
                </option>
              </select>
            </div>
            <Input
              value={s.subjectTemplate ?? ""}
              onChange={(e) => set(i, { subjectTemplate: e.target.value || null })}
              placeholder="Subject (optional — AI writes one if blank)"
              className="mt-2 h-8"
            />
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          disabled={steps.length >= MAX_STEPS}
        >
          <Plus className="size-3.5" /> Add step
        </Button>
        <Button size="sm" onClick={() => update.mutate(steps)} disabled={update.isPending}>
          Save sequence
        </Button>
      </div>
      <p className={FOOTNOTE}>
        step 1 sends on approval; follow-ups send automatically once autopilot is on. Email is the
        live channel; LinkedIn steps are coming.
      </p>
    </div>
  );
}
