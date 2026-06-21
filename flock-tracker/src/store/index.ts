import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bird, EggLog, HealthRecord, FeedLog, HatchBatch } from '../types';

const FREE_BIRD_LIMIT = 6;

interface AppState {
  birds: Bird[];
  eggLogs: EggLog[];
  healthRecords: HealthRecord[];
  feedLogs: FeedLog[];
  hatchBatches: HatchBatch[];
  isPremium: boolean;
  hasSeenOnboarding: boolean;
  notificationsEnabled: boolean;

  addBird: (bird: Bird) => void;
  updateBird: (bird: Bird) => void;
  deleteBird: (id: string) => void;

  addEggLog: (log: EggLog) => void;
  updateEggLog: (log: EggLog) => void;
  deleteEggLog: (id: string) => void;

  addHealthRecord: (record: HealthRecord) => void;
  updateHealthRecord: (record: HealthRecord) => void;
  deleteHealthRecord: (id: string) => void;

  addFeedLog: (log: FeedLog) => void;
  deleteFeedLog: (id: string) => void;

  addHatchBatch: (batch: HatchBatch) => void;
  updateHatchBatch: (batch: HatchBatch) => void;
  deleteHatchBatch: (id: string) => void;

  setIsPremium: (val: boolean) => void;
  completeOnboarding: () => void;
  setNotificationsEnabled: (val: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      birds: [],
      eggLogs: [],
      healthRecords: [],
      feedLogs: [],
      hatchBatches: [],
      isPremium: false,
      hasSeenOnboarding: false,
      notificationsEnabled: false,

      addBird: (bird) =>
        set((state) => {
          if (!state.isPremium && state.birds.length >= FREE_BIRD_LIMIT) return state;
          return { birds: [...state.birds, bird] };
        }),
      updateBird: (bird) =>
        set((state) => ({ birds: state.birds.map((b) => (b.id === bird.id ? bird : b)) })),
      deleteBird: (id) =>
        set((state) => ({ birds: state.birds.filter((b) => b.id !== id) })),

      addEggLog: (log) =>
        set((state) => {
          const existing = state.eggLogs.findIndex((l) => l.date === log.date);
          if (existing >= 0) {
            const updated = [...state.eggLogs];
            updated[existing] = log;
            return { eggLogs: updated };
          }
          return { eggLogs: [log, ...state.eggLogs] };
        }),
      updateEggLog: (log) =>
        set((state) => ({ eggLogs: state.eggLogs.map((l) => (l.id === log.id ? log : l)) })),
      deleteEggLog: (id) =>
        set((state) => ({ eggLogs: state.eggLogs.filter((l) => l.id !== id) })),

      addHealthRecord: (record) =>
        set((state) => ({ healthRecords: [record, ...state.healthRecords] })),
      updateHealthRecord: (record) =>
        set((state) => ({
          healthRecords: state.healthRecords.map((r) => (r.id === record.id ? record : r)),
        })),
      deleteHealthRecord: (id) =>
        set((state) => ({ healthRecords: state.healthRecords.filter((r) => r.id !== id) })),

      addFeedLog: (log) => set((state) => ({ feedLogs: [log, ...state.feedLogs] })),
      deleteFeedLog: (id) =>
        set((state) => ({ feedLogs: state.feedLogs.filter((l) => l.id !== id) })),

      addHatchBatch: (batch) =>
        set((state) => ({ hatchBatches: [batch, ...state.hatchBatches] })),
      updateHatchBatch: (batch) =>
        set((state) => ({
          hatchBatches: state.hatchBatches.map((b) => (b.id === batch.id ? batch : b)),
        })),
      deleteHatchBatch: (id) =>
        set((state) => ({ hatchBatches: state.hatchBatches.filter((b) => b.id !== id) })),

      setIsPremium: (val) => set({ isPremium: val }),
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
      setNotificationsEnabled: (val) => set({ notificationsEnabled: val }),
    }),
    {
      name: 'flock-tracker-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const FREE_BIRD_LIMIT_EXPORT = FREE_BIRD_LIMIT;
