"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { Task } from "@/lib/api-types";

const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

export function useAutonomy() {
  return useQuery({ queryKey: ["autonomy"], queryFn: api.getAutonomy, retry: noAuthRetry });
}

export function useAutonomyEvents(opts: { limit?: number } = {}) {
  return useQuery({
    queryKey: ["autonomy-events", opts.limit ?? "all"],
    queryFn: () => api.getAutonomyEvents(opts),
    retry: noAuthRetry,
  });
}

// The one-click kill switch (off-direction only). On success the posture + audit refresh so the
// UI reflects the pause + the new auto_pause row.
export function usePauseAutonomy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.pauseAutonomy(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["autonomy"] });
      qc.invalidateQueries({ queryKey: ["autonomy-events"] });
      toast.success("Autonomy paused.");
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t pause — try again."),
  });
}

// ---- Reply drafts (the reply_approval queue surfaced in the Autonomous-replies tab) ----

export function useReplyDrafts() {
  return useQuery({
    queryKey: ["reply-drafts"],
    queryFn: () => api.getTasks({ type: "reply_approval", status: "pending" }),
    retry: noAuthRetry,
  });
}

// Approve/Reject a reply draft. Optimistically removes it from the pending list (approving sends
// Ava's reply via the backend chokepoint — dry-run until go-live; rejecting discards it).
function useReplyDraftTransition(action: (id: string) => Promise<unknown>, verb: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: action,
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["reply-drafts"] });
      const previous = qc.getQueryData<{ data: Task[] }>(["reply-drafts"]);
      qc.setQueryData<{ data: Task[] }>(["reply-drafts"], (old) =>
        old ? { data: old.data.filter((t) => t.id !== id) } : old,
      );
      return { previous };
    },
    onError: (err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(["reply-drafts"], ctx.previous);
      toast.error(err instanceof ApiError ? err.message : `Couldn’t ${verb} — try again.`);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["reply-drafts"] }),
  });
}

export function useApproveReplyDraft() {
  return useReplyDraftTransition((id) => api.approveTask(id), "approve");
}
export function useRejectReplyDraft() {
  return useReplyDraftTransition((id) => api.rejectTask(id), "reject");
}
