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
  CampaignRow,
  CampaignWithSteps,
  CreateCampaignRequest,
  CreditsData,
  DeliverabilityData,
  DomainRow,
  EnrollmentRow,
  EnrollmentStatus,
  LaunchResult,
  ListMemberRow,
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

  // Raw membership rows (entity_type/entity_id/added_at) — NOT hydrated with lead names.
  getListMembers: (listId: string) =>
    apiFetch<{ data: ListMemberRow[] }>(`/lists/${listId}/members`),

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
  launchCampaign: (id: string) =>
    apiFetch<{ data: LaunchResult }>(`/campaigns/${id}/launch`, { method: "POST" }),
  pauseCampaign: (id: string) =>
    apiFetch<{ data: { id: string } }>(`/campaigns/${id}/pause`, { method: "POST" }),
  getEnrollments: (id: string, status?: EnrollmentStatus) =>
    apiFetch<{ data: EnrollmentRow[] }>(
      `/campaigns/${id}/enrollments${status ? `?status=${status}` : ""}`,
    ),

  // ---- Deliverability (org-scoped metrics) ----
  getDeliverability: () => apiFetch<{ data: DeliverabilityData }>("/deliverability"),

  // ---- Credits (org-scoped ledger balance) ----
  getCredits: () => apiFetch<{ data: CreditsData }>("/credits"),
};