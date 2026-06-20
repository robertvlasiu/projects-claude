export type BirdSex = 'hen' | 'rooster' | 'unknown';

export interface Bird {
  id: string;
  name: string;
  breed: string;
  sex: BirdSex;
  hatchDate?: string;
  acquiredDate: string;
  color?: string;
  photo?: string;
  isActive: boolean;
  notes?: string;
}

export interface EggLog {
  id: string;
  date: string; // YYYY-MM-DD
  count: number;
  notes?: string;
}

export type HealthEventType = 'checkup' | 'illness' | 'treatment' | 'observation' | 'death';

export interface HealthRecord {
  id: string;
  birdId: string;
  date: string;
  type: HealthEventType;
  notes: string;
  treatment?: string;
}

export interface FeedLog {
  id: string;
  date: string;
  feedType: string;
  amountLbs: number;
  costUsd: number;
  notes?: string;
}

export interface HatchBatch {
  id: string;
  name: string;
  startDate: string;
  eggsSet: number;
  breed?: string;
  notes?: string;
  expectedHatchDate: string;
  actualHatched?: number;
  status: 'incubating' | 'hatched' | 'failed';
}

export type RootTabParamList = {
  Home: undefined;
  Flock: undefined;
  Eggs: undefined;
  Feed: undefined;
  Hatch: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  AddBird: { birdId?: string };
  BirdDetail: { birdId: string };
  AddHealth: { birdId: string };
};
