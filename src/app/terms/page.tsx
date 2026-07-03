import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageHeading, MarketingPageShell } from "@/components/marketing/marketing-page-shell";

export const metadata: Metadata = {
  title: "Terms · Velora",
  description:
    "The deal: what Velora provides, your responsibilities for compliant outreach, billing, and the honest limits of what we promise.",
};

// Plain-language v1 terms of use. Honest about responsibilities + the no-results-promise stance;
// framed as a plain-language summary, not the final legal agreement. Nothing fabricated.

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border py-8 last:border-b-0">
      <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <MarketingPageShell>
      <MarketingPageHeading
        eyebrow="Terms"
        title="The deal, in plain terms."
        lede="What you can expect from Velora, and what we expect from you. Written to be understood."
        updated="A plain-language v1 — it will be formalized before broad availability."
      />

      <div className="mt-4">
        <Section title="What Velora is">
          <p>
            Velora is an autonomous-outbound tool: it sources and verifies leads, drafts grounded
            messages, and — only once you deliberately enable sending — delivers and follows up through
            the providers you connect. Access is by account, billed per the plan you choose.
          </p>
        </Section>

        <Section title="Your responsibilities">
          <p>
            You are responsible for running compliant outreach. You must have the right to contact the
            people you upload or source, comply with applicable law (including CAN-SPAM, GDPR, and CASL
            where they apply), and honor opt-out requests.
          </p>
          <p>
            You must not use Velora for spam, harassment, or unlawful messaging. The product enforces
            suppression, verification, and volume limits to help — but the responsibility for how you
            use it is yours, and you must not attempt to circumvent those safeguards.
          </p>
        </Section>

        <Section title="Sending is off until you turn it on">
          <p>
            Every workspace starts in dry-run: drafts are produced and queued for your review, and no
            real email is sent. Enabling live sending is a deliberate act you take — and it does not
            change your obligations above.
          </p>
        </Section>

        <Section title="Billing">
          <p>
            AI and data work is metered in credits; sending infrastructure is billed in dollars, per
            your plan. Dry-run activity does not consume send credits. Details and current tiers are on
            the{" "}
            <Link href="/#pricing" className="text-primary underline-offset-2 hover:underline">
              pricing
            </Link>{" "}
            section.
          </p>
        </Section>

        <Section title="No promise of results">
          <p>
            The service is provided as-is. We work to reach the inbox and we show you the real numbers,
            but we do not and cannot guarantee inbox placement, reply rates, or any specific outcome.
            Anyone who promises you those is not being honest.
          </p>
        </Section>

        <Section title="Changes & termination">
          <p>
            You can stop using Velora and close your workspace at any time. We may update these terms
            as the product matures; material changes will be reflected here.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about these terms are welcome — a public contact address ships with broader
            availability. See also our{" "}
            <Link href="/privacy" className="text-primary underline-offset-2 hover:underline">
              privacy
            </Link>{" "}
            and{" "}
            <Link href="/trust" className="text-primary underline-offset-2 hover:underline">
              trust &amp; security
            </Link>{" "}
            pages.
          </p>
        </Section>
      </div>
    </MarketingPageShell>
  );
}
