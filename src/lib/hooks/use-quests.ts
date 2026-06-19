"use client";

import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";

// Onboarding quests (GET /quests). The backend reconciles on read — completion is derived from real
// org state and credits are awarded once — so this is a plain query. It shares the ["credits"] data
// domain conceptually; the credits footer refetches on its own interval / window focus.
export function useQuests() {
  return useQuery({
    queryKey: ["quests"],
    queryFn: api.getQuests,
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 1,
  });
}
