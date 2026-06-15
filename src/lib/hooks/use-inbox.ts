"use client";

import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import type { ThreadStatus } from "@/lib/api-types";

const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

// Inbox is READ-ONLY in 2.6: list threads (optionally filtered by status), open one with its
// messages. Replies/bounces/unsubscribes land here via the Smartlead webhook.
export function useInbox(status?: ThreadStatus) {
  return useQuery({
    queryKey: ["inbox", status ?? "all"],
    queryFn: () => api.getInbox(status),
    retry: noAuthRetry,
  });
}

export function useThread(id: string | null) {
  return useQuery({
    queryKey: ["thread", id],
    queryFn: () => api.getThread(id as string),
    enabled: !!id,
    retry: noAuthRetry,
  });
}