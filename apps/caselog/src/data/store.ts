/**
 * Local-first persistence for Caselog.
 *
 * Same tiny AsyncStorage repository pattern as Steady. For this app the data is
 * sensitive, so BUILD_TO_MVP.md calls for moving to encrypted storage
 * (expo-sqlite + SQLCipher, or expo-secure-store for keys) before launch.
 * Keeping the repository interface stable here makes that swap localized.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CaseProfile, ExchangeEvent, Expense, IncidentEntry } from "./types";

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

export const store = {
  // --- Case ---
  async getCase(): Promise<CaseProfile | null> {
    const all = await readAll<CaseProfile>(KEY.cases);
    return all[0] ?? null;
  },
  async saveCase(c: CaseProfile): Promise<void> {
    await writeAll(KEY.cases, [c]); // single-case MVP
  },

  // --- Incidents ---
  async getIncidents(caseId: string): Promise<IncidentEntry[]> {
    const all = await readAll<IncidentEntry>(KEY.incidents);
    return all.filter((i) => i.caseId === caseId).sort(byOccurredDesc);
  },
  async addIncident(entry: IncidentEntry): Promise<void> {
    const all = await readAll<IncidentEntry>(KEY.incidents);
    all.push(entry);
    await writeAll(KEY.incidents, all);
  },

  // --- Expenses ---
  async getExpenses(caseId: string): Promise<Expense[]> {
    const all = await readAll<Expense>(KEY.expenses);
    return all.filter((e) => e.caseId === caseId).sort(byOccurredDesc);
  },
  async addExpense(expense: Expense): Promise<void> {
    const all = await readAll<Expense>(KEY.expenses);
    all.push(expense);
    await writeAll(KEY.expenses, all);
  },
  /** Net amount the other party owes across all expenses, in cents. */
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
  async saveExchange(ev: ExchangeEvent): Promise<void> {
    const all = await readAll<ExchangeEvent>(KEY.exchanges);
    const idx = all.findIndex((x) => x.id === ev.id);
    if (idx >= 0) all[idx] = ev;
    else all.push(ev);
    await writeAll(KEY.exchanges, all);
  },

  async wipe(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEY));
  },
};
