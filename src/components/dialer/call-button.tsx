"use client";

import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

// "Call" = a tel: link to the rep's OWN phone (real, free, no vendor). The agent never dials; an
// in-app softphone is deferred (honest note lives on the page). Disabled when no number is on file.
export function CallButton({ phone }: { phone: string | null }) {
  if (phone) {
    return (
      <a
        href={`tel:${phone}`}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-primary/40 bg-accent px-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/70"
      >
        <Phone className="size-4" />
        Call
      </a>
    );
  }
  return (
    <Button type="button" size="sm" variant="outline" disabled title="No phone on file">
      <Phone className="size-4" />
      No number
    </Button>
  );
}
