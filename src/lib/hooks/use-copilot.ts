"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { CopilotMessage } from "@/lib/api-types";

const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

export const threadsKey = ["copilot-threads"] as const;
export const messagesKey = (threadId: string) => ["copilot-messages", threadId] as const;
export const suggestedActionsKey = ["copilot-suggested-actions"] as const;
export const actionsKey = (threadId: string) => ["copilot-actions", threadId] as const;

// Monotonic local counter for optimistic message ids. A React key only needs to be unique among
// the rows present at once; this stand-in is replaced by the persisted row (with its real id) on
// the settle-refetch, so any collision-free value works — just don't derive it from the content.
let optimisticSeq = 0;

export function useCopilotThreads() {
  return useQuery({ queryKey: threadsKey, queryFn: api.getCopilotThreads, retry: noAuthRetry });
}

export function useCopilotMessages(threadId: string | null) {
  return useQuery({
    queryKey: messagesKey(threadId ?? "none"),
    queryFn: () => api.getCopilotMessages(threadId as string),
    enabled: !!threadId,
    retry: noAuthRetry,
  });
}

export function useSuggestedActions() {
  return useQuery({
    queryKey: suggestedActionsKey,
    queryFn: api.getSuggestedActions,
    retry: noAuthRetry,
  });
}

export function useCreateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title?: string) => api.createCopilotThread(title),
    onSuccess: () => qc.invalidateQueries({ queryKey: threadsKey }),
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t start a chat — try again."),
  });
}

/**
 * Send a message and run the turn. Optimistically appends the user bubble so it shows instantly;
 * the component renders a real "thinking…" state off `isPending` (no streaming backend). On settle
 * we invalidate the message cache → the persisted user + assistant rows (incl. tool_calls) replace
 * the optimistic stand-in. We also refresh suggested actions and the thread list — the latter
 * matters mainly on the FIRST send (the new thread + its title appear); the backend lists threads
 * by created_at and doesn't bump updated_at on a send, so existing threads don't reorder/retitle.
 */
export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, content }: { threadId: string; content: string }) =>
      api.sendCopilotMessage(threadId, content),
    onMutate: async ({ threadId, content }) => {
      const key = messagesKey(threadId);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<{ data: CopilotMessage[] }>(key);
      const optimistic: CopilotMessage = {
        id: `optimistic-${threadId}-${++optimisticSeq}`,
        organization_id: "",
        thread_id: threadId,
        role: "user",
        content,
        tool_calls: null,
        created_at: new Date().toISOString(),
      };
      qc.setQueryData<{ data: CopilotMessage[] }>(key, (old) => ({
        data: [...(old?.data ?? []), optimistic],
      }));
      return { previous, threadId };
    },
    onError: (err, vars, ctx) => {
      // Roll back unconditionally: a brand-new (lazy-created) thread has no prior snapshot, so a
      // truthy guard would leave its optimistic bubble in the cache — a user message the backend
      // never stored. Reset to the snapshot, or to empty for a fresh thread.
      qc.setQueryData(messagesKey(ctx?.threadId ?? vars.threadId), ctx?.previous ?? { data: [] });
      toast.error(err instanceof ApiError ? err.message : "Couldn’t send — try again.");
    },
    onSettled: (_data, _err, { threadId }) => {
      qc.invalidateQueries({ queryKey: messagesKey(threadId) });
      qc.invalidateQueries({ queryKey: threadsKey });
      qc.invalidateQueries({ queryKey: suggestedActionsKey });
      // A turn may have proposed a write action → refresh the thread's action cards.
      qc.invalidateQueries({ queryKey: actionsKey(threadId) });
    },
  });
}

// 4.11 — the thread's agentic actions (drives the in-chat confirm/cancel cards + their live status).
export function useThreadActions(threadId: string | null) {
  return useQuery({
    queryKey: actionsKey(threadId ?? "none"),
    queryFn: () => api.getCopilotActions(threadId as string),
    enabled: !!threadId,
    retry: noAuthRetry,
  });
}

// Confirm/cancel a proposed action. The confirm executor is role-gated server-side; a 403 surfaces as
// an honest "needs an owner or admin" toast. Confirm refreshes the action cards AND the message
// transcript (it appends a deterministic confirmation message); cancel refreshes only the cards.
export function useConfirmAction(threadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.confirmCopilotAction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: actionsKey(threadId) });
      qc.invalidateQueries({ queryKey: messagesKey(threadId) });
    },
    onError: (err) =>
      toast.error(
        err instanceof ApiError && err.status === 403
          ? "That action needs an owner or admin."
          : err instanceof ApiError
            ? err.message
            : "Couldn’t confirm — try again.",
      ),
  });
}

export function useCancelAction(threadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.cancelCopilotAction(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: actionsKey(threadId) }),
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t cancel — try again."),
  });
}
