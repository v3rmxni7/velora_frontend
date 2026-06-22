import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Differentiators } from "@/components/marketing/differentiators";
import { Honesty } from "@/components/marketing/honesty";
import { Pricing } from "@/components/marketing/pricing";
import { FinalCta } from "@/components/marketing/final-cta";
import { SiteFooter } from "@/components/marketing/site-footer";

// Public marketing landing (Slice 4.13). Static server component → fast LCP (SPEC §11). HONEST
// positioning per SPEC §1/§11: the wedge is data + deliverability + transparency, not "magic AI".
// NO fabricated testimonials, logos, or results/deliverability guarantees. The page composes client
// section islands (hero + A1b/A1c sections) but stays a server component itself (prerendered static).

export default function Home() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      {/* A1a — the dark hero + nav + real grounded-draft centerpiece. */}
      <Hero />

      {/* A1b — how it works (the real pipeline), the real differentiators, the honesty manifesto. */}
      <HowItWorks />
      <Differentiators />
      <Honesty />

      {/* A1c — pricing (the 3 real tiers), the closing CTA, the footer. */}
      <Pricing />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}
