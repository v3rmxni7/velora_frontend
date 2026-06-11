"use client";

import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";

// First live hook against the backend: GET /tasks/counts via the Bearer-attaching client.
export function useTaskCounts() {
  return useQuery({
    queryKey: ["tasks", "counts"],
    queryFn: api.getTaskCounts,
    // Don't retry auth failures — api.ts already redirects to /login on 401.
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 1,
  });
}