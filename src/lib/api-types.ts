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

/** A list_members row (polymorphic membership — entity_type tells which table). */
export interface ListMemberRow {
  id: string;
  organization_id: string;
  list_id: string;
  entity_type: EntityType;
  entity_id: string;
  added_at: string;
}

export interface UpdateListRequest {
  name?: string;
  description?: string | null;
}

/** A list member hydrated with its lead record (GET /lists/:id/members). null lead = orphaned. */
export type HydratedMember = ListMemberRow & {
  lead: PersonRow | CompanyRow | LocalBusinessRow | null;
};

export interface ListMembersResponse {
  count: number;
  limit: number;
  offset: number;
  members: HydratedMember[];
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
  company_id: string | null;
  location: string | null;
  country: string | null;
  linkedin_url: string | null;
  source: string;
  enriched_at: string | null;
  created_at: string;
  updated_at: string;
}

/** A saved company row (companies table). */
export interface CompanyRow {
  id: string;
  organization_id: string;
  provider: string;
  external_id: string | null;
  name: string;
  domain: string | null;
  industry: string | null;
  size_band: string | null;
  employee_count: number | null;
  location: string | null;
  country: string | null;
  linkedin_url: string | null;
  source: string;
  enriched_at: string | null;
  created_at: string;
  updated_at: string;
}

/** A saved local-business row (local_businesses table). */
export interface LocalBusinessRow {
  id: string;
  organization_id: string;
  provider: string;
  external_id: string | null;
  name: string;
  category: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  google_maps_url: string | null;
  rating: number | null;
  source: string;
  enriched_at: string | null;
  created_at: string;
  updated_at: string;
}

/** The saved-lead row type for a given entity (lets getLeads('person') stay PersonRow[]). */
export type LeadRowFor<T extends EntityType> = T extends "person"
  ? PersonRow
  : T extends "company"
    ? CompanyRow
    : LocalBusinessRow;

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

// ---- Senders / Mailboxes / Domains (GET/POST /senders, /mailboxes, /domains) — Phase 2 Slice 2.1 ----

export type SenderStatus = "setup" | "active" | "paused";
export interface SenderRow {
  id: string;
  organization_id: string;
  user_id: string | null;
  display_name: string | null;
  status: SenderStatus;
  created_at: string;
  updated_at: string;
}

export type MailboxProvider = "gmail" | "microsoft" | "smtp" | "unknown";
/** classifyWarmth states (backend agents/sending/mailbox-sync). Only 'warm' may send (Slice 2.8). */
export type MailboxStatus = "pending" | "connected" | "warming" | "warm" | "paused";
/** mailboxes.reputation jsonb (backend mapWarmupStatsToReputation) — the warmup track record. */
export interface MailboxReputation {
  sent?: number;
  inbox?: number;
  spam?: number;
}
export interface MailboxRow {
  id: string;
  organization_id: string;
  sender_id: string | null;
  smartlead_email_account_id: string | null;
  email: string;
  provider: MailboxProvider;
  is_primary: boolean;
  status: MailboxStatus;
  daily_cap: number | null;
  reputation: MailboxReputation | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export type DomainAuthStatus = "unknown" | "pass" | "fail";
export interface DomainRow {
  id: string;
  organization_id: string;
  domain: string;
  spf_status: DomainAuthStatus;
  dkim_status: DomainAuthStatus;
  dmarc_status: DomainAuthStatus;
  tracking_status: DomainAuthStatus;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncMailboxesResponse {
  data: { synced: number; mailboxIds: string[] };
}

// ---- Campaigns / steps / enrollments (/campaigns*) — Phase 2 Slice 2.2 ----

export type CampaignType =
  | "cold_outbound"
  | "warm_outbound"
  | "cross_sell"
  | "website_visitor"
  | "intent_signals";
/** Only cold_outbound ships in Phase 2's pilot; the rest 422 at the backend. */
export const SUPPORTED_CAMPAIGN_TYPES: CampaignType[] = ["cold_outbound"];
export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "archived";

export interface CampaignRow {
  id: string;
  organization_id: string;
  sender_id: string | null;
  name: string;
  campaign_type: CampaignType;
  status: CampaignStatus;
  list_id: string | null;
  smartlead_campaign_id: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CampaignStepRow {
  id: string;
  organization_id: string;
  campaign_id: string;
  step_number: number;
  channel: string;
  delay_days: number;
  subject_template: string | null;
  body_mode: "ai_grounded" | "template";
  created_at: string;
  updated_at: string;
}

export interface CampaignWithSteps extends CampaignRow {
  steps: CampaignStepRow[];
}

export type EnrollmentStatus =
  | "pending"
  | "queued"
  | "awaiting_approval"
  | "sent"
  | "replied"
  | "bounced"
  | "unsubscribed"
  | "completed"
  | "failed";

export interface EnrollmentRow {
  id: string;
  organization_id: string;
  campaign_id: string;
  lead_type: EntityType;
  lead_id: string;
  status: EnrollmentStatus;
  current_step: number;
  verified_email: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignRequest {
  name: string;
  listId: string;
  senderId?: string;
  campaignType?: CampaignType;
}

export interface LaunchResult {
  enrolled: number;
}

// ---- Manage Ava: knowledge + agent status ----

export interface SendingModeData {
  sendingEnabled: boolean;
  dryRun: boolean;
}

export interface CoachingPointRow {
  id: string;
  organization_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type ProofCategory = "highlight" | "customer" | "case_study";
export interface ProofItemRow {
  id: string;
  organization_id: string;
  category: ProofCategory;
  title: string;
  body: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}
export interface CreateProofItemRequest {
  category: ProofCategory;
  title: string;
  body?: string;
  url?: string;
}

export type KbDocumentStatus =
  | "pending"
  | "scraping"
  | "chunking"
  | "embedding"
  | "ready"
  | "failed";
export interface KbDocumentRow {
  id: string;
  kind: string;
  source_url: string | null;
  title: string | null;
  status: KbDocumentStatus;
  created_at: string;
  updated_at: string;
}

// ---- Credits (GET /credits) — org-scoped ledger balance ----
export interface CreditsData {
  balance: number;
  granted: number;
  used: number;
}

// ---- Deliverability (GET /deliverability) — org-scoped metrics ----
// Note: the backend deliberately omits the GLOBAL send cap/count (no cross-tenant leak) and rich
// open/reply time-series (only meaningful after real sends — honest empty state below).
export interface DeliverabilityData {
  sends: { today: number; dailyCap: number; remaining: number };
  bounces: { total: number };
  suppression: { total: number; byReason: Record<string, number> };
  credits: { balance: number };
  mailboxes: { total: number; byStatus: Record<string, number> };
}