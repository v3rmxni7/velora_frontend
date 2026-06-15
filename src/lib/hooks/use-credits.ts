"use client";

import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";

// Org-scoped credit balance (GET /credits) for the persistent footer indicator.
export function useCredits() {
  return useQuery({
    queryKey: ["credits"],
    queryFn: api.getCredits,
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 1,
  });
}
