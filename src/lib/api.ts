import { createClient } from "@/lib/supabase/client";
import type {
  AddListMembersResponse,
  CreateListRequest,
  EntityType,
  GenerateDraftRequest,
  LeadRowFor,
  ListRow,
  PersonMatch,
  SearchLeadsRequest,
  SearchLeadsResponse,
  AnalyticsCreditsData,
  AnalyticsMessaging,
  AnalyticsOverview,
  AutonomyData,
  AutonomyEventsData,
  CampaignRow,
  CampaignStepInput,
  CampaignStepRow,
  CampaignVariantInput,
  CampaignVariantRow,
  CampaignWithSteps,
  CoachingPointRow,
  CopilotMessage,
  CopilotThread,
  CreateCampaignRequest,
  CreateProofItemRequest,
  CreditsData,
  BillingData,
  QuestProgress,
  CopilotAction,
  ComplianceData,
  AuditLogsData,
  DeliverabilityData,
  PauseAutonomyResponse,
  DomainRow,
  KbDocumentRow,
  ProofCategory,
  ProofItemRow,
  GoLiveReadiness,
  GoLiveResult,
  PauseLiveResult,
  SendingModeData,
  SendMessageResponse,
  AnalyticsDialer,
  CallBrief,
  CallOutcome,
  CallRow,
  ConnectMailboxInput,
  IntegrationsSummary,
  InviteResult,
  OrgRole,
  SignalCatalogRow,
  SuggestedAction,
  TeamInvitationRow,
  TeamMe,
  TeamMemberRow,
  TrackedDomainRow,
  WebsiteVisitorSummary,
  EnrollmentRow,
  EnrollmentStatus,
  LaunchResult,
  ListMembersResponse,
  MailboxRow,
  SenderRow,
  SyncMailboxesResponse,
  Task,
  TaskCounts,
  ThreadRow,
  ThreadStatus,
  ThreadWithMessages,
  UpdateListRequest,
} from "@/lib/api-types";

