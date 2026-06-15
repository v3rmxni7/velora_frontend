"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { CreateProofItemRequest, ProofCategory } from "@/lib/api-types";

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

// ---- mutations ----
const onErr = (verb: string) => (err: unknown) =>
  toast.error(err instanceof ApiError ? err.message : `Couldn’t ${verb} — try again.`);

export function useCreateCoachingPoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => api.createCoachingPoint(content),
    onSettled: () => qc.invalidateQueries({ queryKey: ["coaching-points"] }),
    onError: onErr("add coaching"),
  });
}
export function useUpdateCoachingPoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api.updateCoachingPoint(id, content),
    onSettled: () => qc.invalidateQueries({ queryKey: ["coaching-points"] }),
    onError: onErr("save coaching"),
  });
}
export function useDeleteCoachingPoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCoachingPoint(id),
    onSettled: () => qc.invalidateQueries({ queryKey: ["coaching-points"] }),
    onError: onErr("delete coaching"),
  });
}

export function useCreateProofItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProofItemRequest) => api.createProofItem(body),
    onSettled: () => qc.invalidateQueries({ queryKey: ["proof-items"] }),
    onError: onErr("add proof"),
  });
}
export function useUpdateProofItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { title?: string; body?: string | null; url?: string | null };
    }) => api.updateProofItem(id, body),
    onSettled: () => qc.invalidateQueries({ queryKey: ["proof-items"] }),
    onError: onErr("save proof"),
  });
}
export function useDeleteProofItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProofItem(id),
    onSettled: () => qc.invalidateQueries({ queryKey: ["proof-items"] }),
    onError: onErr("delete proof"),
  });
}

// KB ingest: async + Firecrawl-key-gated. Surface 503 honestly, not as a failure.
export function useIngestKb() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sourceUrl: string) => api.ingestKb(sourceUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kb-documents"] });
      toast.success("Queued — the document will appear as it processes.");
    },
    onError: (err) => {
      if (err instanceof ApiError && (err.status === 503 || err.code === "unavailable")) {
        toast("Knowledge ingestion activates at go-live", {
          description: "Firecrawl isn’t connected yet.",
        });
        return;
      }
      toast.error(err instanceof ApiError ? err.message : "Ingest failed — try again.");
    },
  });
}
