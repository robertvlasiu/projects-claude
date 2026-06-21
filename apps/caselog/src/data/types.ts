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
  createdAt: string; // ISO, non-editable
}

export interface Attachment {
  id: string;
  /** Local file URI (photo of a receipt, screenshot of a text, etc.). */
  uri: string;
  caption?: string;
}

export interface IncidentEntry {
  id: string;
  caseId: string;
  category: IncidentCategory;
  /** Short title shown in the timeline. */
  title: string;
  /** Factual description. Coach users to write facts, not feelings. */
  details: string;
  attachments: Attachment[];
  occurredAt: string; // ISO — when it happened (editable)
  createdAt: string; // ISO — when logged (NOT editable; credibility anchor)
}

export type ExpenseSplit = "i_paid" | "they_paid" | "shared";

export interface Expense {
  id: string;
  caseId: string;
  description: string;
  amountCents: number;
  split: ExpenseSplit;
  /** What the other party owes for this item, in cents (derived/entered). */
  owedToMeCents: number;
  attachments: Attachment[];
  occurredAt: string; // ISO
  createdAt: string; // ISO, non-editable
}

export interface ExchangeEvent {
  id: string;
  caseId: string;
  scheduledAt: string; // ISO
  /** Null if it didn't happen; otherwise the actual handoff time. */
  actualAt?: string | null;
  occurred: boolean;
  note?: string;
  createdAt: string; // ISO, non-editable
}
