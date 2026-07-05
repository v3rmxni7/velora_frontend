"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { Task } from "@/lib/api-types";

type TasksData = { data: Task[] };

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => api.getTasks({ type: "outbound_approval" }),
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 1,
  });
}

// Generate is a MUTATION running the real Researcher→Writer pipeline (~10s, real spend).
// The sync route runs the LLM before the dedupe-upsert, so re-fires re-spend — the UI
// guards (single-flight, View-draft replacement) live in the saved-leads table.
export function useGenerateDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leadId: string) => api.generateDraftSync({ leadType: "person", leadId }),
    onSuccess: ({ data: task }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Draft created", {
        action: {
          label: "View in Tasks",
          onClick: () => window.location.assign(`/engage?new=${task.id}`),
        },
      });
    },
    onError: (err) => {
      // Graceful, honest surface for the backend's 503 ai_unavailable (LLM exhausted / provider
      // outage — audit F-RT2): a clear "temporarily unavailable", never a raw/confusing error.
      if (err instanceof ApiError && (err.status === 503 || err.code === "ai_unavailable")) {
        toast.error("AI drafting is temporarily unavailable — please try again shortly.");
        return;
      }
      toast.error(err instanceof ApiError ? err.message : "Draft generation failed.");
    },
  });
}

// A send outcome that means "approved, but the email did NOT go out" — surface it honestly so an
// approval that silently didn't send (out of credits, campaign/sender paused, no sender, capped)
// isn't mistaken for a successful send. dry_run/queued = it went out → no warning.
const NOT_SENT_MESSAGE: Record<string, string> = {
  insufficient_credit: "Approved, but not sent — insufficient credits. Top up to send.",
  sender_unassigned: "Approved, but not sent — assign a sender to this campaign first.",
  sender_paused: "Approved, but not sent — the assigned sender is paused.",
  campaign_paused: "Approved, but not sent — the campaign is paused.",
  rate_limited: "Approved, but not sent yet — daily send cap reached; it goes out next window.",
  suppressed: "Approved, but not sent — the recipient is on your suppression list.",
  verification_required: "Approved, but not sent — the email couldn't be verified.",
  error: "Approved, but the send hit an error — it'll be retried.",
};

// Optimistic status transition shared by approve/reject: flip the card immediately,
// roll back on error, then re-sync tasks + the sidebar badge.
function useTaskTransition(
  action: (id: string) => Promise<unknown>,
  status: "approved" | "rejected",
  onResult?: (result: unknown) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<TasksData>(["tasks"]);
      queryClient.setQueryData<TasksData>(["tasks"], (old) =>
        old
          ? { data: old.data.map((t) => (t.id === id ? { ...t, status } : t)) }
          : old,
      );
      return { previous };
    },
    onSuccess: (result) => onResult?.(result),
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(["tasks"], context.previous);
      toast.error(`Could not ${status === "approved" ? "approve" : "reject"} — try again.`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useApproveTask() {
  return useTaskTransition((id) => api.approveTask(id), "approved", (result) => {
    const send = (result as { send?: string } | undefined)?.send;
    if (send && NOT_SENT_MESSAGE[send]) toast.warning(NOT_SENT_MESSAGE[send]);
  });
}

export function useRejectTask() {
  return useTaskTransition((id) => api.rejectTask(id), "rejected");
}