"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronDown, Maximize2, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CopilotChat } from "./copilot-chat";
import { useCopilotDrawer } from "./copilot-drawer-context";
import { ThreadList } from "./thread-list";

// The slide-out copilot drawer. Mounts the SAME CopilotChat as the full-screen /copilot and reads
// the SAME React Query cache, so threads/messages stay in sync across both surfaces. A collapsible
// "Recent chats" disclosure (the full ThreadList) is the compact thread switch; "Full screen ↗"
// links to /copilot. The drawer keeps its own selection — the cached data is shared, the view isn't.
export function CopilotDrawer() {
  const { open, setOpen } = useCopilotDrawer();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/10 duration-150 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background ring-1 ring-foreground/10 duration-150 outline-none data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right">
          {/* Header */}
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
            <span className="flex size-6 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Sparkles className="size-3.5" />
            </span>
            <DialogPrimitive.Title className="font-heading text-base font-semibold text-foreground">
              Ava
            </DialogPrimitive.Title>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/copilot" onClick={() => setOpen(false)} />}
              >
                <Maximize2 className="size-3.5" />
                Full screen
              </Button>
              <DialogPrimitive.Close
                render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}
              >
                <X className="size-4" />
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Thread switch — collapsed by default; expands the full thread list */}
          <div className="shrink-0 border-b border-border px-4 py-2">
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
              aria-expanded={historyOpen}
            >
              <ChevronDown className={cn("size-3 transition-transform", historyOpen && "rotate-180")} />
              Recent chats
            </button>
            {historyOpen && (
              <div className="mt-2 max-h-64">
                <ThreadList
                  selectedId={selectedId}
                  onSelect={(id) => {
                    setSelectedId(id);
                    setHistoryOpen(false);
                  }}
                  onNew={() => {
                    setSelectedId(null);
                    setHistoryOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Shared chat */}
          <CopilotChat threadId={selectedId} onSelectThread={setSelectedId} />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
