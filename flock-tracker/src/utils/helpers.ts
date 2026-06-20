import { EggLog } from '../types';

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDateShort = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const toDateKey = (date?: Date): string => {
  const d = date ?? new Date();
  return d.toISOString().split('T')[0];
};

export const getAge = (hatchDate: string): string => {
  const birth = new Date(hatchDate);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 24) return `${months}mo`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths > 0 ? `${years}y ${remMonths}mo` : `${years}y`;
};

export const getHatchDaysLeft = (expectedHatchDate: string): number => {
  const expected = new Date(expectedHatchDate);
  const now = new Date();
  return Math.ceil((expected.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const addDaysToDate = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const getEggStatsForPeriod = (
  logs: EggLog[],
  days: number
): { total: number; daily: number; best: number } => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const relevant = logs.filter((l) => new Date(l.date) >= cutoff);
  const total = relevant.reduce((s, l) => s + l.count, 0);
  const best = relevant.length ? Math.max(...relevant.map((l) => l.count)) : 0;
  return { total, daily: parseFloat((total / days).toFixed(1)), best };
};

export const getLast30DaysKeys = (): string[] => {
  const keys: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(toDateKey(d));
  }
  return keys;
};

export const BREED_OPTIONS = [
  'Rhode Island Red',
  'Buff Orpington',
  'Barred Plymouth Rock',
  'Leghorn',
  'Australorp',
  'Easter Egger',
  'Silkie',
  'Wyandotte',
  'Sussex',
  'Brahma',
  'Cochin',
  'Marans',
  'Other',
];
