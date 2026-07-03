"use client";

import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileNav } from "@/components/shell/mobile-nav";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

// Account chip: the signed-in email (from the cookie-backed session) + sign out.
function UserMenu() {
  const [email, setEmail] = useState<string | null>(null);

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

  return (
    <div className="flex items-center gap-2">
      {email && (
        <span className="hidden max-w-[40vw] truncate rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs text-muted-foreground sm:inline-block">
          {email}
        </span>
      )}
      <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out">
        <LogOut className="size-4" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
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
      <UserMenu />
    </header>
  );
}