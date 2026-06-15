"use client";

import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import type { ProofCategory } from "@/lib/api-types";

const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

export function useSendingMode() {
  return useQuery({ queryKey: ["sending-mode"], queryFn: api.getSendingMode, retry: noAuthRetry });
}
export function useCoachingPoints() {
  return useQuery({
    queryKey: ["coaching-points"],
    queryFn: api.getCoachingPoints,
    retry: noAuthRetry,
  });
}
export function useProofItems(category?: ProofCategory) {
  return useQuery({
    queryKey: ["proof-items", category ?? "all"],
    queryFn: () => api.getProofItems(category),
    retry: noAuthRetry,
  });
}
export function useKbDocuments() {
  return useQuery({
    queryKey: ["kb-documents"],
    queryFn: api.getKbDocuments,
    retry: noAuthRetry,
  });
}
