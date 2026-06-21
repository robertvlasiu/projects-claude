/**
 * Local-first persistence for Caselog.
 *
 * Same tiny AsyncStorage repository pattern as Steady. For this app the data is
 * sensitive, so BUILD_TO_MVP.md calls for moving to encrypted storage
 * (expo-sqlite + SQLCipher, or expo-secure-store for keys) before launch.
 * Keeping the repository interface stable here makes that swap localized.
 *
 * Tamper-evidence: each section's rows form a hash-chain (see hashChain.ts).
 * Rows are stored ordered by their immutable `createdAt`; on any write we
 * re-chain so prevHash/hash stay contiguous. `createdAt` is never mutated.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  CaseProfile,
  ChainedEntry,
  ExchangeEvent,
  Expense,
  IncidentEntry,
} from "./types";
import { rechain, verifyChain, type ChainCheck } from "./hashChain";

const KEY = {
  cases: "caselog.cases.v1",
  incidents: "caselog.incidents.v1",
  expenses: "caselog.expenses.v1",
  exchanges: "caselog.exchanges.v1",
} as const;

async function readAll<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function writeAll<T>(key: string, rows: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(rows));
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function byOccurredDesc(a: { occurredAt?: string }, b: { occurredAt?: string }) {
  return (b.occurredAt ?? "").localeCompare(a.occurredAt ?? "");
}

function byCreatedAsc(a: ChainedEntry, b: ChainedEntry) {
  return a.createdAt.localeCompare(b.createdAt);
}

/** A new row as supplied by a screen: chain fields are filled in by the store. */
export type NewEntry<T extends ChainedEntry> = Omit<T, "prevHash" | "hash">;

function withChainStub<T extends ChainedEntry>(entry: NewEntry<T>): T {
  return { ...entry, prevHash: "", hash: "" } as T;
}

/**
 * Append a new chained entry to a section: persist all rows for the case in
 * createdAt order with a freshly computed chain. Other cases' rows (single-case
 * MVP, but future-proof) are preserved untouched.
 */
async function appendChained<T extends ChainedEntry & { id: string; caseId: string }>(
  key: string,
  entry: T
): Promise<void> {
  const all = await readAll<T>(key);
  const mine = all.filter((r) => r.caseId === entry.caseId);
  const others = all.filter((r) => r.caseId !== entry.caseId);
  mine.push(entry);
  mine.sort(byCreatedAsc);
  rechain(mine);
  await writeAll(key, [...others, ...mine]);
}

/** Replace one row by id (editable fields only) and re-chain the section. */
async function updateChained<T extends ChainedEntry & { id: string; caseId: string }>(
  key: string,
  id: string,
  patch: Partial<T>
): Promise<void> {
  const all = await readAll<T>(key);
  const target = all.find((r) => r.id === id);
  if (!target) return;
  // Guard the immutable anchors no matter what the caller passed.
  const merged: T = {
    ...target,
    ...patch,
    id: target.id,
    caseId: target.caseId,
    createdAt: target.createdAt,
    editedAt: new Date().toISOString(),
  };
  const others = all.filter((r) => r.caseId !== target.caseId);
  const mine = all
    .filter((r) => r.caseId === target.caseId)
    .map((r) => (r.id === id ? merged : r));
  mine.sort(byCreatedAsc);
  rechain(mine);
  await writeAll(key, [...others, ...mine]);
}

/** Remove one row by id and re-chain the remaining rows in the section. */
async function deleteChained<T extends ChainedEntry & { id: string; caseId: string }>(
  key: string,
  id: string
): Promise<void> {
  const all = await readAll<T>(key);
  const target = all.find((r) => r.id === id);
  if (!target) return;
  const others = all.filter((r) => r.caseId !== target.caseId);
  const mine = all
    .filter((r) => r.caseId === target.caseId && r.id !== id)
    .sort(byCreatedAsc);
  rechain(mine);
  await writeAll(key, [...others, ...mine]);
}

