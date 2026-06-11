"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { PersonMatch } from "@/lib/api-types";

// Search is a MUTATION on purpose: it's a POST that runs a real LLM (slow, costs money).
// A query would silently re-spend on mount/focus/stale refetches; a mutation fires only
// on explicit submit and keeps its results until the next search.
export function useSearchLeads() {
  return useMutation({
    mutationFn: (query: string) => api.searchLeads({ entityType: "person", query }),
  });
}

// Two-call save: create the list (entityType 'person' — matches the matches by
// construction), then add the selected search results verbatim. If adding fails after
// the list was created, best-effort rollback so no orphan empty lists linger.
export function useSaveToList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, matches }: { name: string; matches: PersonMatch[] }) => {
      const { data: list } = await api.createList({ name, entityType: "person" });
      try {
        const { added } = await api.addListMembers(list.id, matches);
        return { listName: list.name, added };
      } catch (err) {
        await api.deleteList(list.id).catch(() => {});
        throw err;
      }
    },
    onSuccess: ({ listName, added }) => {
      toast.success(`Saved ${added} lead${added === 1 ? "" : "s"} to “${listName}”`);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Saving failed — try again.");
    },
  });
}

export function useLeads() {
  return useQuery({
    queryKey: ["leads", "person"],
    queryFn: () => api.getLeads("person"),
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 1,
  });
}