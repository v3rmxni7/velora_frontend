"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { OrgRole } from "@/lib/api-types";

const noAuthRetry = (count: number, err: unknown) =>
  !(err instanceof ApiError && err.status === 401) && count < 1;

// The team routes return { error: '<code>' } with no message — map known codes to human copy so a
// toast never shows a raw machine code (e.g. 'last_owner').
const TEAM_ERROR_COPY: Record<string, string> = {
  already_member: "That person is already on your team.",
  last_owner: "You can’t remove or demote the last owner.",
  cannot_remove_self: "You can’t remove yourself.",
  cannot_change_own_role: "You can’t change your own role.",
  not_found: "That member is no longer in your team.",
  forbidden: "You don’t have permission to do that.",
};
function teamError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return TEAM_ERROR_COPY[err.code] ?? err.message ?? fallback;
  return fallback;
}

export function useTeamMe() {
  return useQuery({ queryKey: ["team-me"], queryFn: api.getTeamMe, retry: noAuthRetry });
}
export function useTeamMembers() {
  return useQuery({ queryKey: ["team-members"], queryFn: api.getTeamMembers, retry: noAuthRetry });
}
export function useTeamInvitations() {
  return useQuery({
    queryKey: ["team-invitations"],
    queryFn: api.getTeamInvitations,
    retry: noAuthRetry,
  });
}

/** Invite returns a one-time token (the caller composes a copyable link). NO email is sent. */
export function useInviteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: "admin" | "member" }) =>
      api.inviteTeamMember(email, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-invitations"] });
      toast.success("Invite link ready", { description: "No email is sent — share the link." });
    },
    onError: (err) => toast.error(teamError(err, "Couldn’t create the invite — try again.")),
  });
}

export function useRevokeInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.revokeInvitation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-invitations"] });
      toast.success("Invitation revoked.");
    },
    onError: (err) => toast.error(teamError(err, "Couldn’t revoke — try again.")),
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: OrgRole }) => api.updateMemberRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Role updated.");
    },
    onError: (err) => toast.error(teamError(err, "Couldn’t update the role — try again.")),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.removeMember(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Member removed.");
    },
    onError: (err) => toast.error(teamError(err, "Couldn’t remove the member — try again.")),
  });
}
