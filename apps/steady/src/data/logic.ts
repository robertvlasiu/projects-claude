/**
 * Derived logic for Steady: "today's session" picker and streak counting.
 * Pure functions over the domain model so they're easy to reason about/test.
 */
import type { Dog, Protocol, ProtocolSession, Walk } from "./types";
import { PROTOCOLS } from "./seed";

/** Local YYYY-MM-DD key for an ISO timestamp (used for day-grouping). */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Pick today's suggested protocol.
 *
 * Strategy:
 *  - Prefer protocols whose `bestFor` overlaps the dog's triggers.
 *  - Within that set, rotate: rank by how long it's been since last completed
 *    (never-done protocols sort first), so the owner isn't shown the same thing
 *    every day.
 *  - Free protocols win ties so a non-subscriber always has something to start.
 */
export function pickTodaysProtocol(
  dog: Dog,
  sessions: ProtocolSession[]
): Protocol {
  const lastDoneAt = new Map<string, number>();
  for (const s of sessions) {
    const t = new Date(s.completedAt).getTime();
    const prev = lastDoneAt.get(s.protocolId);
    if (prev === undefined || t > prev) lastDoneAt.set(s.protocolId, t);
  }

  const triggers = new Set(dog.triggers);
  const relevant = PROTOCOLS.filter((p) =>
    p.bestFor.some((b) => triggers.has(b))
  );
  const pool = relevant.length > 0 ? relevant : PROTOCOLS;

  const scored = [...pool].sort((a, b) => {
    const aLast = lastDoneAt.get(a.id) ?? 0; // 0 = never done → most stale
    const bLast = lastDoneAt.get(b.id) ?? 0;
    if (aLast !== bLast) return aLast - bLast; // stalest first
    if (a.premium !== b.premium) return a.premium ? 1 : -1; // free first on tie
    return a.title.localeCompare(b.title);
  });

  return scored[0];
}

/**
 * Count consecutive days (ending today or yesterday) with at least one logged
 * activity — a completed protocol session OR a walk. Yesterday counts as the
 * anchor so the streak doesn't read 0 before today's first activity.
 */
export function computeStreak(
  sessions: ProtocolSession[],
  walks: Walk[]
): number {
  const days = new Set<string>();
  for (const s of sessions) days.add(dayKey(s.completedAt));
  for (const w of walks) days.add(dayKey(w.startedAt));
  if (days.size === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Allow the streak to "hang" on yesterday if nothing is logged yet today.
  let cursor = new Date(today);
  if (!days.has(dayKey(cursor.toISOString()))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor.toISOString()))) return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor.toISOString()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
