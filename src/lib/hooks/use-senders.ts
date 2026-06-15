"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

export function useSenders() {
  return useQuery({ queryKey: ["senders"], queryFn: api.getSenders, retry: noAuthRetry });
}
export function useMailboxes() {
  return useQuery({ queryKey: ["mailboxes"], queryFn: api.getMailboxes, retry: noAuthRetry });
}
export function useDomains() {
  return useQuery({ queryKey: ["domains"], queryFn: api.getDomains, retry: noAuthRetry });
}

export function useCreateSender() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (displayName: string) => api.createSender(displayName),
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t add sender — try again."),
    onSettled: () => qc.invalidateQueries({ queryKey: ["senders"] }),
  });
}

export function useCreateDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (domain: string) => api.createDomain(domain),
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t add domain — try again."),
    onSettled: () => qc.invalidateQueries({ queryKey: ["domains"] }),
  });
}

// Sync pulls Smartlead accounts into mailboxes. Until SMARTLEAD_API_KEY lands in Railway at
// go-live the backend returns 503 (smartlead_unconfigured) — surface that HONESTLY, not as a
// failure: the feature simply isn't live yet.
export function useSyncMailboxes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.syncMailboxes,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["mailboxes"] });
      toast.success(`Synced ${res.data.synced} mailbox${res.data.synced === 1 ? "" : "es"}.`);
    },
    onError: (err) => {
      if (err instanceof ApiError && (err.status === 503 || err.code === "smartlead_unconfigured")) {
        toast("Mailbox sync activates at go-live", {
          description: "Smartlead isn’t connected yet — connect mailboxes there during warmup.",
        });
        return;
      }
      toast.error(err instanceof ApiError ? err.message : "Sync failed — try again.");
    },
  });
}