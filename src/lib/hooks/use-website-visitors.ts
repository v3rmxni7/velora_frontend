"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

/** The honest summary: tracking domains + REAL anonymous-visit counts + identified counts +
 * whether a de-anon resolver is connected (the single source for the whole page). */
export function useWebsiteVisitorSummary() {
  return useQuery({
    queryKey: ["website-visitor-summary"],
    queryFn: api.getWebsiteVisitorSummary,
    retry: noAuthRetry,
  });
}

export function useCreateTrackedDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (domain: string) => api.createTrackedDomain(domain),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["website-visitor-summary"] });
      toast.success("Domain added", { description: "Copy the snippet onto your site to start collecting visits." });
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t add the domain — try again."),
  });
}

export function useLinkDomainToCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, campaignId }: { id: string; campaignId: string }) =>
      api.linkDomainToCampaign(id, campaignId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["website-visitor-summary"] });
      toast.success("Linked to the campaign.");
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t link — try again."),
  });
}
