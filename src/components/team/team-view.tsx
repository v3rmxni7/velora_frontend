"use client";

import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrgRole, TeamMemberRow } from "@/lib/api-types";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import {
  useInviteTeamMember,
  useRemoveMember,
  useRevokeInvitation,
  useTeamInvitations,
  useTeamMe,
  useTeamMembers,
  useUpdateMemberRole,
} from "@/lib/hooks/use-team";
import { cn } from "@/lib/utils";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const FOOTNOTE = "font-mono text-[11px] text-muted-foreground";
const SELECT_CLASS =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";
const ROLE_TONE: Record<OrgRole, string> = {
  owner: "border-primary/40 bg-accent text-accent-foreground",
  admin: "border-border bg-secondary text-foreground",
  member: "border-border bg-card text-muted-foreground",
};

function RoleChip({ role }: { role: OrgRole }) {
  return (
    <span
      className={cn(
        "rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
        ROLE_TONE[role],
      )}
    >
      {role}
    </span>
  );
}

export function TeamView() {
  const me = useTeamMe();
  const members = useTeamMembers();

  // Every role decision (canManage / isOwner / isSelf) depends on `me`, so render the interactive
  // view only once it has resolved — never gate on an undefined me (audit S7).
  if (me.isPending) {
    return (
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-40 w-full rounded-md" />
      </div>
    );
  }
  if (me.isError || !me.data) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs text-destructive">
          Couldn’t load your team — check that the backend is running.
        </p>
      </div>
    );
  }

  const role = me.data.data.user.role;
  const myId = me.data.data.user.id;
  const canManage = role === "owner" || role === "admin";
  const isOwner = role === "owner";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {canManage && <InviteSection />}

      <section>
        <h2 className={`${EYEBROW} mb-3`}>Members</h2>
        {members.isPending && <Skeleton className="h-16 w-full rounded-md" />}
        {members.isError && (
          <p className="font-mono text-xs text-destructive">Couldn’t load members — try again.</p>
        )}
        {members.isSuccess && (
          <ul className="space-y-2">
            {members.data.data.members.map((m) => (
              <li key={m.id}>
                <MemberRow member={m} isSelf={m.id === myId} canManage={isOwner} />
              </li>
            ))}
          </ul>
        )}
        {members.isSuccess && members.data.data.members.length <= 1 && (
          <p className={`${FOOTNOTE} mt-2`}>
            Just you so far{canManage ? " — invite a teammate above." : "."}
          </p>
        )}
      </section>

      {canManage && <PendingInvitations />}
    </div>
  );
}

function InviteSection() {
  const invite = useInviteTeamMember();
  const copy = useCopyToClipboard();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [link, setLink] = useState<{ email: string; url: string } | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!v) return;
    invite.mutate(
      { email: v, role },
      {
        onSuccess: ({ data }) => {
          setLink({ email: data.email, url: `${window.location.origin}/accept-invite?token=${data.token}` });
          setEmail("");
        },
      },
    );
  };

  return (
    <section>
      <h2 className={`${EYEBROW} mb-3`}>Invite a teammate</h2>
      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teammate@company.com"
          disabled={invite.isPending}
          className="min-w-48 flex-1"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "member")}
          disabled={invite.isPending}
          className={SELECT_CLASS}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <Button type="submit" size="sm" disabled={invite.isPending || !email.trim()}>
          Create invite
        </Button>
      </form>
      {link ? (
        <div className="mt-3 space-y-1.5 rounded-md border border-border bg-card p-3">
          <p className={FOOTNOTE}>
            Invite link for <span className="text-foreground">{link.email}</span> — no email is sent;
            share it directly. (Acceptance + signup arrive in a later onboarding slice.)
          </p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded border border-border bg-secondary/40 px-2 py-1.5 font-mono text-[11px] text-foreground">
              {link.url}
            </code>
            <Button type="button" size="sm" variant="outline" onClick={() => copy(link.url, "Invite link copied")}>
              Copy
            </Button>
          </div>
        </div>
      ) : (
        <p className={`${FOOTNOTE} mt-2`}>creates a pending invite + a copyable link — no email is sent</p>
      )}
    </section>
  );
}

function MemberRow({
  member,
  isSelf,
  canManage,
}: {
  member: TeamMemberRow;
  isSelf: boolean;
  canManage: boolean;
}) {
  const updateRole = useUpdateMemberRole();
  const remove = useRemoveMember();
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-4 py-2.5">
      <span className="text-sm text-foreground">
        {member.email}
        {isSelf && <span className="ml-1.5 text-muted-foreground">(you)</span>}
      </span>
      <div className="flex items-center gap-2">
        {canManage && !isSelf ? (
          <>
            <select
              value={member.role}
              onChange={(e) => updateRole.mutate({ id: member.id, role: e.target.value as OrgRole })}
              disabled={updateRole.isPending}
              className={SELECT_CLASS}
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
            <Dialog>
              <DialogTrigger
                render={
                  <Button type="button" size="sm" variant="outline" disabled={remove.isPending} />
                }
              >
                Remove
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove {member.email}?</DialogTitle>
                  <DialogDescription>
                    They lose access to this organization immediately. This doesn’t delete their login.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton>
                  <DialogClose
                    render={<Button type="button" variant="destructive" />}
                    onClick={() => remove.mutate(member.id)}
                  >
                    Remove
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <RoleChip role={member.role} />
        )}
      </div>
    </div>
  );
}

function PendingInvitations() {
  const invitations = useTeamInvitations();
  const revoke = useRevokeInvitation();
  if (!invitations.isSuccess || invitations.data.data.invitations.length === 0) return null;
  return (
    <section>
      <h2 className={`${EYEBROW} mb-3`}>Pending invitations</h2>
      <ul className="space-y-2">
        {invitations.data.data.invitations.map((inv) => (
          <li
            key={inv.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-4 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">{inv.email}</p>
              <p className={`${FOOTNOTE} mt-0.5`}>
                {inv.role} · expires {new Date(inv.expires_at).toLocaleDateString()}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={revoke.isPending}
              onClick={() => revoke.mutate(inv.id)}
            >
              Revoke
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
