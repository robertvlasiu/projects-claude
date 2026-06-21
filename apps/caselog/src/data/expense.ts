/**
 * Expense balance math. Centralized so the screen, store, and report agree.
 *
 * Convention: `owedToMeCents` is the NET effect on the running balance.
 *   - Positive  → the other party owes the user.
 *   - Negative  → the user owes the other party.
 *
 * Split semantics, given the other party's share % `s` (0–100) for the item:
 *   - "i_paid"    → the user fronted the full cost; the other party owes their
 *                   share `s%`  →  +amount * s/100.
 *   - "they_paid" → the other party fronted it; the user owes their own share
 *                   `(100-s)%`  →  -amount * (100-s)/100.
 *   - "shared"    → cost already split at point of sale; nothing changes hands.
 */
import type { ExpenseSplit } from "./types";

export function clampPct(pct: number): number {
  if (Number.isNaN(pct)) return 50;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

export function owedFor(
  split: ExpenseSplit,
  amountCents: number,
  otherPartySharePct: number
): number {
  const s = clampPct(otherPartySharePct);
  switch (split) {
    case "i_paid":
      return Math.round((amountCents * s) / 100);
    case "they_paid":
      return -Math.round((amountCents * (100 - s)) / 100);
    case "shared":
    default:
      return 0;
  }
}
