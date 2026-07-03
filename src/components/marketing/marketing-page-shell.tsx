import Link from "next/link";
import { SiteFooter } from "./site-footer";

// Chrome for the standalone marketing content pages (/privacy, /terms, /trust, /changelog). The
// landing's MarketingNav is dark-hero-specific (transparent→ink on scroll, white text, anchor links
// into landing sections) and would break over a light content page — so these pages use a simple,
// always-solid ink header (wordmark home + the persistent conversion path) and reuse the real footer.
function PageHeader() {
  const FOCUS =
    "rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400";
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0d12]/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
        <Link
          href="/"
          className={`font-heading text-lg font-semibold tracking-tight text-white ${FOCUS}`}
        >
          Velora
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={`hidden px-3 py-1.5 text-sm text-white/70 transition-colors hover:text-white sm:inline-flex ${FOCUS}`}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={`rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-glow-indigo transition-all duration-200 hover:-translate-y-px active:translate-y-0 hover:bg-primary/90 ${FOCUS}`}
          >
            Start free
          </Link>
        </div>
      </nav>
    </header>
  );
}

// A page title block in the marketing voice — mono eyebrow + Bricolage headline + lede.
export function MarketingPageHeading({
  eyebrow,
  title,
  lede,
  updated,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  updated?: string;
}) {
  return (
    <div className="border-b border-border pb-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      {lede ? (
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{lede}</p>
      ) : null}
      {updated ? (
        <p className="mt-4 font-mono text-[11px] text-muted-foreground">{updated}</p>
      ) : null}
    </div>
  );
}

export function MarketingPageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <PageHeader />
      <div className="mx-auto max-w-4xl px-6 py-14 lg:py-20">{children}</div>
      <SiteFooter />
    </main>
  );
}
