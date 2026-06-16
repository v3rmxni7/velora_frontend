"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

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
