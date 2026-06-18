"use client";

import {
  Activity,
  AtSign,
  BarChart3,
  Bot,
  Globe,
  Inbox,
  List,
  Megaphone,
  MessageSquare,
  Plug,
  Search,
  Sparkles,
  UserCog,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCopilotDrawer } from "@/components/copilot/copilot-drawer-context";
import { CreditsIndicator } from "@/components/shell/credits-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskCounts } from "@/lib/hooks/use-task-counts";
import { cn } from "@/lib/utils";

// SPEC IA: Manage / Engage / Lead discovery / Lead management. Items whose screen has shipped are
// live links; items not yet built render as a dimmed, non-clickable "soon" row (honest framing of
// the full IA without dead links). Future groups' items are added as each screen ships.
type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
};
const GROUPS: { eyebrow: string; items: NavItem[] }[] = [
  {
    eyebrow: "Manage",
    items: [
      { href: "/manage", label: "Manage Ava", icon: Bot },
      { href: "/campaigns", label: "Campaigns", icon: Megaphone },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/senders", label: "Senders", icon: AtSign },
      { href: "/deliverability", label: "Deliverability", icon: Activity },
      { href: "/connections", label: "Connections", icon: Plug },
      { href: "/team", label: "Team", icon: UserCog },
    ],
  },
  {
    eyebrow: "Engage",
    items: [
      { href: "/engage", label: "Tasks", icon: Inbox },
      { href: "/inbox", label: "Inbox", icon: MessageSquare },
    ],
  },
  {
    eyebrow: "Lead discovery",
    items: [
      { href: "/lead-discovery", label: "Find leads", icon: Search },
      { href: "/signals", label: "Signals", icon: Zap },
      { href: "/website-visitors", label: "Website visitors", icon: Globe },
    ],
  },
  {
    eyebrow: "Lead management",
    items: [
      { href: "/lists", label: "Lists", icon: List },
      { href: "/leads", label: "Leads", icon: Users },
    ],
  },
];

// The Tasks queue count — real data from the backend, set in mono (the evidence layer).
// A rendered 0 is meaningful: it proves the JWT→Bearer→RLS round-trip returned.
function TasksBadge() {
  const counts = useTaskCounts();
  if (counts.isPending) return <Skeleton className="ml-auto h-4 w-6 rounded" />;
  if (counts.isError) return null;
  return (
    <span className="ml-auto rounded border border-border bg-card px-1.5 font-mono text-[11px] tabular-nums text-muted-foreground">
      {counts.data.pending.outbound_approval}
    </span>
  );
}

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  if (item.soon) {
    return (
      <div
        className="flex cursor-default items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground/50"
        aria-disabled
      >
        <item.icon className="size-4" />
        {item.label}
        <span className="ml-auto rounded border border-border px-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/70">
          soon
        </span>
      </div>
    );
  }
  return (
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
      {item.href === "/engage" && <TasksBadge />}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { openDrawer } = useCopilotDrawer();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-tight text-foreground"
        >
          Velora
        </Link>
        <span className="rounded border border-border px-1 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          Beta
        </span>
      </div>
      <nav className="flex-1 space-y-6 overflow-auto px-3 py-5">
        {GROUPS.map((group) => (
          <div key={group.eyebrow}>
            <div className="px-2 pb-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {group.eyebrow}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavRow item={item} active={pathname.startsWith(item.href)} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {/* Chat with Ava — opens the slide-out copilot drawer (the drawer itself has a "Full screen ↗"
          link to /copilot). */}
      <div className="border-t border-border px-3 py-3">
        <button
          type="button"
          onClick={openDrawer}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-sm transition-colors",
            pathname.startsWith("/copilot")
              ? "border-primary/40 bg-accent text-accent-foreground"
              : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent",
          )}
        >
          <Sparkles className="size-4 text-primary" />
          Chat with Ava
        </button>
      </div>
      <CreditsIndicator />
    </aside>
  );
}
