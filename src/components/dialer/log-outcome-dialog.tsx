"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CallOutcome } from "@/lib/api-types";
import { useLogCall } from "@/lib/hooks/use-dialer";

const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const OUTCOMES: { value: CallOutcome; label: string }[] = [
  { value: "connected", label: "Connected" },
  { value: "voicemail", label: "Left voicemail" },
  { value: "no_answer", label: "No answer" },
  { value: "meeting_booked", label: "Meeting booked" },
  { value: "bad_number", label: "Bad number" },
  { value: "other", label: "Other" },
];

export function LogOutcomeDialog({ callId }: { callId: string }) {
  const log = useLogCall();
  const [outcome, setOutcome] = useState<CallOutcome>("connected");
  const [notes, setNotes] = useState("");
  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" size="sm" variant="outline" />}>
        Log outcome
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log the call outcome</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as CallOutcome)}
            className={SELECT_CLASS}
          >
            {OUTCOMES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={3}
            className="w-full rounded-lg border border-input bg-transparent p-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <DialogFooter showCloseButton>
          <DialogClose
            render={<Button type="button" disabled={log.isPending} />}
            onClick={() => log.mutate({ id: callId, outcome, notes: notes.trim() || undefined })}
          >
            Log call
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
