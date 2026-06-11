"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { Task } from "@/lib/api-types";

type TasksData = { data: Task[] };

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => api.getTasks({ type: "outbound_approval" }),
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 1,
  });
}

// Generate is a MUTATION running the real Researcher→Writer pipeline (~10s, real spend).
// The sync route runs the LLM before the dedupe-upsert, so re-fires re-spend — the UI
// guards (single-flight, View-draft replacement) live in the saved-leads table.
export function useGenerateDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leadId: string) => api.generateDraftSync({ leadType: "person", leadId }),
    onSuccess: ({ data: task }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Draft created", {
        action: {
          label: "View in Tasks",
          onClick: () => window.location.assign(`/engage?new=${task.id}`),
        },
      });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Draft generation failed.");
    },
  });
}

// Optimistic status transition shared by approve/reject: flip the card immediately,
// roll back on error, then re-sync tasks + the sidebar badge.
function useTaskTransition(
  action: (id: string) => Promise<unknown>,
  status: "approved" | "rejected",
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<TasksData>(["tasks"]);
      queryClient.setQueryData<TasksData>(["tasks"], (old) =>
        old
          ? { data: old.data.map((t) => (t.id === id ? { ...t, status } : t)) }
          : old,
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(["tasks"], context.previous);
      toast.error(`Could not ${status === "approved" ? "approve" : "reject"} — try again.`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useApproveTask() {
  return useTaskTransition((id) => api.approveTask(id), "approved");
}

export function useRejectTask() {
  return useTaskTransition((id) => api.rejectTask(id), "rejected");
}