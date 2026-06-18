"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

/** The org's CRM connections (REDACTED metadata — never a token) + which providers are configurable. */
export function useIntegrations() {
  return useQuery({ queryKey: ["integrations"], queryFn: api.getIntegrations, retry: noAuthRetry });
}

/** Start an OAuth connect → redirect to the provider's authorize page. 'not_configured' is honest. */
export function useConnectCrm() {
  return useMutation({
    mutationFn: (provider: string) => api.connectCrm(provider),
    onSuccess: ({ data }) => {
      if (data.authorizeUrl) window.location.assign(data.authorizeUrl);
      else toast.error("Couldn’t start the connection — try again.");
    },
    onError: (err) =>
      toast.error(
        err instanceof ApiError && err.code === "not_configured"
          ? "This CRM isn’t available yet — app credentials aren’t configured."
          : err instanceof ApiError
            ? err.message
            : "Couldn’t start the connection — try again.",
      ),
  });
}

export function useDisconnectCrm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: string) => api.disconnectCrm(provider),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Disconnected.");
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t disconnect — try again."),
  });
}

export function useLinkCrmToCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, campaignId }: { provider: string; campaignId: string }) =>
      api.linkCrmToCampaign(provider, campaignId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Linked to the campaign.");
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t link — try again."),
  });
}
