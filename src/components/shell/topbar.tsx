"use client";

import { CreditCard, LogOut, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileNav } from "@/components/shell/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// Account menu: avatar (email initial) + a click-to-open dropdown with the signed-in email and real
// destinations (Billing, Team) + sign out. Controlled with local state + a click-away backdrop (a
// plain button, NOT a Base UI trigger — avoids the useId hydration mismatch we hit in MobileNav).
function UserMenu() {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user.email ?? null);
    });
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut(); // clears the auth cookies
    window.location.assign("/login");
  }

  const initial = (email?.[0] ?? "?").toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-md border border-border bg-card py-1 pl-1 pr-2 transition-colors hover:bg-accent/50",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-primary font-mono text-[11px] font-medium text-primary-foreground">
          {initial}
        </span>
        <span className="hidden max-w-[28vw] truncate font-mono text-xs text-muted-foreground sm:inline-block">
          {email ?? "account"}
        </span>
      </button>

      {open && (
        <>
          {/* click-away */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-card shadow-elevated">
            <div className="border-b border-border px-3 py-2.5">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Signed in</p>
              <p className="mt-0.5 truncate text-sm text-foreground">{email ?? "—"}</p>
            </div>
            <div className="py-1">
              <Link
                href="/billing"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent/50"
              >
                <CreditCard className="size-4 text-muted-foreground" /> Billing
              </Link>
              <Link
                href="/team"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent/50"
              >
                <Users className="size-4 text-muted-foreground" /> Team
              </Link>
            </div>
            <div className="border-t border-border py-1">
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent/50"
              >
                <LogOut className="size-4 text-muted-foreground" /> Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function Topbar({ title }: { title?: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4 md:px-6">
      <MobileNav />
      <h1 className="min-w-0 flex-1 truncate font-heading text-base font-semibold text-foreground">
        {title ?? ""}
      </h1>
      {/* Persistent primary action — links to the real campaign builder (no new wiring). */}
      <Link href="/campaigns" className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>
        <Plus className="size-4" />
        New campaign
      </Link>
      <UserMenu />
    </header>
  );
}
