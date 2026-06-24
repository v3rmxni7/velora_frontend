"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Sticky marketing nav over the dark hero (Mynor craft: unobtrusive at top, condenses to a blurred
// ink bar once scrolled so it stays legible over the light sections below). A "Product" dropdown
// (hover + focus-within, keyboard-safe) anchors to the real sections; the indigo "Start free" CTA
// repeats here (it also lives in the hero + closing band, so a conversion path is always in view).
// Anchors point at real section ids; nothing fabricated.

const PRODUCT_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#demo", label: "Live demo" },
  { href: "#why", label: "Why Velora" },
  { href: "#integrations", label: "Integrations" },
];

// Shared keyboard focus ring — visible on BOTH the dark hero and the blurred ink bar (indigo-400 reads
// on light and dark). Every nav interactive uses it; the global outline-ring/50 was too faint on dark.
const FOCUS = "rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400";

// Below md the desktop links are hidden, so the mobile menu surfaces the same real anchors + Log in.
const MOBILE_LINKS = [...PRODUCT_LINKS, { href: "#pricing", label: "Pricing" }, { href: "#honesty", label: "Honesty" }];

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`group relative px-3 py-1.5 text-sm text-white/70 transition-colors hover:text-white ${FOCUS}`}
    >
      {children}
      <span
        className="pointer-events-none absolute inset-x-3 -bottom-px h-px origin-left scale-x-0 bg-white/50 transition-transform duration-200 ease-out group-hover:scale-x-100"
        aria-hidden
      />
    </Link>
  );
}

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          setMenuOpen(false);
        }
      }}
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled || menuOpen
          ? "border-b border-white/10 bg-[#0b0d12]/80 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-heading text-lg font-semibold tracking-tight text-white">
          Velora
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={(e) => {
              if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          >
            <button
              type="button"
              aria-expanded={open}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm text-white/70 transition-colors hover:text-white ${FOCUS}`}
            >
              Product
              <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} aria-hidden />
            </button>
            {open && (
              <div className="absolute left-0 top-full w-52 rounded-md border border-white/10 bg-[#0b0d12]/95 p-1.5 shadow-xl backdrop-blur-md">
                {PRODUCT_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`block px-2.5 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white ${FOCUS}`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#honesty">Honesty</NavLink>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/login"
            className={`hidden px-3 py-1.5 text-sm text-white/70 transition-colors hover:text-white md:inline-flex ${FOCUS}`}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={`rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-glow-indigo transition-all duration-200 hover:-translate-y-px hover:bg-primary/90 ${FOCUS}`}
          >
            Start free
          </Link>
          {/* Hamburger — mobile only (below md the desktop links are hidden). */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className={`-mr-1 inline-flex size-9 items-center justify-center text-white/80 transition-colors hover:text-white md:hidden ${FOCUS}`}
          >
            {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel — the same real anchors + Log in, surfaced below the bar. */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-[#0b0d12]/95 backdrop-blur-md md:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-6 py-4">
            {MOBILE_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-white ${FOCUS}`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-white ${FOCUS}`}
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
