"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Shared analytics primitives + the honest-empty discipline. THREE distinct renderings:
//   Stat        — a REAL count (a genuine 0 is data): solid card + IBM Plex Mono number.
//   NotYet      — "not measurable yet" / "feature not connected": a dashed muted card that reads
//                 clearly differently from a 0, so a reviewer is never misled.
//   TrendChart  — REAL by-day series only (never a synthesized line).
export const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
export const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";
export const CHIP =
  "rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-md border border-border bg-card p-5", className)}>{children}</div>
  );
}

/** A REAL metric. `value` is rendered verbatim (a 0 looks like data). `hint` is an optional unit/footnote. */
export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <div className={EYEBROW}>{label}</div>
      <div className="mt-2 font-mono text-2xl tabular-nums text-foreground">{value}</div>
      {hint ? <p className={`${FOOTNOTE} mt-1`}>{hint}</p> : null}
    </Card>
  );
}

const NOT_YET_COPY: Record<string, string> = {
  sends: "populate after your first real sends",
  meetings: "available once meeting booking is connected",
  connections: "available once a LinkedIn channel is connected",
  dialer: "available once the dialer is in use",
  website_visitors: "activates when a resolution provider is connected",
};

/**
 * The honest-empty card. `reason` picks the explanation: a send-derived metric not yet measurable
 * ("sends"), or a capability not built yet ("meetings"/"connections"/"dialer"). Dashed + muted, so
 * it can never be mistaken for a genuine 0.
 */
export function NotYet({
  label,
  reason,
}: {
  label: string;
  reason: keyof typeof NOT_YET_COPY;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-card p-5 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={FOOTNOTE}>{NOT_YET_COPY[reason]}</p>
    </div>
  );
}

/** A rate card: shows the real percentage when measurable (realSends > 0), else the honest-empty state. */
export function RateOrEmpty({
  label,
  numerator,
  denominator,
}: {
  label: string;
  numerator: number;
  denominator: number;
}) {
  if (denominator <= 0) return <NotYet label={label} reason="sends" />;
  return <Stat label={label} value={`${Math.round((numerator / denominator) * 100)}%`} hint={`of ${denominator} real sends`} />;
}

const COLORS: Record<string, string> = {
  indigo: "#4F46E5",
  slate: "#9CA3AF",
  emerald: "#10B981",
};

/** A minimal area chart over a REAL by-day series. `lines` names the numeric keys to plot. */
export function TrendChart({
  data,
  lines,
}: {
  data: Record<string, string | number>[];
  lines: { key: string; label: string; color: keyof typeof COLORS }[];
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            {lines.map((l) => (
              <linearGradient key={l.key} id={`g-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS[l.color]} stopOpacity={0.25} />
                <stop offset="100%" stopColor={COLORS[l.color]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => d.slice(5)}
            tick={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)", fill: "#9CA3AF" }}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            width={36}
            tick={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)", fill: "#9CA3AF" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 6,
              border: "1px solid #E5E7EB",
              fontSize: 12,
              fontFamily: "var(--font-mono, monospace)",
            }}
          />
          {lines.map((l) => (
            <Area
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.label}
              stroke={COLORS[l.color]}
              fill={`url(#g-${l.key})`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---- CSV export (from data already in hand — no recomputation, no backend route) ----
export function toCsv(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}

export function ExportButton({
  filename,
  rows,
}: {
  filename: string;
  rows: Record<string, string | number>[];
}) {
  const onClick = () => {
    const csv = toCsv(rows);
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={rows.length === 0}>
      Export CSV
    </Button>
  );
}
