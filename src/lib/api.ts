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
  DeliverabilityData,
  PauseAutonomyResponse,
  DomainRow,
  KbDocumentRow,
  ProofCategory,
  ProofItemRow,
  SendingModeData,
  SendMessageResponse,
  IntegrationsSummary,
  SignalCatalogRow,
  SuggestedAction,
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
    apiFetch<{ data: { id: string } }>(`/tasks/${id}/approve`, { method: "POST" }),

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

  // ---- Deliverability (org-scoped metrics) ----
  getDeliverability: () => apiFetch<{ data: DeliverabilityData }>("/deliverability"),

  // ---- Credits (org-scoped ledger balance) ----
  getCredits: () => apiFetch<{ data: CreditsData }>("/credits"),

  // ---- Analytics hub (Phase 4 Slice 4.2) — org-scoped aggregations over a [from,to] window ----
  getAnalyticsOverview: (r: AnalyticsRangeArg = {}) =>
    apiFetch<{ data: AnalyticsOverview }>(`/analytics/overview${rangeQuery(r)}`),
  getAnalyticsMessaging: (r: AnalyticsRangeArg = {}) =>
    apiFetch<{ data: AnalyticsMessaging }>(`/analytics/messaging${rangeQuery(r)}`),
  getAnalyticsCredits: (r: AnalyticsRangeArg = {}) =>
    apiFetch<{ data: AnalyticsCreditsData }>(`/analytics/credits${rangeQuery(r)}`),

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
};