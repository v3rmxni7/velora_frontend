"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { ConnectMailboxInput } from "@/lib/api-types";

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

// 4.8 — full sender config. Each invalidates senders + mailboxes (a primary/assignment change
// touches both). The send path honors sender.status (a real gate) + assignment is real DB state.
export function useUpdateSender() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: {
        displayName?: string;
        status?: "setup" | "active" | "paused";
        userId?: string | null;
        signature?: string | null;
      };
    }) => api.updateSender(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["senders"] }),
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t update the sender — try again."),
  });
}
export function useAssignMailbox() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ mailboxId, senderId }: { mailboxId: string; senderId: string | null }) =>
      api.assignMailbox(mailboxId, senderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mailboxes"] }),
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t assign the mailbox — try again."),
  });
}
export function useSetMailboxWarmupOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ mailboxId, override }: { mailboxId: string; override: boolean }) =>
      api.setMailboxWarmupOverride(mailboxId, override),
    onSuccess: (_res, { override }) => {
      qc.invalidateQueries({ queryKey: ["mailboxes"] });
      toast.success(
        override
          ? "Marked as established — ready to send. Start at low volume and watch deliverability."
          : "Override cleared — mailbox back to warming.",
      );
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t update the mailbox — try again."),
  });
}
// S3 — connect an SMTP mailbox (owner/admin). Honest error mapping: 422 = SMTP/IMAP didn't validate,
// 503 = Smartlead not connected yet, 403 = owner/admin only.
export function useConnectMailbox() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ConnectMailboxInput) => api.connectMailbox(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mailboxes"] });
      toast.success("Mailbox connected — warming up. It can't send until warm-up completes.");
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError
          ? err.status === 422
            ? "Couldn’t sign in to that mailbox — check the host/port and use an app password (not your normal password)."
            : err.status === 503
              ? "Mailbox connect activates at go-live — Smartlead isn’t connected yet."
              : err.status === 403
                ? "Only an owner or admin can connect a mailbox."
                : err.message
          : "Couldn’t connect the mailbox — try again.";
      toast.error(msg);
    },
  });
}
export function useSetPrimaryMailbox() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ senderId, mailboxId }: { senderId: string; mailboxId: string | null }) =>
      api.setPrimaryMailbox(senderId, mailboxId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mailboxes"] }),
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Couldn’t set the primary — try again."),
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