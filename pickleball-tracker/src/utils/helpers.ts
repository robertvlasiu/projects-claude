import { Match, ShotRatings } from '../types';

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDateShort = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const getWinRate = (matches: Match[]): number => {
  if (!matches.length) return 0;
  return Math.round((matches.filter(m => m.isWin).length / matches.length) * 100);
};

export const getAverageShots = (matches: Match[]): ShotRatings => {
  const empty: ShotRatings = { serve: 0, return: 0, dink: 0, drive: 0, drop: 0, overhead: 0 };
  if (!matches.length) return empty;
  const totals = matches.reduce(
    (acc, m) => ({
      serve: acc.serve + m.shots.serve,
      return: acc.return + m.shots.return,
      dink: acc.dink + m.shots.dink,
      drive: acc.drive + m.shots.drive,
      drop: acc.drop + m.shots.drop,
      overhead: acc.overhead + m.shots.overhead,
    }),
    empty
  );
  const n = matches.length;
  return {
    serve: parseFloat((totals.serve / n).toFixed(1)),
    return: parseFloat((totals.return / n).toFixed(1)),
    dink: parseFloat((totals.dink / n).toFixed(1)),
    drive: parseFloat((totals.drive / n).toFixed(1)),
    drop: parseFloat((totals.drop / n).toFixed(1)),
    overhead: parseFloat((totals.overhead / n).toFixed(1)),
  };
};

export const getStreakInfo = (matches: Match[]): { streak: number; type: 'win' | 'loss' | null } => {
  if (!matches.length) return { streak: 0, type: null };
  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date));
  const type = sorted[0].isWin ? 'win' : 'loss';
  let streak = 0;
  for (const m of sorted) {
    if (m.isWin === (type === 'win')) streak++;
    else break;
  }
  return { streak, type };
};

export const getRatingLabel = (rating: number): string => {
  if (rating >= 4.5) return 'Elite';
  if (rating >= 3.5) return 'Strong';
  if (rating >= 2.5) return 'Solid';
  if (rating >= 1.5) return 'Developing';
  return 'Needs Work';
};
