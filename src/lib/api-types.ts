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
  type: "outbound_approval" | "manual" | "platform" | "reply_approval";
  status: TaskStatus;
  lead_type: EntityType | null;
  lead_id: string | null;
  campaign_id: string | null;
  thread_id: string | null;
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
  pending: {
    outbound_approval: number;
    manual: number;
    platform: number;
    // Pending reply drafts awaiting human approval — the backend returns this; the nav badge must
    // count it too, or a queued reply-approval is invisible.
    reply_approval: number;
  };
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
  signature: string | null;
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
  // Operator attests this is an established, in-use mailbox → treated as warm without the warm-up
  // send threshold (still spam-checked). Off by default.
  warmup_override: boolean;
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

// ---- Compliance (Slice 4.12, GET /compliance, /compliance/audit, POST /domains/:id/verify) ----
// Domain auth statuses are REAL DNS results ('unknown' when not yet verified / can't be checked, never
// a fabricated 'pass'). Retention is dry-run-first (dryRun=true → the purge only reports). The audit
// log is immutable (service-role-written, org-read).
export interface ComplianceData {
  domains: DomainRow[];
  retention: { websiteVisitsDays: number; signalEventsDays: number; dryRun: boolean };
  suppression: { total: number; byReason: Record<string, number> };
  // CAN-SPAM physical postal address injected into every live send; null → live sends are blocked.
  postalAddress: string | null;
}

export type AuditKind =
  | "team_role_changed"
  | "team_member_removed"
  | "sender_status_changed"
  | "suppression_added"
  | "copilot_action_confirmed"
  | "domain_verified"
  | "postal_address_updated"
  | "retention_reported"
  | "retention_purged";

