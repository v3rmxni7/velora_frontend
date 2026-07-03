"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CampaignVariantInput, CampaignVariantRow } from "@/lib/api-types";
import { useUpdateCampaignVariants } from "@/lib/hooks/use-campaigns";

const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";
const MAX = 4;
const DEFAULT_LABELS = ["A", "B", "C", "D"];
const toInput = (v: CampaignVariantRow): CampaignVariantInput => ({ label: v.label, angle: v.angle });

/**
 * A/Z variants (Slice 4.4): author 1–4 message variants — each a steering ANGLE (not copy). Leads
 * are split evenly across them; the winner emerges from real replies (after go-live), never
 * pre-computed. Editable only while the campaign is a draft (the cohort anchor locks at launch).
 */
export function VariantEditor({
  campaignId,
  variants: initial,
  editable,
}: {
  campaignId: string;
  variants: CampaignVariantRow[];
  editable: boolean;
}) {
  const sorted = [...initial].sort((a, b) => a.label.localeCompare(b.label));
  const update = useUpdateCampaignVariants(campaignId);
  const [variants, setVariants] = useState<CampaignVariantInput[]>(() => sorted.map(toInput));

  if (!editable) {
    if (sorted.length === 0) {
      return <p className={FOOTNOTE}>No A/Z variants — Ava writes one angle for everyone.</p>;
    }
    return (
      <div>
        <ul className="space-y-2">
          {sorted.map((v) => (
            <li key={v.id} className="rounded-md border border-border bg-card px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  {v.label}
                </span>
                <span className="text-sm text-foreground">{v.angle}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className={`${FOOTNOTE} mt-1`}>variants locked after launch</p>
      </div>
    );
  }

  const set = (i: number, patch: Partial<CampaignVariantInput>) =>
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const remove = (i: number) => setVariants((prev) => prev.filter((_, idx) => idx !== i));
  const add = () =>
    setVariants((prev) => {
      if (prev.length >= MAX) return prev;
      const used = new Set(prev.map((v) => v.label));
      const label = DEFAULT_LABELS.find((l) => !used.has(l)) ?? `V${prev.length + 1}`;
      return [...prev, { label, angle: "" }];
    });
  const canSave =
    variants.length >= 1 &&
    variants.length <= MAX &&
    variants.every((v) => v.label.trim() && v.angle.trim());

  return (
    <div className="space-y-3">
      {variants.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No A/Z test yet — add 2+ variants to split this campaign’s angle and compare.
        </p>
      ) : (
        <ul className="space-y-2">
          {variants.map((v, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: positional rows edited locally before save.
            <li key={i} className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={v.label}
                  onChange={(e) => set(i, { label: e.target.value })}
                  placeholder="Label (A)"
                  className="h-8 w-20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(i)}
                  aria-label="Remove variant"
                  className="ml-auto"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              <Input
                value={v.angle}
                onChange={(e) => set(i, { angle: e.target.value })}
                placeholder="Angle — e.g. lead with the pain point (steers Ava, never sent verbatim)"
                className="mt-2 h-8"
              />
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          disabled={variants.length >= MAX}
        >
          <Plus className="size-3.5" /> Add variant
        </Button>
        <Button size="sm" onClick={() => update.mutate(variants)} disabled={!canSave || update.isPending}>
          Save variants
        </Button>
      </div>
      <p className={FOOTNOTE}>
        leads are split evenly across variants; the winner emerges from real replies after go-live
      </p>
    </div>
  );
}
