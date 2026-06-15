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
 * the optimistic stand-in, and the thread list (title/updated_at) + suggested actions refresh.
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
        id: `optimistic-${threadId}-${content.length}`,
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
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(messagesKey(ctx.threadId), ctx.previous);
      toast.error(err instanceof ApiError ? err.message : "Couldn’t send — try again.");
    },
    onSettled: (_data, _err, { threadId }) => {
      qc.invalidateQueries({ queryKey: messagesKey(threadId) });
      qc.invalidateQueries({ queryKey: threadsKey });
      qc.invalidateQueries({ queryKey: suggestedActionsKey });
    },
  });
}