export interface AuditLogRow {
  id: string;
  kind: AuditKind;
  user_id: string | null;
  args: Record<string, unknown> | null;
  reason: string | null;
  source: "user" | "system" | "webhook" | "cron" | null;
  created_at: string;
}
export interface AuditLogsData {
  events: AuditLogRow[];
  limit: number;
  offset: number;
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
/**
 * All 5 campaign types are creatable now; each shows an honest "connect [source]" state until its
 * source is wired, never a fake-ready campaign. cold_outbound → a saved list; intent_signals → a live
 * signal SUBSCRIPTION (4.5); website_visitor → an installed tracking pixel (4.6); warm_outbound +
 * cross_sell → a connected CRM (4.7). Non-cold types enroll 0 at launch and enroll leads over time as
 * their source produces them (or stay draft + "source not connected" until connected).
 */
export const SUPPORTED_CAMPAIGN_TYPES: CampaignType[] = [
  "cold_outbound",
  "intent_signals",
  "website_visitor",
  "warm_outbound",
  "cross_sell",
];
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

/** An A/Z message variant (4.4) — `angle` steers the grounded Writer, never sent verbatim. */
export interface CampaignVariantRow {
  id: string;
  organization_id: string;
  campaign_id: string;
  label: string;
  angle: string;
  created_at: string;
  updated_at: string;
}
/** One variant in the PUT /campaigns/:id/variants body. */
export interface CampaignVariantInput {
  label: string;
  angle: string;
}

export interface CampaignWithSteps extends CampaignRow {
  steps: CampaignStepRow[];
  variants?: CampaignVariantRow[];
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
  /** Required for cold_outbound (the audience list); omitted for non-cold types (sourced elsewhere). */
  listId?: string;
  senderId?: string;
  campaignType?: CampaignType;
}

/** One step in the authored sequence (4.3) — the PUT /campaigns/:id/steps body item. */
export interface CampaignStepInput {
  delayDays: number;
  bodyMode: "ai_grounded" | "template";
  subjectTemplate?: string | null;
}

export interface LaunchResult {
  enrolled: number;
  /** false when a non-cold type's audience source isn't connected yet (then enrolled is 0). */
  sourceConnected: boolean;
  source: string;
}

// ---- Signals (intent-signal catalog, SPEC §3.9 / Slice 4.5) ----

export type SignalCategory = "funding" | "hiring" | "other";
/** Catalog availability — only `live` signals are subscribable; `coming_soon` is gated honestly. */
export type SignalStatus = "live" | "coming_soon";

/**
 * One catalog row from GET /signals — the shared SPEC §3.9 definition merged with this org's
 * subscription state. `subscribed`/`campaignId` reflect the caller's org only (the catalog itself is
 * shared). Real signal feeds are external/deferred; the catalog's live-vs-coming-soon split is real.
 */
export interface SignalCatalogRow {
  id: string;
  key: string;
  category: SignalCategory;
  name: string;
  description: string | null;
  status: SignalStatus;
  subscribed: boolean;
  /** The intent_signals campaign this signal feeds when subscribed, else null. */
  campaignId: string | null;
}

// ---- Website visitors (de-anon, SPEC §3.10 / Slice 4.6) ----

/** A tracking domain (the org's marketing site). `site_key` is the public token the pixel embeds. */
export interface TrackedDomainRow {
  id: string;
  domain: string;
  site_key: string;
  /** The website_visitor campaign identified people enroll into, else null. */
  campaign_id: string | null;
  verified_at: string | null;
  created_at: string;
}

/** Windowed counts (today / last 7d / last 30d). */
export interface VisitorWindowCounts {
  today: number;
  d7: number;
  d30: number;
}

export interface WebsiteVisitorSummary {
  domains: TrackedDomainRow[];
  /** REAL anonymous page-view counts from the pixel. */
  visitCounts: VisitorWindowCounts;
  /** Identified-visitor counts — 0 until a resolver connects (then real). */
  identifiedCounts: VisitorWindowCounts;
  /** false until a de-anon resolution provider is connected — People/Companies stay honest-empty. */
  resolverConnected: boolean;
}

// ---- CRM connections (Slice 4.7) ----

export type CrmProvider = "hubspot" | "salesforce";
export type CrmStatus = "disconnected" | "pending" | "connected" | "error";

/**
 * One CRM connection's REDACTED metadata from GET /integrations. There is deliberately NO oauth/token
 * field — tokens live in a service-role-only vault and never reach the browser (the type enforces it).
 */
export interface CrmIntegration {
  kind: "crm";
  provider: string;
  status: CrmStatus;
  last_synced_at: string | null;
  error: string | null;
  /** The warm_outbound/cross_sell campaign synced contacts enroll into, else null. */
  campaign_id: string | null;
}

export interface IntegrationsSummary {
  integrations: CrmIntegration[];
  /** Providers whose OAuth app credentials are configured (empty until go-live → honest not-configured). */
  configurableProviders: string[];
}

// ---- Team management (Slice 4.8) ----

export type OrgRole = "owner" | "admin" | "member";

export interface TeamMemberRow {
  id: string;
  email: string;
  role: OrgRole;
  created_at: string;
}
export interface TeamInvitationRow {
  id: string;
  email: string;
  role: "admin" | "member";
  status: string;
  expires_at: string;
  created_at: string;
}
export interface TeamMe {
  user: { id: string; email: string; role: OrgRole };
  organization: { id: string; name: string };
  /** false until invite email delivery (SMTP) is configured → invites surface a copyable link. */
  inviteEmailConfigured: boolean;
}
/** The one-time invite result — `token` lets the FE compose a copyable accept link (NEVER emailed). */
export interface InviteResult {
  token: string;
  email: string;
  role: string;
  expiresAt: string;
}

// ---- Dialer (Slice 4.9) ----

export type CallStatus = "queued" | "scheduled" | "skipped" | "logged";
export type CallOutcome =
  | "connected"
  | "voicemail"
  | "no_answer"
  | "meeting_booked"
  | "bad_number"
  | "other";

export interface CallRow {
  id: string;
  lead_type: "person" | "company" | "local_business";
  lead_id: string;
  thread_id: string | null;
  campaign_id: string | null;
  phone: string | null;
  status: CallStatus;
  outcome: CallOutcome | null;
  notes: string | null;
  scheduled_at: string | null;
  logged_by: string | null;
  called_at: string | null;
  created_at: string;
  leadName: string | null;
}

export interface CallBriefMessage {
  direction: string;
  channel: string;
  subject: string | null;
  status: string;
  category: string | null;
  at: string;
  snippet: string;
}
export interface CallBrief {
  call: { id: string; status: string; outcome: string | null; phone: string | null; scheduledAt: string | null; calledAt: string | null };
  lead: { leadType: string; leadId: string; name: string | null; title: string | null; company: string | null; industry: string | null; location: string | null; phone: string | null };
  pastInteractions: { threadCount: number; lastMessageAt: string | null; summary: CallBriefMessage[] };
  grounding: {
    coachingPoints: string[];
    proofItems: { id: string; text: string }[];
    icp: { id: string; name: string }[];
    kbChunks: { id: string; content: string }[];
    campaignAngle: string | null;
  };
  /** LLM synthesis is deferred — 'unavailable' today (the structured grounding above is the real brief). */
  talkingPoints: { status: "generated" | "unavailable"; items: string[] };
}

export interface AnalyticsDialer {
  range: { from: string; to: string; days: number };
  loggedCalls: number;
  byOutcome: Record<string, number>;
  connectRate?: number;
  series: { date: string; calls: number; connected: number }[];
}

// ---- Manage Ava: knowledge + agent status ----

export interface SendingModeData {
  sendingEnabled: boolean;
  dryRun: boolean;
}

// S1 — productized go-live. Readiness is the prereq checklist; the flip itself is owner-only + a typed
// org-name confirm, re-checked + written server-side (this data never gates the real flip — the server
// re-runs readiness at flip time).
export interface GoLiveReadinessItem {
  key: string;
  label: string;
  ok: boolean;
  blocking: boolean;
  detail: string;
}
export interface GoLiveReadiness {
  ready: boolean;
  items: GoLiveReadinessItem[];
  /** The phrase the owner must type to confirm (the org name), matched server-side. */
  confirmPhrase: string;
  mode: SendingModeData;
}
export interface GoLiveResult {
  status: "went_live" | "already_live";
  mode: SendingModeData;
}
export interface PauseLiveResult {
  status: "paused" | "already_paused";
  mode: SendingModeData;
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
  // 4.10 — warn-only low-balance signal (the hard cold-send gate lives backend-side in executeSend).
  lowBalance: boolean;
  lowBalanceThreshold: number;
}

// ---- Onboarding quests (Slice 4.10, GET /quests) ----
// Completion is DERIVED from real org state and credits are awarded once (idempotent) by the backend.
// `done` reflects current state; `awarded` reflects a real credit_ledger reward already posted.
export type QuestGroup = "setup" | "grounding" | "activation";
export interface QuestItem {
  key: string;
  label: string;
  reward: number;
  group: QuestGroup;
  href: string;
  done: boolean;
  awarded: boolean;
}
export interface QuestProgress {
  quests: QuestItem[];
  completed: number;
  total: number;
  creditsEarned: number;
}

// ---- Billing (Slice 4.10, GET /billing) — HONEST SHELL ----
// Plan + tiers + real balance. `topUpConfigured` is false until a payment provider is connected; the
// UI must never imply a charge or fabricate a balance increase. Tiers are display data (SPEC §10).
export type PlanTier = "starter" | "growth" | "scale";
export interface PlanInfo {
  tier: PlanTier;
  name: string;
  priceUsdMonthly: number;
  includedCredits: number;
  leadsPerMonth: number;
  blurb: string;
}
export interface BillingData {
  plan: PlanTier;
  tiers: PlanInfo[];
  balance: number;
  lowBalance: boolean;
  lowBalanceThreshold: number;
  topUpConfigured: boolean;
}

// ---- Analytics hub (Phase 4 Slice 4.2, GET /analytics/overview|messaging|credits) ----
// HONEST BY CONSTRUCTION: the backend returns only genuinely-computable COUNTS + a `realSends`
// switch — never a rate or a synthesized series. The UI derives rates only when realSends > 0 and
// renders an honest-empty state otherwise. A genuine 0 count is real data; "not measurable yet" is
// a distinct empty state.
export interface AnalyticsRange {
  from: string;
  to: string;
  days: number;
}
export interface AnalyticsOverview {
  range: AnalyticsRange;
  realSends: number;
  kpis: {
    leadsEnrolled: number;
    draftsGenerated: number;
    realSends: number;
    replies: number;
    positiveReplies: number;
  };
  series: { date: string; enrolled: number; drafts: number; sent: number }[];
}
export interface AnalyticsMessaging {
  range: AnalyticsRange;
  realSends: number;
  byStatus: Record<string, number>;
  byCampaign: {
    campaignId: string;
    name: string;
    drafts: number;
    sent: number;
    replies: number;
    positive: number;
  }[];
  // A/Z (4.4) — per-variant rollup. Empty until a campaign has variants + activity. Honest-empty
  // (every variant 0/0/0) until real sends; never a fabricated winner.
  byVariant: {
    variantId: string;
    label: string;
    campaignId: string;
    campaignName: string;
    drafts: number;
    sent: number;
    replies: number;
    positive: number;
  }[];
}
export interface AnalyticsCreditsData {
  range: AnalyticsRange;
  balance: number;
  granted: number;
  used: number;
  byReason: Record<string, number>;
  series: { date: string; granted: number; used: number }[];
}

// ---- Autonomy (Phase 3, GET /autonomy, GET /autonomy/events, POST /autonomy/pause) ----
// The org's autonomy posture + the audit log + the one-click kill switch. Read + pause only — the
// flags are flipped ON via a deliberate runbook act, never a UI toggle (mirrors the sending flags).
export interface AutonomyData {
  autonomyEnabled: boolean;
  autoSendMinConfidence: number;
  autoReplyMode: "off" | "draft" | "send";
  /** The 3.5 circuit-breaker thresholds (env config, read-only display). */
  guardrails: {
    bounceRate: number;
    minSends: number;
    maxComplaints: number;
    windowHours: number;
  };
}

/** One autonomy_events audit row (a logged autonomous decision or a pause). */
export interface AutonomyEventRow {
  id: string;
  kind: "cold_send" | "reply" | "auto_pause";
  decision: "auto_send" | "escalate" | "suppress" | "engage" | "snooze" | "auto_pause";
  reason: string;
  confidence: number | null;
  enrollment_id: string | null;
  task_id: string | null;
  created_at: string;
}

export interface AutonomyEventsData {
  events: AutonomyEventRow[];
  count: number;
  limit: number;
  offset: number;
}

export interface PauseAutonomyResponse {
  autonomyEnabled: false;
  /** true if this call flipped it off; false if it was already off (idempotent). */
  paused: boolean;
}

// ---- Copilot (/copilot*) — the tool-calling chat assistant (Slice 4) ----
// Threads are per-user; messages are append-only turns. The assistant turn may carry a single
// read-only tool_call ({name,args,result}) — the "receipt" the UI renders so the user sees
// exactly what the agent looked up. null tool_calls = a plain conversational reply.

/** copilot_threads row (per-user within an org). title is null until the first message titles it. */
export interface CopilotThread {
  id: string;
  organization_id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

/** The stored receipt of one read-only tool the planner ran (args/result are tool-specific). */
export interface CopilotToolCall {
  name: string;
  args: unknown;
  result: unknown;
}

/** copilot_messages row (append-only; no updated_at by design). */
export interface CopilotMessage {
  id: string;
  organization_id: string;
  thread_id: string;
  role: "user" | "assistant";
  content: string;
  tool_calls: CopilotToolCall | null;
  created_at: string;
}

/** A deterministic next-action nudge (GET /copilot/suggested-actions). Click sends the prompt. */
export interface SuggestedAction {
  label: string;
  prompt: string;
}

/** POST /copilot/threads/:id/messages → the persisted assistant row + its tool call (if any). */
export interface SendMessageResponse {
  message: CopilotMessage;
  toolCall: CopilotToolCall | null;
}

// ---- Copilot agentic actions (Slice 4.11) — propose → human confirm ----
// The LLM only PROPOSES a write action (the assistant turn carries a CopilotProposedResult in its
// tool_calls.result); a deterministic, role-gated confirm endpoint executes it. `awarded`-style
// truth: the action row's status is the real state (proposed → confirmed/cancelled/failed).
export type CopilotActionClass = "safe" | "spending" | "destructive";
export type CopilotActionStatus = "proposed" | "confirmed" | "cancelled" | "failed";

/** The shape carried in an assistant turn's tool_calls.result when it PROPOSED an action. */
export interface CopilotProposedResult {
  proposed: true;
  action: { kind: string; actionClass: CopilotActionClass; title: string };
}

/** copilot_actions row (the propose→confirm ledger). */
export interface CopilotAction {
  id: string;
  organization_id: string;
  thread_id: string;
  message_id: string | null;
  user_id: string | null;
  kind: string;
  action_class: CopilotActionClass;
  title: string;
  args: unknown;
  status: CopilotActionStatus;
  result: unknown;
  error: string | null;
  created_at: string;
  updated_at: string;
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