"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { CallOutcome } from "@/lib/api-types";

const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

export function useDialerQueue(tab: "ready" | "upcoming" | "log") {
  return useQuery({
    queryKey: ["dialer", tab],
    queryFn: () => api.getDialerQueue(tab),
    retry: noAuthRetry,
  });
}

export function useCallBrief(id: string | null) {
  return useQuery({
    queryKey: ["dialer-brief", id],
    queryFn: () => api.getCallBrief(id as string),
    enabled: !!id,
    retry: noAuthRetry,
  });
}

export function useAddToQueue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      leadType: "person" | "company" | "local_business";
      leadId: string;
      phone?: string;
      scheduledAt?: string;
    }) => api.addToQueue(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dialer"] });
      toast.success("Added to the call queue.");
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t add to the queue — try again."),
  });
}

export function useSkipCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.skipCall(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dialer"] }),
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t skip — try again."),
  });
}

export function useLogCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, outcome, notes }: { id: string; outcome: CallOutcome; notes?: string }) =>
      api.logCall(id, outcome, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dialer"] });
      toast.success("Call logged.");
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t log the call — try again."),
  });
}
