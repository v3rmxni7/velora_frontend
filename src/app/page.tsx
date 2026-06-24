import { MarketingNav } from "@/components/marketing/marketing-nav";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { Hero } from "@/components/marketing/hero";
import { InvariantStrip } from "@/components/marketing/invariant-strip";
import { LiveDemo } from "@/components/marketing/live-demo";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Differentiators } from "@/components/marketing/differentiators";
import { SignalHub } from "@/components/marketing/signal-hub";
import { Honesty } from "@/components/marketing/honesty";
import { Pricing } from "@/components/marketing/pricing";
import { FinalCta } from "@/components/marketing/final-cta";
import { SiteFooter } from "@/components/marketing/site-footer";

// Public marketing landing — the rebuild (Artisan structure + Mynor craft, in Velora's honest
// identity). Static server component composing client islands. HONEST: no fabricated testimonials,
// logos, or aggregate result stats — the live demo + invariant strip + honesty manifesto + real
// pricing carry the trust load. Built section by section; sections upgrade in later slices.

export default function Home() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <ScrollProgress />
      <MarketingNav />
      {/* S1 — dark hero (floating indigo depth + real grounded-draft centerpiece). */}
      <Hero />
      {/* S1 — honest-invariant strip (replaces fabricated stat-counters). */}
      <InvariantStrip />
      {/* S2 — ★ the live grounded-draft demo (the centerpiece). */}
      <LiveDemo />
      {/* Existing sections — upgraded in later slices. */}
      <HowItWorks />
      <Differentiators />
      {/* S4 — the signal hub (Pulse Beams node-graph, honest fan-IN → one grounded email). */}
      <SignalHub />
      <Honesty />
      <Pricing />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}
