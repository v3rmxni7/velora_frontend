import type { Metadata } from "next";
import { MarketingPageHeading, MarketingPageShell } from "@/components/marketing/marketing-page-shell";

export const metadata: Metadata = {
  title: "Changelog · Velora",
  description: "What we've shipped, with real dates. Built in the open — features only, no metrics.",
};

// Changelog — the honest proof-of-velocity substitute (we have no logos/testimonials to show, but the
// ship history is real). Entries are real, dated milestones from the actual build; features only, no
// fabricated metrics. Keep newest-first; add an entry when something real ships.
const ENTRIES: { date: string; title: string; items: string[] }[] = [
  {
    date: "Jul 2026",
    title: "Trust surface, real pricing, and a mobile app",
    items: [
      "Trust & security, privacy, and terms pages — the architecture stated plainly.",
      "Pricing became a real decision surface: what every tier includes, plus an honest FAQ.",
      "The dashboard works on phones — an off-canvas nav and full-width screens.",
      "A marketing craft pass across the hero, the signal hub, and the capability orbit.",
    ],
  },
  {
    date: "Jul 2026",
    title: "Meet Ava — an honest, non-human mascot",
    items: [
      "Ava got an illustrated instrument-being mascot (deliberately not a fabricated person).",
      "Anchored across the landing: the capability hub, a Meet Ava moment, and the hero.",
      "Reduced-motion-safe throughout — it holds still when you ask it to.",
    ],
  },
  {
    date: "Jun 2026",
    title: "Lead sourcing + spend guardrails",
    items: [
      "Honest spend-guard states on lead search (clear limits, never a silent charge).",
      "Team invites reflect the shipped accept-invite flow.",
    ],
  },
  {
    date: "Jun 2026",
    title: "Dashboard visual overhaul",
    items: [
      "A depth + rhythm pass across the shell, Manage, Analytics, Campaigns, Engage, and discovery.",
      "Data, logic, and the honest-empty states were provably untouched — presentation only.",
    ],
  },
  {
    date: "Jun 2026",
    title: "Accessibility hardening",
    items: [
      "WCAG-AA contrast on the dark bands; visible keyboard focus everywhere.",
      "A real mobile nav on the landing, and SSR-safe reduced motion that holds still on request.",
    ],
  },
  {
    date: "Jun 2026",
    title: "The landing, rebuilt",
    items: [
      "A live grounded-draft demo as the centerpiece — watch the pipeline drop the fact it can't verify.",
      "The honesty manifesto, the signal hub, and the three real pricing tiers.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <MarketingPageShell>
      <MarketingPageHeading
        eyebrow="Changelog"
        title="Built in the open."
        lede="What we've shipped, with real dates — features only, no vanity metrics. If it's here, it's live."
      />

      <div className="mt-10 space-y-10">
        {ENTRIES.map((e, i) => (
          <div
            key={`${e.date}-${e.title}`}
            className="grid gap-3 border-b border-border pb-10 last:border-b-0 sm:grid-cols-[140px_1fr] sm:gap-8"
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary sm:pt-1">
              {e.date}
              {i === 0 ? <span className="ml-2 text-muted-foreground">· latest</span> : null}
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground">{e.title}</h2>
              <ul className="mt-3 space-y-2">
                {e.items.map((it) => (
                  <li
                    key={it}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </MarketingPageShell>
  );
}
