"use client";

import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";

// Org-scoped deliverability metrics (GET /deliverability). Read-only.
export function useDeliverability() {
  return useQuery({
    queryKey: ["deliverability"],
    queryFn: api.getDeliverability,
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 1,
  });
}