import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageHeading, MarketingPageShell } from "@/components/marketing/marketing-page-shell";

export const metadata: Metadata = {
  title: "Trust & security · Velora",
  description:
    "How Velora is safe by construction: per-tenant isolation, a two-flag send gate, fail-closed verification, suppression, an immutable audit log — and an honest account of what we don't have yet.",
};

// Trust page — the honest wedge. We can't show SOC 2 badges we don't have; instead we show the
// architecture itself, each guarantee paired with WHERE it's enforced, plus a plain "what we don't
// have yet" section. Every claim here is true of the shipped system (see the go-live runbook + the
// RLS/two-flag/audit migrations). No fabricated certifications, customers, or metrics.

const GUARANTEES: { title: string; where: string; body: string }[] = [
  {
    title: "Per-tenant isolation",
    where: "in the database schema",
    body: "Every table carries PostgreSQL Row-Level Security from its first migration. A workspace can only ever read or write its own rows — isolation is enforced by the database on every query, not by application code we could forget to call.",
  },
  {
    title: "Dry-run by default — a two-flag send gate",
    where: "in the send path",
    body: "A new workspace sends nothing. A real email leaves only when two separate flags are deliberately flipped by a privileged operator; every other combination is refused at the single send chokepoint. A logged-in user — or the copilot — simply cannot turn sending on. Until then, every approved send is recorded as a dry-run.",
  },
  {
    title: "Verification, fail-closed",
    where: "before every send",
    body: "Each address is verified before it can receive anything. If verification is unavailable or an address is invalid, the send does not happen — the gate fails closed rather than guessing.",
  },
  {
    title: "Suppression honored on every send",
    where: "at the chokepoint",
    body: "A reply, bounce, unsubscribe, or spam complaint adds the person to your suppression list, and suppression is re-checked at the moment of sending. A reply also halts the sequence instantly — the agent never talks over a human.",
  },
  {
    title: "An immutable audit log",
    where: "for every consequential action",
    body: "Approvals, sends, suppressions, and configuration changes are recorded to an append-only audit trail scoped to your workspace, so there is always an honest record of what happened and when.",
  },
  {
    title: "Volume caps + anomaly auto-pause",
    where: "in the scheduler",
    body: "Per-workspace and global daily send ceilings are enforced independently of your provider's own caps, and a scheduled monitor auto-pauses a workspace's autonomy the moment bounce or complaint rates breach conservative thresholds.",
  },
  {
    title: "Email authentication",
    where: "on your sending domain",
    body: "SPF and DMARC are verified for your sending domain. DKIM is reported honestly — shown as unknown rather than a fabricated pass when we can't confirm the selector. We never claim guaranteed inbox placement.",
  },
  {
    title: "Your data, and who processes it",
    where: "bring-your-own-key",
    body: "You provide the source data and the provider keys. Velora runs on Supabase (database + auth), Railway (backend), and Vercel (frontend); drafting uses the LLM provider whose key you supply; sourcing, verification, and sending use the data/email providers you connect. We do not sell your data, and no message is sent without your deliberate go-live.",
  },
];

function Guarantee({ title, where, body }: { title: string; where: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">{where}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

export default function TrustPage() {
  return (
    <MarketingPageShell>
      <MarketingPageHeading
        eyebrow="Trust & security"
        title="Safe by construction, honest by default."
        lede="Our whole product is candor, so here's the security story without the marketing: the guarantees below are enforced in the system itself — and there's an honest account of what we don't have yet."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {GUARANTEES.map((g) => (
          <Guarantee key={g.title} {...g} />
        ))}
      </div>

      {/* The honest counterweight — the differentiator IS saying this plainly. */}
      <div className="mt-10 rounded-lg border border-amber-300/60 bg-amber-50 p-6 dark:border-amber-900/40 dark:bg-amber-950/20">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
          What we don&rsquo;t have yet
        </p>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/80">
          <li>
            <span className="font-medium text-foreground">No third-party security audit yet.</span> We
            have no SOC 2 or ISO 27001 report — we&rsquo;re early, and we&rsquo;d rather say so than
            imply a certification we haven&rsquo;t earned. The architecture above is real; an external
            attestation of it is future work.
          </li>
          <li>
            <span className="font-medium text-foreground">Some integrations are honestly off.</span>{" "}
            CRM sync and website-visitor de-anonymization are wired as seams but report
            &ldquo;not connected&rdquo; until you supply the credentials — never a fake success.
          </li>
          <li>
            <span className="font-medium text-foreground">We never promise results.</span> Inbox
            placement, reply rates, and deliverability are earned over time; we show you the real
            numbers, and leave them honestly empty until there&rsquo;s something real to show.
          </li>
        </ul>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow-indigo transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
        >
          Start free — dry-run by default
        </Link>
        <Link
          href="/#honesty"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent"
        >
          Read the honesty stance
        </Link>
      </div>
    </MarketingPageShell>
  );
}