// The single bridge to the backend: every call attaches the Supabase access token as a
// Bearer header. The token is TRANSPORT, not trust — the backend independently validates
// it (auth.getUser) and RLS authorizes every row.

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "ApiError";
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const supabase = createClient();
  // Browser-side getSession() reads the cookie-backed session and auto-refreshes an
  // expired access token before returning.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new ApiError(401, "no_session", "Not signed in");
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Only declare a JSON content-type when we actually send a body. A bodyless POST
  // (e.g. /tasks/:id/approve) with content-type: application/json makes Fastify's JSON
  // parser reject the empty body — so send the header only when there's something to parse.
  const headers = {
    ...(init.body != null ? { "content-type": "application/json" } : {}),
    ...(await authHeader()),
    ...init.headers,
  };
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (res.status === 401) {
    window.location.assign("/login");
    throw new ApiError(401, "unauthorized", "Session expired");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    throw new ApiError(res.status, body.error ?? "request_failed", body.message);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// ---- Typed endpoint wrappers (the thin vertical's surface) ----

/** A [from,to] analytics window (ISO dates); both optional → backend defaults to the last 30 days. */
export type AnalyticsRangeArg = { from?: string; to?: string };
function rangeQuery(r: AnalyticsRangeArg): string {
  const q = new URLSearchParams();
  if (r.from) q.set("from", r.from);
  if (r.to) q.set("to", r.to);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const api = {
  // ---- Self-serve signup / onboarding (Slice 4.13) ----
  // provision: turn an authenticated-but-orgless Supabase user into a new org+owner (idempotent).
  // acceptInvite: join the inviter's org via a team-invite token. Both hit the orgless-tolerant
  // /auth/* plugin with the bearer token apiFetch attaches.
  provision: () =>
    apiFetch<{ data: { organizationId: string; role: string; provisioned: boolean } }>(
      "/auth/provision",
      { method: "POST" },
    ),
  acceptInvite: (token: string) =>
    apiFetch<{ data: { organizationId: string; role: string } }>("/auth/accept-invite", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  searchLeads: (body: SearchLeadsRequest) =>
    apiFetch<SearchLeadsResponse>("/find-leads/search", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  createList: (body: CreateListRequest) =>
    apiFetch<{ data: ListRow }>("/lists", { method: "POST", body: JSON.stringify(body) }),

  addListMembers: (listId: string, matches: PersonMatch[]) =>
    apiFetch<AddListMembersResponse>(`/lists/${listId}/members`, {
      method: "POST",
      body: JSON.stringify({ matches }),
    }),

  deleteList: (listId: string) => apiFetch<void>(`/lists/${listId}`, { method: "DELETE" }),

  updateList: (listId: string, body: UpdateListRequest) =>
    apiFetch<{ data: ListRow }>(`/lists/${listId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  // Hydrated membership: { count, limit, offset, members[] } with each member's lead joined.
  getListMembers: (listId: string) =>
    apiFetch<{ data: ListMembersResponse }>(`/lists/${listId}/members`),

  // Generic over the entity so getLeads('person') stays PersonRow[] (the existing SavedLeads path)
  // while getLeads('company'|'local_business') type as CompanyRow[]/LocalBusinessRow[].
  getLeads: <T extends EntityType>(entityType: T, opts: { search?: string; limit?: number } = {}) => {
    const q = new URLSearchParams({ entityType });
    if (opts.search) q.set("search", opts.search);
    if (opts.limit) q.set("limit", String(opts.limit));
    return apiFetch<{ entityType: T; data: LeadRowFor<T>[] }>(`/leads?${q}`);
  },

  getLead: <T extends EntityType>(entityType: T, id: string) =>
    apiFetch<{ entityType: T; data: LeadRowFor<T> }>(`/leads/${entityType}/${id}`),

  /** Synchronous draft generation (BE-1) — runs the pipeline inline, returns the task. */
  generateDraftSync: (body: GenerateDraftRequest) =>
    apiFetch<{ data: Task }>("/tasks/generate-sync", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getTasks: (opts: { type?: Task["type"]; status?: Task["status"] } = {}) => {
    const q = new URLSearchParams();
    if (opts.type) q.set("type", opts.type);
    if (opts.status) q.set("status", opts.status);
    const qs = q.toString();
    return apiFetch<{ data: Task[] }>(`/tasks${qs ? `?${qs}` : ""}`);
  },

  getTaskCounts: () => apiFetch<TaskCounts>("/tasks/counts"),

  approveTask: (id: string) =>
    // `send` = the executeSend outcome after approval (dry_run/queued = went out; anything else =
    // approved but NOT sent, e.g. insufficient_credit / sender_unassigned / campaign_paused).
    apiFetch<{ data: { id: string }; send?: string }>(`/tasks/${id}/approve`, { method: "POST" }),

  rejectTask: (id: string, reason?: string) =>
    apiFetch<{ data: { id: string } }>(`/tasks/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(reason ? { reason } : {}),
    }),

  // ---- Inbox (Phase 2 Slice 2.6) — read-only triage of replies/bounces/unsubscribes ----
  getInbox: (status?: ThreadStatus) =>
    apiFetch<{ data: ThreadRow[] }>(`/inbox${status ? `?status=${status}` : ""}`),

  getThread: (id: string) => apiFetch<{ data: ThreadWithMessages }>(`/threads/${id}`),

  // ---- Senders / Mailboxes / Domains (Phase 2 Slice 2.1) ----
  getSenders: () => apiFetch<{ data: SenderRow[] }>("/senders"),
  createSender: (displayName: string) =>
    apiFetch<{ data: SenderRow }>("/senders", {
      method: "POST",
      body: JSON.stringify({ displayName }),
    }),

  getMailboxes: () => apiFetch<{ data: MailboxRow[] }>("/mailboxes"),
  /** Pulls Smartlead accounts into mailboxes. 503 (smartlead_unconfigured) until go-live. */
  syncMailboxes: () => apiFetch<SyncMailboxesResponse>("/mailboxes/sync", { method: "POST" }),

  getDomains: () => apiFetch<{ data: DomainRow[] }>("/domains"),
  createDomain: (domain: string) =>
    apiFetch<{ data: DomainRow }>("/domains", {
      method: "POST",
      body: JSON.stringify({ domain }),
    }),

  // ---- Campaigns (Phase 2 Slice 2.2) ----
  getLists: () => apiFetch<{ data: ListRow[] }>("/lists"),
  getCampaigns: () => apiFetch<{ data: CampaignRow[] }>("/campaigns"),
  createCampaign: (body: CreateCampaignRequest) =>
    apiFetch<{ data: CampaignRow }>("/campaigns", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getCampaign: (id: string) => apiFetch<{ data: CampaignWithSteps }>(`/campaigns/${id}`),
  updateCampaignSteps: (id: string, steps: CampaignStepInput[]) =>
    apiFetch<{ data: CampaignStepRow[] }>(`/campaigns/${id}/steps`, {
      method: "PUT",
      body: JSON.stringify({ steps }),
    }),
  updateCampaignVariants: (id: string, variants: CampaignVariantInput[]) =>
    apiFetch<{ data: CampaignVariantRow[] }>(`/campaigns/${id}/variants`, {
      method: "PUT",
      body: JSON.stringify({ variants }),
    }),
  launchCampaign: (id: string) =>
    apiFetch<{ data: LaunchResult }>(`/campaigns/${id}/launch`, { method: "POST" }),
  updateCampaignSender: (id: string, senderId: string | null) =>
    apiFetch<{ data: CampaignRow }>(`/campaigns/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ senderId }),
    }),
  pauseCampaign: (id: string) =>
    apiFetch<{ data: { id: string } }>(`/campaigns/${id}/pause`, { method: "POST" }),
  getEnrollments: (id: string, status?: EnrollmentStatus) =>
    apiFetch<{ data: EnrollmentRow[] }>(
      `/campaigns/${id}/enrollments${status ? `?status=${status}` : ""}`,
    ),

  // ---- Signals (intent-signal catalog, Slice 4.5) — subscribe a LIVE signal to an intent campaign ----
  getSignals: () => apiFetch<{ data: SignalCatalogRow[] }>("/signals"),
  subscribeToSignal: (id: string, campaignId: string) =>
    apiFetch<{ data: { subscribed: boolean } }>(`/signals/${id}/subscribe`, {
      method: "POST",
      body: JSON.stringify({ campaignId }),
    }),
  unsubscribeFromSignal: (id: string) =>
    apiFetch<{ data: { subscribed: boolean } }>(`/signals/${id}/unsubscribe`, { method: "POST" }),

  // ---- Website visitors (Slice 4.6) — tracking domains + the honest visit/identified summary ----
  getWebsiteVisitorSummary: () =>
    apiFetch<{ data: WebsiteVisitorSummary }>("/website-visitors/summary"),
  createTrackedDomain: (domain: string) =>
    apiFetch<{ data: TrackedDomainRow }>("/website-visitors/domains", {
      method: "POST",
      body: JSON.stringify({ domain }),
    }),
  linkDomainToCampaign: (id: string, campaignId: string) =>
    apiFetch<{ data: TrackedDomainRow }>(`/website-visitors/domains/${id}/link`, {
      method: "POST",
      body: JSON.stringify({ campaignId }),
    }),

  // ---- CRM connections (Slice 4.7) — redacted metadata; tokens never reach the browser ----
  getIntegrations: () => apiFetch<{ data: IntegrationsSummary }>("/integrations"),
  connectCrm: (provider: string) =>
    apiFetch<{ data: { authorizeUrl: string } }>(`/integrations/crm/${provider}/connect`, {
      method: "POST",
    }),
  disconnectCrm: (provider: string) =>
    apiFetch<{ data: { provider: string; status: string } }>(
      `/integrations/crm/${provider}/disconnect`,
      { method: "POST" },
    ),
  linkCrmToCampaign: (provider: string, campaignId: string) =>
    apiFetch<{ data: { provider: string; campaignId: string } }>(
      `/integrations/crm/${provider}/link`,
      { method: "POST", body: JSON.stringify({ campaignId }) },
    ),

  // ---- Team management (Slice 4.8) ----
  getTeamMe: () => apiFetch<{ data: TeamMe }>("/team/me"),
  getTeamMembers: () => apiFetch<{ data: { members: TeamMemberRow[] } }>("/team/members"),
  getTeamInvitations: () =>
    apiFetch<{ data: { invitations: TeamInvitationRow[] } }>("/team/invitations"),
  inviteTeamMember: (email: string, role: "admin" | "member") =>
    apiFetch<{ data: InviteResult }>("/team/invitations", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),
  revokeInvitation: (id: string) =>
    apiFetch<{ data: { id: string; status: string } }>(`/team/invitations/${id}/revoke`, {
      method: "POST",
    }),
  updateMemberRole: (id: string, role: OrgRole) =>
    apiFetch<{ data: TeamMemberRow }>(`/team/members/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  removeMember: (id: string) =>
    apiFetch<{ data: { id: string; removed: boolean } }>(`/team/members/${id}`, {
      method: "DELETE",
    }),

  // ---- Sender config (Slice 4.8) ----
  updateSender: (
    id: string,
    patch: {
      displayName?: string;
      status?: "setup" | "active" | "paused";
      userId?: string | null;
      signature?: string | null;
    },
  ) => apiFetch<{ data: SenderRow }>(`/senders/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  setPrimaryMailbox: (senderId: string, mailboxId: string | null) =>
    apiFetch<{ data: MailboxRow[] }>(`/senders/${senderId}/primary-mailbox`, {
      method: "PATCH",
      body: JSON.stringify({ mailboxId }),
    }),
  assignMailbox: (mailboxId: string, senderId: string | null) =>
    apiFetch<{ data: MailboxRow }>(`/mailboxes/${mailboxId}`, {
      method: "PATCH",
      body: JSON.stringify({ senderId }),
    }),
  setMailboxWarmupOverride: (mailboxId: string, override: boolean) =>
    apiFetch<{ data: MailboxRow }>(`/mailboxes/${mailboxId}/warmup-override`, {
      method: "PATCH",
      body: JSON.stringify({ override }),
    }),
  // S3 — connect an SMTP mailbox. The password is sent once to the backend (which passes it through to
  // Smartlead and never stores it) over HTTPS.
  connectMailbox: (input: ConnectMailboxInput) =>
    apiFetch<{ data: MailboxRow }>("/mailboxes/connect", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  // ---- Deliverability (org-scoped metrics) ----
  getDeliverability: () => apiFetch<{ data: DeliverabilityData }>("/deliverability"),

  // ---- Compliance (Slice 4.12) ----
  getCompliance: () => apiFetch<{ data: ComplianceData }>("/compliance"),
  getAuditLog: (limit = 50) =>
    apiFetch<{ data: AuditLogsData }>(`/compliance/audit?limit=${limit}`),
  verifyDomain: (domainId: string) =>
    apiFetch<{ data: DomainRow }>(`/domains/${domainId}/verify`, { method: "POST" }),
  // Owner/admin only (backend requireRole); a blank value clears it. Trimmed server-side.
  updatePostalAddress: (postalAddress: string) =>
    apiFetch<{ data: { postalAddress: string | null } }>("/compliance/postal-address", {
      method: "PATCH",
      body: JSON.stringify({ postalAddress }),
    }),

  // ---- Credits (org-scoped ledger balance) ----
  getCredits: () => apiFetch<{ data: CreditsData }>("/credits"),

  // ---- Onboarding quests + billing (Slice 4.10) ----
  getQuests: () => apiFetch<{ data: QuestProgress }>("/quests"),
  getBilling: () => apiFetch<{ data: BillingData }>("/billing"),

  // ---- Analytics hub (Phase 4 Slice 4.2) — org-scoped aggregations over a [from,to] window ----
  getAnalyticsOverview: (r: AnalyticsRangeArg = {}) =>
    apiFetch<{ data: AnalyticsOverview }>(`/analytics/overview${rangeQuery(r)}`),
  getAnalyticsMessaging: (r: AnalyticsRangeArg = {}) =>
    apiFetch<{ data: AnalyticsMessaging }>(`/analytics/messaging${rangeQuery(r)}`),
  getAnalyticsCredits: (r: AnalyticsRangeArg = {}) =>
    apiFetch<{ data: AnalyticsCreditsData }>(`/analytics/credits${rangeQuery(r)}`),
  getAnalyticsDialer: (r: AnalyticsRangeArg = {}) =>
    apiFetch<{ data: AnalyticsDialer }>(`/analytics/dialer${rangeQuery(r)}`),

  // ---- Dialer (Slice 4.9) — queue + brief + manual log; the agent never dials ----
  getDialerQueue: (tab: "ready" | "upcoming" | "log") =>
    apiFetch<{ data: CallRow[] }>(`/dialer/calls?tab=${tab}`),
  addToQueue: (body: {
    leadType: "person" | "company" | "local_business";
    leadId: string;
    phone?: string;
    scheduledAt?: string;
  }) => apiFetch<{ data: CallRow }>("/dialer/calls", { method: "POST", body: JSON.stringify(body) }),
  skipCall: (id: string) =>
    apiFetch<{ data: { id: string; status: string } }>(`/dialer/calls/${id}/skip`, { method: "POST" }),
  logCall: (id: string, outcome: CallOutcome, notes?: string) =>
    apiFetch<{ data: CallRow }>(`/dialer/calls/${id}/log`, {
      method: "POST",
      body: JSON.stringify({ outcome, notes }),
    }),
  getCallBrief: (id: string) => apiFetch<{ data: CallBrief }>(`/dialer/calls/${id}/brief`),

  // ---- Autonomy (Phase 3): read the posture + audit; pause is the only write (off-direction). ----
  getAutonomy: () => apiFetch<{ data: AutonomyData }>("/autonomy"),
  getAutonomyEvents: (opts: { limit?: number; offset?: number } = {}) => {
    const q = new URLSearchParams();
    if (opts.limit) q.set("limit", String(opts.limit));
    if (opts.offset) q.set("offset", String(opts.offset));
    const qs = q.toString();
    return apiFetch<{ data: AutonomyEventsData }>(`/autonomy/events${qs ? `?${qs}` : ""}`);
  },
  pauseAutonomy: () =>
    apiFetch<{ data: PauseAutonomyResponse }>("/autonomy/pause", { method: "POST" }),

  // ---- Manage Ava: agent status + knowledge (existing endpoints) ----
  getSendingMode: () => apiFetch<{ data: SendingModeData }>("/sending/mode"),

  // ---- Productized go-live (S1) — the flip is owner-only + typed-confirm, enforced server-side. ----
  getGoLiveReadiness: () => apiFetch<{ data: GoLiveReadiness }>("/sending/readiness"),
  goLive: (confirm: string) =>
    apiFetch<{ data: GoLiveResult }>("/sending/go-live", {
      method: "POST",
      body: JSON.stringify({ confirm }),
    }),
  pauseLive: () => apiFetch<{ data: PauseLiveResult }>("/sending/pause-live", { method: "POST" }),
  getCoachingPoints: () => apiFetch<{ data: CoachingPointRow[] }>("/coaching-points"),
  getProofItems: (category?: ProofCategory) =>
    apiFetch<{ data: ProofItemRow[] }>(`/proof-items${category ? `?category=${category}` : ""}`),
  getKbDocuments: () => apiFetch<{ data: KbDocumentRow[] }>("/kb/documents"),

  // ---- Manage Ava: knowledge CRUD (existing endpoints) ----
  createCoachingPoint: (content: string) =>
    apiFetch<{ data: CoachingPointRow }>("/coaching-points", {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  updateCoachingPoint: (id: string, content: string) =>
    apiFetch<{ data: CoachingPointRow }>(`/coaching-points/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    }),
  deleteCoachingPoint: (id: string) =>
    apiFetch<void>(`/coaching-points/${id}`, { method: "DELETE" }),

  createProofItem: (body: CreateProofItemRequest) =>
    apiFetch<{ data: ProofItemRow }>("/proof-items", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateProofItem: (
    id: string,
    body: { category?: ProofCategory; title?: string; body?: string | null; url?: string | null },
  ) =>
    apiFetch<{ data: ProofItemRow }>(`/proof-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteProofItem: (id: string) => apiFetch<void>(`/proof-items/${id}`, { method: "DELETE" }),

  // KB ingest is async (Inngest) → 202 queued; 503 until the Firecrawl key is set.
  ingestKb: (sourceUrl: string) =>
    apiFetch<{ status: string; dedupeKey: string }>("/kb/ingest", {
      method: "POST",
      body: JSON.stringify({ sourceUrl }),
    }),

  // ---- Copilot (the tool-calling chat assistant) ----
  getCopilotThreads: () => apiFetch<{ data: CopilotThread[] }>("/copilot/threads"),
  createCopilotThread: (title?: string) =>
    apiFetch<{ data: CopilotThread }>("/copilot/threads", {
      method: "POST",
      body: JSON.stringify(title ? { title } : {}),
    }),
  getCopilotMessages: (threadId: string) =>
    apiFetch<{ data: CopilotMessage[] }>(`/copilot/threads/${threadId}/messages`),
  // One turn: planner → optional read-only tool → responder. Slow (no streaming) — the UI shows
  // a real "thinking…" state and resolves with the persisted assistant row + its tool call.
  sendCopilotMessage: (threadId: string, content: string) =>
    apiFetch<SendMessageResponse>(`/copilot/threads/${threadId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  getSuggestedActions: () => apiFetch<{ actions: SuggestedAction[] }>("/copilot/suggested-actions"),

  // ---- Copilot agentic actions (Slice 4.11): propose → confirm. The LLM never executes; these are
  // the deterministic, role-gated confirm/cancel endpoints + the per-thread action list. ----
  getCopilotActions: (threadId: string) =>
    apiFetch<{ data: CopilotAction[] }>(`/copilot/threads/${threadId}/actions`),
  confirmCopilotAction: (id: string) =>
    apiFetch<{ data: CopilotAction }>(`/copilot/actions/${id}/confirm`, { method: "POST" }),
  cancelCopilotAction: (id: string) =>
    apiFetch<{ data: CopilotAction }>(`/copilot/actions/${id}/cancel`, { method: "POST" }),
};