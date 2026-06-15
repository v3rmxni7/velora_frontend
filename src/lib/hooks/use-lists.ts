"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { CreateListRequest, UpdateListRequest } from "@/lib/api-types";

const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

export function useLists() {
  return useQuery({ queryKey: ["lists"], queryFn: api.getLists, retry: noAuthRetry });
}

// Raw membership rows for one list (count + entity_type/added_at). Disabled until a list is opened.
export function useListMembers(id: string | null) {
  return useQuery({
    queryKey: ["list-members", id],
    queryFn: () => api.getListMembers(id as string),
    enabled: !!id,
    retry: noAuthRetry,
  });
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateListRequest) => api.createList(body),
    onSuccess: ({ data }) => {
      qc.invalidateQueries({ queryKey: ["lists"] });
      toast.success(`Created “${data.name}”`);
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t create list — try again."),
  });
}

export function useUpdateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateListRequest }) => api.updateList(id, body),
    onSettled: () => qc.invalidateQueries({ queryKey: ["lists"] }),
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t rename list — try again."),
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteList(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists"] });
      toast.success("List deleted");
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t delete list — try again."),
  });
}
