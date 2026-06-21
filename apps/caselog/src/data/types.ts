/**
 * Core domain types for Caselog.
 *
 * Mental model: the user keeps a single Case (their custody situation). Into it
 * they log timestamped IncidentEntries (events worth documenting), Expenses
 * (with who-paid / who-owes), and ExchangeEvents (scheduled vs actual custody
 * handoffs). The headline feature is exporting all of this as a clean,
 * chronological PDF report for their attorney/mediator.
 *
 * CREDIBILITY NOTE: `createdAt` is the server/device timestamp set at creation
 * and must never be user-editable. `occurredAt` (when the event actually
 * happened) may differ and IS editable. Keeping them separate is what makes the
 * record credible. See BUILD_TO_MVP.md → "Tamper-evidence".
 */

export type IncidentCategory =
  | "missed_exchange"
  | "late"
  | "denied_visit"
  | "hostile_comm"
  | "safety"
  | "other";

export interface CaseProfile {
  id: string;
  /** Free-text label, e.g. "Custody — minor child A.J." */
  label: string;
  childrenFirstNames: string[];
  otherPartyName?: string;
  /**
   * Default share of a shared expense the OTHER party is responsible for, as a
   * percentage 0–100. Default 50 (an even split). Used to derive how much they
   * owe when the user pays a shared cost. Per-expense overrides win.
   */
  otherPartySharePct: number;
  createdAt: string; // ISO, non-editable
}

export interface Attachment {
  id: string;
  /** Local file URI (photo of a receipt, screenshot of a text, etc.). */
  uri: string;
  caption?: string;
}

/**
 * Tamper-evidence fields shared by every logged entry.
 *
 * `createdAt` is stamped once at save and is never user-editable. `prevHash`
 * and `hash` form a hash-chain across a section's entries (ordered by
 * createdAt): each row's hash is derived from its own immutable id+createdAt
 * plus the previous row's hash, so deleting or reordering rows breaks the
 * chain and is detectable. `editedAt` records the last time editable fields
 * were changed; we never silently mutate.
 */
export interface ChainedEntry {
  createdAt: string; // ISO — when logged (NOT editable; credibility anchor)
  /** Hash of the previous entry in the chain ("" for the first). */
  prevHash: string;
  /** Hash of this entry: derived from prevHash + id + createdAt. */
  hash: string;
  /** ISO timestamp of the last edit to editable fields, if any. */
  editedAt?: string;
}

export interface IncidentEntry extends ChainedEntry {
  id: string;
  caseId: string;
  category: IncidentCategory;
  /** Short title shown in the timeline. */
  title: string;
  /** Factual description. Coach users to write facts, not feelings. */
  details: string;
  attachments: Attachment[];
  occurredAt: string; // ISO — when it happened (editable)
}

export type ExpenseSplit = "i_paid" | "they_paid" | "shared";

export interface Expense extends ChainedEntry {
  id: string;
  caseId: string;
  description: string;
  amountCents: number;
  split: ExpenseSplit;
  /**
   * Optional per-expense override of the other party's share %, 0–100. When
   * undefined the case-level default (otherPartySharePct) is used.
   */
  sharePctOverride?: number;
  /**
   * Net effect on the running balance, in cents. Positive = the other party
   * owes the user; negative = the user owes the other party. Derived at save.
   */
  owedToMeCents: number;
  attachments: Attachment[];
  occurredAt: string; // ISO
}

export interface ExchangeEvent extends ChainedEntry {
  id: string;
  caseId: string;
  scheduledAt: string; // ISO
  /** Null if it didn't happen; otherwise the actual handoff time. */
  actualAt?: string | null;
  occurred: boolean;
  note?: string;
}
