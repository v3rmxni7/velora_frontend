// Hand-written mirror of the backend contract (velora_backend src/api/routes/* Zod schemas
// and supabase/migrations/* row shapes). ONE file on purpose: any drift between repos is
// contained here and reviewed against the backend source.

export type EntityType = "person" | "company" | "local_business";

// ---- Find Leads (POST /find-leads/search) ----

export interface SearchLeadsRequest {
  entityType: EntityType;
  /** Natural-language query — the backend converts it to validated filters. */
  query?: string;
  filters?: Record<string, unknown>;
}

/** A provider search result (backend PersonMatch) — also the exact shape POST /lists/:id/members accepts. */
export interface PersonMatch {
  externalId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  title: string;
  seniority: string;
  department: string;
  companyExternalId?: string;
  companyName?: string;
  companyIndustry?: string;
  companySize?: string;
  location?: string;
  country?: string;
  linkedinUrl?: string;
}

export interface SearchLeadsResponse {
  entityType: EntityType;
  filters: Record<string, unknown>;
  results: PersonMatch[];
}

// ---- Lists (POST /lists, POST /lists/:id/members) ----

export interface CreateListRequest {
  name: string;
  entityType: EntityType;
  description?: string;
}

export interface ListRow {
  id: string;
  organization_id: string;
  name: string;
  entity_type: EntityType;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AddListMembersResponse {
  added: number;
}

// ---- Saved leads (GET /leads) ----

/** A saved person row (people table). */
export interface PersonRow {
  id: string;
  organization_id: string;
  provider: string;
  external_id: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  title: string | null;
  seniority: string | null;
  department: string | null;
  company_name: string | null;
  location: string | null;
  country: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface GetLeadsResponse {
  entityType: EntityType;
  data: PersonRow[];
}

// ---- Tasks (the grounded-draft queue) ----

export type TaskStatus = "pending" | "approved" | "rejected" | "dismissed";
export type DraftMode = "personalized" | "template";

/** One verified fact (backend agents/draft/verify.ts Fact). */
export interface GroundingFact {
  id: string;
  text: string;
  sourceType: "kb_chunk" | "lead_field" | "proof_item";
  sourceRef: string;
  confidence: number;
}

/** tasks.grounding jsonb (backend DraftPayload.grounding). */
export interface Grounding {
  mode: DraftMode;
  overallConfidence: number;
  facts: GroundingFact[];
  usedFactIds: string[];
  verification: { ok: boolean; unverified: string[]; regenerated: boolean };
}

export interface Task {
  id: string;
  organization_id: string;
  type: "outbound_approval" | "manual" | "platform";
  status: TaskStatus;
  lead_type: EntityType | null;
  lead_id: string | null;
  campaign_id: string | null;
  subject: string | null;
  body: string | null;
  draft_mode: DraftMode | null;
  confidence: number | null;
  grounding: Grounding | null;
  reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateDraftRequest {
  leadType: EntityType;
  leadId: string;
  campaignId?: string;
}

export interface TaskCounts {
  pending: { outbound_approval: number; manual: number; platform: number };
}

// ---- Inbox (GET /inbox, GET /threads/:id) — Phase 2 Slice 2.6 ----

export type ThreadStatus = "active" | "needs_action" | "handled" | "auto_handled";
export type MessageDirection = "outbound" | "inbound";
export type MessageStatus =
  | "dry_run"
  | "queued"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "replied"
  | "bounced"
  | "complained"
  | "failed";
/** The reply classifier's coarse category (backend agents/reply/classify.ts), free text on the row. */
export type ReplyCategory =
  | "interested"
  | "not_interested"
  | "objection"
  | "out_of_office"
  | "unsubscribe"
  | "other";

/** threads row (backend supabase/migrations threads_messages). */
export interface ThreadRow {
  id: string;
  organization_id: string;
  sender_id: string | null;
  campaign_id: string | null;
  lead_type: EntityType;
  lead_id: string;
  subject: string | null;
  status: ThreadStatus;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

/** messages row (the inbox view subset — grounding/gates jsonb omitted). */
export interface MessageRow {
  id: string;
  organization_id: string;
  thread_id: string;
  enrollment_id: string | null;
  direction: MessageDirection;
  channel: string;
  smartlead_message_id: string | null;
  subject: string | null;
  body: string | null;
  status: MessageStatus;
  category: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ThreadWithMessages extends ThreadRow {
  messages: MessageRow[];
}