"use client";

import { Inbox, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// IA per CLAUDE.md: Manage / Engage / Lead discovery / Lead management. Only the two
// groups this vertical uses are wired; the rest land with their phases.
const GROUPS: {
  eyebrow: string;
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}[] = [
  {
    eyebrow: "Lead discovery",
    items: [{ href: "/lead-discovery", label: "Find leads", icon: Search }],
  },
  {
    eyebrow: "Engage",
    items: [{ href: "/engage", label: "Tasks", icon: Inbox }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-14 items-center border-b border-border px-5">
        <Link href="/" className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Velora
        </Link>
      </div>
      <nav className="flex-1 space-y-6 px-3 py-5">
        {GROUPS.map((group) => (
          <div key={group.eyebrow}>
            <div className="px-2 pb-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {group.eyebrow}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-accent font-medium text-accent-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-border px-5 py-3 font-mono text-[11px] text-muted-foreground">
        grounded outreach
      </div>
    </aside>
  );
}