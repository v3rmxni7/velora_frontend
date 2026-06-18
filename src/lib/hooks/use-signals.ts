"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

/** The shared intent-signal catalog (SPEC §3.9) merged with this org's subscription state. */
export function useSignals() {
  return useQuery({ queryKey: ["signals"], queryFn: api.getSignals, retry: noAuthRetry });
}

/** Subscribe a LIVE signal to an intent_signals campaign — leads enroll as the signal fires. */
export function useSubscribeToSignal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ signalId, campaignId }: { signalId: string; campaignId: string }) =>
      api.subscribeToSignal(signalId, campaignId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["signals"] });
      // Honest: subscribing doesn't enroll anyone now — leads arrive as the signal fires over time.
      toast.success("Subscribed", { description: "Leads enroll as this signal fires." });
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t subscribe — try again."),
  });
}

/** Unsubscribe a signal (soft — the link is deactivated; future events stop enrolling). */
export function useUnsubscribeFromSignal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (signalId: string) => api.unsubscribeFromSignal(signalId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["signals"] });
      toast.success("Unsubscribed.");
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t unsubscribe — try again."),
  });
}
