/**
 * Local-first persistence for Steady.
 *
 * A deliberately tiny repository over AsyncStorage. Each collection is stored
 * as a single JSON array under a namespaced key. This is enough for the MVP
 * (single user, modest data volume). When you outgrow it, swap the internals
 * for expo-sqlite WITHOUT changing call sites — see BUILD_TO_MVP.md.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Dog, ProtocolSession, Walk } from "./types";

const KEY = {
  dogs: "steady.dogs.v1",
  sessions: "steady.sessions.v1",
  walks: "steady.walks.v1",
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

export const store = {
  // --- Dogs ---
  async getDogs(): Promise<Dog[]> {
    return readAll<Dog>(KEY.dogs);
  },
  async saveDog(dog: Dog): Promise<void> {
    const dogs = await readAll<Dog>(KEY.dogs);
    const idx = dogs.findIndex((d) => d.id === dog.id);
    if (idx >= 0) dogs[idx] = dog;
    else dogs.push(dog);
    await writeAll(KEY.dogs, dogs);
  },

  // --- Protocol sessions ---
  async getSessions(dogId: string): Promise<ProtocolSession[]> {
    const all = await readAll<ProtocolSession>(KEY.sessions);
    return all.filter((s) => s.dogId === dogId);
  },
  async addSession(session: ProtocolSession): Promise<void> {
    const all = await readAll<ProtocolSession>(KEY.sessions);
    all.push(session);
    await writeAll(KEY.sessions, all);
  },

  // --- Walks ---
  async getWalks(dogId: string): Promise<Walk[]> {
    const all = await readAll<Walk>(KEY.walks);
    return all
      .filter((w) => w.dogId === dogId)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  },
  async saveWalk(walk: Walk): Promise<void> {
    const all = await readAll<Walk>(KEY.walks);
    const idx = all.findIndex((w) => w.id === walk.id);
    if (idx >= 0) all[idx] = walk;
    else all.push(walk);
    await writeAll(KEY.walks, all);
  },

  /** Dev helper used by onboarding reset / tests. */
  async wipe(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEY));
  },
};
