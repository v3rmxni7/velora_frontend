"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { SidebarBody } from "@/components/shell/sidebar";

// Mobile app navigation — the desktop <aside> is hidden below md, so this off-canvas drawer takes
// over. Reuses the exact Base UI Dialog pattern (+ animation classes) as the copilot drawer, sliding
// in from the LEFT, and mounts the SAME SidebarBody so the nav never diverges between breakpoints.
// The hamburger lives in the Topbar (md:hidden), left of the page title.
export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      {/* A plain button (not DialogPrimitive.Trigger) — the drawer is opened via controlled state,
          mirroring the copilot drawer. The Trigger part calls useId internally, which is not
          SSR-stable in this app shell (→ a hydration id mismatch); a plain button avoids it. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="-ml-1 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
      >
        <Menu className="size-5" />
      </button>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/20 duration-150 outline-none data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0 md:hidden" />
        <DialogPrimitive.Popup className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82vw] flex-col bg-sidebar ring-1 ring-foreground/10 duration-150 outline-none data-closed:animate-out data-closed:slide-out-to-left data-open:animate-in data-open:slide-in-from-left md:hidden">
          <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
          <DialogPrimitive.Close
            aria-label="Close navigation"
            className="absolute right-2.5 top-4 z-10 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
          <SidebarBody avaUid="avaMobileNav" onNavigate={() => setOpen(false)} />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
