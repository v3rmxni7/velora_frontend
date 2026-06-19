"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

// Compliance summary (domains + retention policy + suppression counts).
export function useCompliance() {
  return useQuery({ queryKey: ["compliance"], queryFn: api.getCompliance, retry: noAuthRetry });
}

// The immutable audit timeline.
export function useAuditLog(limit = 50) {
  return useQuery({
    queryKey: ["audit-log", limit],
    queryFn: () => api.getAuditLog(limit),
    retry: noAuthRetry,
  });
}

// Run a REAL DNS SPF/DKIM/DMARC check for a domain. Refreshes compliance (the domain rows) + the
// audit timeline (the verify writes a domain_verified row) + the senders view (shares ["domains"]).
export function useVerifyDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (domainId: string) => api.verifyDomain(domainId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["compliance"] });
      qc.invalidateQueries({ queryKey: ["audit-log"] });
      qc.invalidateQueries({ queryKey: ["domains"] });
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t verify the domain — try again."),
  });
}
