"use client";

import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

// "The product, in the open" — the biggest structural gap vs Artisan/Mynor was that the landing never
// showed the actual app. These are REAL screenshots of the seeded demo workspace (pnpm seed:demo),
// captioned honestly in the mono evidence voice — including that the numbers start empty. Static
// images (no ambient loops), lazy-loaded. Nothing staged or fabricated.

// A framed screenshot with a browser-ish top bar + honest mono caption.
function Shot({
  src,
  caption,
  priority = false,
}: {
  src: string;
  caption: string;
  priority?: boolean;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
      <div className="flex items-center gap-1.5 border-b border-border bg-secondary/40 px-3.5 py-2.5">
        <span className="size-2 rounded-full bg-muted-foreground/25" aria-hidden />
        <span className="size-2 rounded-full bg-muted-foreground/25" aria-hidden />
        <span className="size-2 rounded-full bg-muted-foreground/25" aria-hidden />
      </div>
      <Image
        src={src}
        alt={caption}
        width={1400}
        height={880}
        priority={priority}
        sizes="(min-width: 1024px) 1024px, 100vw"
        className="h-auto w-full"
      />
      <figcaption className="border-t border-border px-4 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

export function ProductShowcase() {
  return (
    <section id="product" className="relative bg-background py-24 lg:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
              The product, in the open
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Real screens, not mockups.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              These are actual screens from a seeded demo workspace — the same app you get on day one.
              The numbers start honestly empty, and fill in only as real work happens.
            </p>
          </Reveal>
        </div>

        {/* The approval queue — the strongest screen — leads, full width. */}
        <Reveal delay={0.16} className="mt-12">
          <Shot
            src="/product/product-tasks.png"
            priority
            caption="Engage — the approval queue. Every draft shows the facts it cited, the ones it verified but didn't use, and a confidence score. Approving queues a dry-run: no real email until go-live."
          />
        </Reveal>

        <Stagger className="mt-6 grid gap-6 md:grid-cols-2" gap={0.1}>
          <StaggerItem>
            <Shot
              src="/product/product-analytics.png"
              caption="Analytics — rates compute from real send + reply events, and stay a labelled empty state (never a fabricated number) until there's something to show."
            />
          </StaggerItem>
          <StaggerItem>
            <Shot
              src="/product/product-compliance.png"
              caption="Compliance — the immutable audit log and suppression are first-class surfaces, not an afterthought."
            />
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
