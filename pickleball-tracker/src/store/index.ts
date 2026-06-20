import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Match, DrillSession } from '../types';

interface AppState {
  matches: Match[];
  drillSessions: DrillSession[];
  isPremium: boolean;

  addMatch: (match: Match) => void;
  updateMatch: (match: Match) => void;
  deleteMatch: (id: string) => void;
  addDrillSession: (session: DrillSession) => void;
  deleteDrillSession: (id: string) => void;
  setIsPremium: (val: boolean) => void;
}

const FREE_MATCH_LIMIT = 15;

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      matches: [],
      drillSessions: [],
      isPremium: false,

      addMatch: (match) =>
        set((state) => {
          const updated = [match, ...state.matches];
          if (!state.isPremium && updated.length > FREE_MATCH_LIMIT) {
            return { matches: updated.slice(0, FREE_MATCH_LIMIT) };
          }
          return { matches: updated };
        }),

      updateMatch: (match) =>
        set((state) => ({
          matches: state.matches.map((m) => (m.id === match.id ? match : m)),
        })),

      deleteMatch: (id) =>
        set((state) => ({ matches: state.matches.filter((m) => m.id !== id) })),

      addDrillSession: (session) =>
        set((state) => ({ drillSessions: [session, ...state.drillSessions] })),

      deleteDrillSession: (id) =>
        set((state) => ({
          drillSessions: state.drillSessions.filter((s) => s.id !== id),
        })),

      setIsPremium: (val) => set({ isPremium: val }),
    }),
    {
      name: 'pickleball-tracker-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const FREE_LIMIT = FREE_MATCH_LIMIT;
