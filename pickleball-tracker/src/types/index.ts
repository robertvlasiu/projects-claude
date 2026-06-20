export type GameType = 'singles' | 'doubles';

export interface ShotRatings {
  serve: number;
  return: number;
  dink: number;
  drive: number;
  drop: number;
  overhead: number;
}

export interface Match {
  id: string;
  date: string; // ISO
  opponentName: string;
  partnerName?: string;
  myScore: number;
  opponentScore: number;
  location?: string;
  gameType: GameType;
  isWin: boolean;
  shots: ShotRatings;
  notes?: string;
}

export interface DrillSession {
  id: string;
  date: string;
  drillName: string;
  durationSeconds: number;
  reps?: number;
  notes?: string;
}

export interface Drill {
  id: string;
  name: string;
  description: string;
  durationSeconds: number;
  category: 'warmup' | 'dinking' | 'thirds' | 'driving' | 'full';
}

export type RootTabParamList = {
  Home: undefined;
  Matches: undefined;
  Skills: undefined;
  Drills: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  LogMatch: { matchId?: string };
};
