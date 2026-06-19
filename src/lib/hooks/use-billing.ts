"use client";

import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";

// Billing (GET /billing) — current plan + tiers + real balance + honest top-up state.
export function useBilling() {
  return useQuery({
    queryKey: ["billing"],
    queryFn: api.getBilling,
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 1,
  });
}
