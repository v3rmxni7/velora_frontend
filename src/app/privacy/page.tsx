import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageHeading, MarketingPageShell } from "@/components/marketing/marketing-page-shell";

export const metadata: Metadata = {
  title: "Privacy · Velora",
  description:
    "What Velora collects, how it's used, who processes it, and what we never do — in plain language.",
};

// Plain-language v1 privacy policy. Honest and specific about processors + practices; explicitly
// framed as a plain-language summary, not a substitute for a formal agreement. No fabricated claims.

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border py-8 last:border-b-0">
      <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <MarketingPageShell>
      <MarketingPageHeading
        eyebrow="Privacy"
        title="What we collect, and what we don't do with it."
        lede="Plain language, no dark patterns. This is a summary of how Velora handles data — written to be read, not to hide behind."
        updated="A plain-language v1 — it will be formalized before broad availability. Questions are welcome any time."
      />

      <div className="mt-4">
        <Section title="What we collect">
          <p>
            <span className="font-medium text-foreground">Account data</span> — your email address and
            the workspace you create.
          </p>
          <p>
            <span className="font-medium text-foreground">Workspace content</span> — the knowledge,
            proof points, campaigns, and settings you add, plus the lead data you import or source
            through connected providers.
          </p>
          <p>
            <span className="font-medium text-foreground">Operational logs</span> — the records needed
            to run and secure the service (sends, verifications, credit usage, audit events).
          </p>
        </Section>

        <Section title="How we use it">
          <p>
            Solely to provide the product: to source and verify leads, to draft grounded messages, to
            send only when you deliberately enable sending, to meter usage, and to keep the service
            secure. We do not use your workspace content to train models.
          </p>
        </Section>

        <Section title="Who processes it">
          <p>Velora is built on a small set of named processors, each doing one job:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Supabase — database, authentication, and per-tenant isolation.</li>
            <li>Railway — the backend API and scheduled jobs.</li>
            <li>Vercel — the web frontend.</li>
            <li>An established LLM provider — grounded drafting.</li>
            <li>Established lead-data, email-verification, and sending providers — sourcing, verification, and delivery.</li>
          </ul>
        </Section>

        <Section title="What we never do">
          <p>We do not sell your data. We do not share it for others&rsquo; advertising.</p>
          <p>
            We do not send email on your behalf until you complete a deliberate go-live step — new
            workspaces are dry-run by default.
          </p>
        </Section>

        <Section title="Your controls">
          <p>
            Your data stays yours: you can request a copy of your workspace data, and closing your
            workspace removes its data — including a full erasure path for account-closure requests.
          </p>
          <p>
            You are responsible for having a lawful basis for the lead data you upload or source, and
            for honoring opt-outs — the product enforces suppression on every send to help.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about how your data is handled are welcome — a public contact address ships
            with broader availability. See also our{" "}
            <Link href="/trust" className="text-primary underline-offset-2 hover:underline">
              trust &amp; security
            </Link>{" "}
            page and{" "}
            <Link href="/terms" className="text-primary underline-offset-2 hover:underline">
              terms
            </Link>
            .
          </p>
        </Section>
      </div>
    </MarketingPageShell>
  );
}
