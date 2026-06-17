"use client";

import { useQuery } from "@tanstack/react-query";
import { type AnalyticsRangeArg, api, ApiError } from "@/lib/api";

// Analytics hub data (Phase 4 Slice 4.2). Read-only, org-scoped. Keyed by the [from,to] window so
// switching the range refetches. noAuthRetry mirrors the other hooks (don't retry a 401).
const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

const key = (r: AnalyticsRangeArg) => [r.from ?? "d", r.to ?? "d"];

export function useAnalyticsOverview(range: AnalyticsRangeArg) {
  return useQuery({
    queryKey: ["analytics-overview", ...key(range)],
    queryFn: () => api.getAnalyticsOverview(range),
    retry: noAuthRetry,
  });
}

export function useAnalyticsMessaging(range: AnalyticsRangeArg) {
  return useQuery({
    queryKey: ["analytics-messaging", ...key(range)],
    queryFn: () => api.getAnalyticsMessaging(range),
    retry: noAuthRetry,
  });
}

export function useAnalyticsCredits(range: AnalyticsRangeArg) {
  return useQuery({
    queryKey: ["analytics-credits", ...key(range)],
    queryFn: () => api.getAnalyticsCredits(range),
    retry: noAuthRetry,
  });
}
