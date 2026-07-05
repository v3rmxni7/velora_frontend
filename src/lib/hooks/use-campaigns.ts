"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type {
  CampaignStepInput,
  CampaignVariantInput,
  CreateCampaignRequest,
  EnrollmentStatus,
} from "@/lib/api-types";

const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

/** Human label for an audience source (used when a non-cold launch reports source-not-connected). */
const SOURCE_LABEL: Record<string, string> = {
  list: "a list",
  crm: "a CRM (HubSpot or Salesforce)",
  website_visitors: "website-visitor tracking",
  signals: "an intent signal",
};

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
      // Honest: a non-cold type whose source isn't connected enrolled nothing — say so, don't fake success.
      if (!data.sourceConnected) {
        toast("Source not connected", {
          description: `Connect ${SOURCE_LABEL[data.source] ?? "the source"} to launch this campaign type.`,
        });
        return;
      }
      // Signals (4.5): a subscribed intent campaign launches active but enrolls 0 now — leads arrive
      // as events fire. Don't claim "drafts coming" or route to an empty Tasks queue; say what's true.
      if (data.source === "signals" && data.enrolled === 0) {
        toast("Subscribed — leads enroll as signals fire", {
          description: "New matches are drafted automatically as your subscribed signals trigger.",
        });
        return;
      }
      // Website visitors (4.6): the pixel collects real visits now, but enrollment needs an
      // identified PERSON — which requires de-anon to be connected. Don't claim "drafts coming."
      if (data.source === "website_visitors" && data.enrolled === 0) {
        toast("Active — collecting visits", {
          description: "0 enrolled yet; identified visitors enroll once de-anonymization is connected.",
        });
        return;
      }
      // CRM (4.7): a connected CRM is linked, but contacts enroll as they sync. Don't claim drafts.
      if (data.source === "crm" && data.enrolled === 0) {
        toast("Active — syncing from your CRM", {
          description: "0 enrolled yet; synced contacts enroll as they import.",
        });
        return;
      }
      toast.success(`Enrolled ${data.enrolled} lead${data.enrolled === 1 ? "" : "s"}`, {
        description: "Drafts will appear in Tasks for approval.",
        action: { label: "Open Tasks", onClick: () => window.location.assign("/engage") },
      });
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Launch failed — try again."),
  });
}

export function useUpdateCampaignSteps(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (steps: CampaignStepInput[]) => api.updateCampaignSteps(id, steps),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign", id] });
      toast.success("Sequence saved.");
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t save the sequence — try again."),
  });
}

export function useUpdateCampaignSender(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (senderId: string | null) => api.updateCampaignSender(id, senderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign", id] });
      toast.success("Sender updated.");
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t update the sender — try again."),
  });
}

export function useUpdateCampaignVariants(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variants: CampaignVariantInput[]) => api.updateCampaignVariants(id, variants),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign", id] });
      toast.success("Variants saved.");
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t save variants — try again."),
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