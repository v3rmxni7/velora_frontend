"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

// S1 — productized go-live. Readiness is read-only (any member can see the checklist); the flip +
// pause are owner-only, enforced SERVER-side (the FE gate is UX only, never the security boundary).
export function useGoLiveReadiness() {
  return useQuery({
    queryKey: ["sending-readiness"],
    queryFn: api.getGoLiveReadiness,
    retry: noAuthRetry,
  });
}

function invalidateSending(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["sending-readiness"] });
  qc.invalidateQueries({ queryKey: ["sending-mode"] });
  qc.invalidateQueries({ queryKey: ["deliverability"] });
  qc.invalidateQueries({ queryKey: ["audit-log"] });
}

export function useGoLive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (confirm: string) => api.goLive(confirm),
    onSuccess: (res) => {
      invalidateSending(qc);
      toast.success(res.data.status === "went_live" ? "Live sending is on." : "Already live.");
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError
          ? err.status === 409
            ? "Resolve the readiness checklist first."
            : err.status === 400
              ? "That didn’t match your organization name."
              : err.status === 403
                ? "Only an owner can start live sending."
                : err.message
          : "Couldn’t go live — try again.";
      toast.error(msg);
    },
  });
}

export function usePauseLive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.pauseLive(),
    onSuccess: (res) => {
      invalidateSending(qc);
      toast.success(res.data.status === "paused" ? "Live sending paused." : "Already paused.");
    },
    onError: (err) =>
      toast.error(
        err instanceof ApiError
          ? err.status === 403
            ? "Only an owner can pause live sending."
            : err.message
          : "Couldn’t pause — try again.",
      ),
  });
}
