"use client";

import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import type { CopilotToolCall } from "@/lib/api-types";
import { cn } from "@/lib/utils";

// The evidence piece — "here's exactly what I looked up". Rendered from the REAL stored tool_calls
// on an assistant turn (never invented). Chip + per-tool one-line summary + a collapsible raw
// result, matching the grounded-draft receipt language (mono = the evidence layer).

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em]";

/** Humanized label for the chip (the four read-only copilot tools). */
const TOOL_LABEL: Record<string, string> = {
  suggest_icp: "ICP suggestions",
  summarize_kb: "knowledge base",
  list_leads: "leads",
  list_lists: "lists",
};

const ENTITY_NOUN: Record<string, [string, string]> = {
  person: ["person", "people"],
  company: ["company", "companies"],
  local_business: ["local business", "local businesses"],
};

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function arrLen(v: unknown): number {
  return Array.isArray(v) ? v.length : 0;
}

/** A one-line, honest summary derived from the tool's real result shape. */
function summarize(call: CopilotToolCall): string {
  const r = call.result;
  if (r && typeof r === "object" && "error" in r) return "lookup error";
  const o = (r ?? {}) as Record<string, unknown>;
  switch (call.name) {
    case "list_leads": {
      const entity = typeof o.entityType === "string" ? o.entityType : "person";
      const [one, many] = ENTITY_NOUN[entity] ?? ["row", "rows"];
      return plural(arrLen(o.rows), one, many);
    }
    case "list_lists":
      return plural(arrLen(o.lists), "list", "lists");
    case "suggest_icp":
      return plural(arrLen(o.suggestions), "ICP suggestion", "ICP suggestions");
    case "summarize_kb":
      return `${arrLen(o.coachingPoints)} coaching · ${arrLen(o.proofItems)} proof · ${arrLen(o.documents)} docs`;
    default:
      return "lookup complete";
  }
}

export function ToolReceipt({ call }: { call: CopilotToolCall }) {
  const [open, setOpen] = useState(false);
  const isError = !!(call.result && typeof call.result === "object" && "error" in call.result);

  return (
    <div className="mt-2 rounded-md border border-border bg-secondary/40">
      <div className="flex items-center gap-2 px-2.5 py-1.5">
        <Search className="size-3 shrink-0 text-primary" />
        <span className={cn(EYEBROW, isError ? "text-destructive" : "text-primary")}>
          looked up · {TOOL_LABEL[call.name] ?? call.name}
        </span>
        <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">
          {summarize(call)}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1 border-t border-border/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
        aria-expanded={open}
      >
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
        {open ? "hide result" : "view result"}
      </button>
      {open && (
        <pre className="max-h-64 overflow-auto border-t border-border/60 bg-card px-2.5 py-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
          {JSON.stringify(call.result, null, 2)}
        </pre>
      )}
    </div>
  );
}
