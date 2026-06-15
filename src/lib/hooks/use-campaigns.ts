"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { CreateCampaignRequest, EnrollmentStatus } from "@/lib/api-types";

const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

export function useCampaigns() {
  return useQuery({ queryKey: ["campaigns"], queryFn: api.getCampaigns, retry: noAuthRetry });
}
export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: () => api.getCampaign(id),
    retry: noAuthRetry,
  });
}
export function useEnrollments(id: string, status?: EnrollmentStatus) {
  return useQuery({
    queryKey: ["enrollments", id, status ?? "all"],
    queryFn: () => api.getEnrollments(id, status),
    retry: noAuthRetry,
  });
}
export function useLists() {
  return useQuery({ queryKey: ["lists"], queryFn: api.getLists, retry: noAuthRetry });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCampaignRequest) => api.createCampaign(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t create campaign — try again."),
  });
}

export function useLaunchCampaign(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.launchCampaign(id),
    onSuccess: ({ data }) => {
      qc.invalidateQueries({ queryKey: ["campaign", id] });
      qc.invalidateQueries({ queryKey: ["enrollments", id] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success(`Enrolled ${data.enrolled} lead${data.enrolled === 1 ? "" : "s"}`, {
        description: "Drafts will appear in Tasks for approval.",
        action: { label: "Open Tasks", onClick: () => window.location.assign("/engage") },
      });
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Launch failed — try again."),
  });
}

export function usePauseCampaign(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.pauseCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign", id] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t pause — try again."),
  });
}