export const store = {
  // --- Case ---
  async getCase(): Promise<CaseProfile | null> {
    const all = await readAll<CaseProfile>(KEY.cases);
    const c = all[0];
    if (!c) return null;
    // Back-fill the share % for cases created before this field existed.
    if (typeof c.otherPartySharePct !== "number") c.otherPartySharePct = 50;
    return c;
  },
  async saveCase(c: CaseProfile): Promise<void> {
    await writeAll(KEY.cases, [c]); // single-case MVP
  },
  /** Update mutable case settings (e.g. share %); createdAt/id stay fixed. */
  async updateCase(patch: Partial<CaseProfile>): Promise<void> {
    const current = await this.getCase();
    if (!current) return;
    await writeAll(KEY.cases, [
      { ...current, ...patch, id: current.id, createdAt: current.createdAt },
    ]);
  },

  // --- Incidents ---
  async getIncidents(caseId: string): Promise<IncidentEntry[]> {
    const all = await readAll<IncidentEntry>(KEY.incidents);
    return all.filter((i) => i.caseId === caseId).sort(byOccurredDesc);
  },
  async addIncident(entry: NewEntry<IncidentEntry>): Promise<void> {
    await appendChained(KEY.incidents, withChainStub(entry));
  },
  async updateIncident(
    id: string,
    patch: Partial<Pick<IncidentEntry, "category" | "title" | "details" | "attachments" | "occurredAt">>
  ): Promise<void> {
    await updateChained<IncidentEntry>(KEY.incidents, id, patch);
  },
  async deleteIncident(id: string): Promise<void> {
    await deleteChained<IncidentEntry>(KEY.incidents, id);
  },

  // --- Expenses ---
  async getExpenses(caseId: string): Promise<Expense[]> {
    const all = await readAll<Expense>(KEY.expenses);
    return all.filter((e) => e.caseId === caseId).sort(byOccurredDesc);
  },
  async addExpense(expense: NewEntry<Expense>): Promise<void> {
    await appendChained(KEY.expenses, withChainStub(expense));
  },
  async updateExpense(
    id: string,
    patch: Partial<Pick<Expense, "description" | "amountCents" | "split" | "sharePctOverride" | "owedToMeCents" | "attachments" | "occurredAt">>
  ): Promise<void> {
    await updateChained<Expense>(KEY.expenses, id, patch);
  },
  async deleteExpense(id: string): Promise<void> {
    await deleteChained<Expense>(KEY.expenses, id);
  },
  /**
   * Net balance across all expenses, in cents. Positive = the other party owes
   * the user; negative = the user owes the other party.
   */
  async getBalanceOwedCents(caseId: string): Promise<number> {
    const expenses = await this.getExpenses(caseId);
    return expenses.reduce((sum, e) => sum + e.owedToMeCents, 0);
  },

  // --- Exchanges ---
  async getExchanges(caseId: string): Promise<ExchangeEvent[]> {
    const all = await readAll<ExchangeEvent>(KEY.exchanges);
    return all
      .filter((x) => x.caseId === caseId)
      .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  },
  /** Add a brand-new exchange (chained). */
  async addExchange(ev: NewEntry<ExchangeEvent>): Promise<void> {
    await appendChained(KEY.exchanges, withChainStub(ev));
  },
  async updateExchange(
    id: string,
    patch: Partial<Pick<ExchangeEvent, "scheduledAt" | "actualAt" | "occurred" | "note">>
  ): Promise<void> {
    await updateChained<ExchangeEvent>(KEY.exchanges, id, patch);
  },
  async deleteExchange(id: string): Promise<void> {
    await deleteChained<ExchangeEvent>(KEY.exchanges, id);
  },

  /** Verify the integrity of all three section chains for a case. */
  async verifyIntegrity(caseId: string): Promise<{
    incidents: ChainCheck;
    expenses: ChainCheck;
    exchanges: ChainCheck;
    ok: boolean;
  }> {
    const [inc, exp, exc] = await Promise.all([
      readAll<IncidentEntry>(KEY.incidents),
      readAll<Expense>(KEY.expenses),
      readAll<ExchangeEvent>(KEY.exchanges),
    ]);
    const incidents = verifyChain(
      inc.filter((r) => r.caseId === caseId).sort(byCreatedAsc)
    );
    const expenses = verifyChain(
      exp.filter((r) => r.caseId === caseId).sort(byCreatedAsc)
    );
    const exchanges = verifyChain(
      exc.filter((r) => r.caseId === caseId).sort(byCreatedAsc)
    );
    return {
      incidents,
      expenses,
      exchanges,
      ok: incidents.ok && expenses.ok && exchanges.ok,
    };
  },

  async wipe(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEY));
  },
};
