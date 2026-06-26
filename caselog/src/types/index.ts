export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Log: undefined;
  Legal: undefined;
  Finance: undefined;
  More: undefined;
};

// ─── Feature Types ──────────────────────────────────────────────
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Tone = 'cooperative' | 'neutral' | 'tense' | 'hostile';
export type CommMethod = 'call' | 'text' | 'email' | 'in_person';
export type AssetOwner = 'joint' | 'mine' | 'theirs';
export type AssetType = 'asset' | 'debt';

export interface Incident {
  date: string;
  time: string;
  description: string;
  severity: Severity;
  location: string;
  witnesses: string;
  attachment_paths: string[];
}

export interface Expense {
  date: string;
  amount: string;
  category: string;
  description: string;
  vendor: string;
  receipt_path: string;
  attachment_paths?: string[];
}

export interface Document {
  title: string;
  category: string;
  date: string;
  notes: string;
  file_path: string;
  file_name: string;
  mime_type: string;
}

export interface Communication {
  date: string;
  time: string;
  method: CommMethod;
  party: string;
  summary: string;
  tone: Tone;
  duration: string;
  attachment_paths?: string[];
}

export interface CustodyEvent {
  date: string;
  type: string;
  notes: string;
  with_parent: 'me' | 'other';
  child_names: string;
  status: 'scheduled' | 'completed' | 'violation' | 'makeup';
  attachment_paths?: string[];
}

export interface CourtDate {
  date: string;
  time: string;
  title: string;
  type: string;
  location: string;
  notes: string;
  status: 'upcoming' | 'completed' | 'rescheduled';
  attachment_paths?: string[];
}

export interface AttorneyNote {
  date: string;
  attorney_name: string;
  duration_minutes: string;
  billed_hours: string;
  notes: string;
  action_items: string;
  cost: string;
  attachment_paths?: string[];
}

export interface Asset {
  name: string;
  category: string;
  asset_type: AssetType;
  estimated_value: string;
  owner: AssetOwner;
  notes: string;
}

export interface MoodEntry {
  date: string;
  mood: number;
  energy: number;
  notes: string;
  triggers: string;
}

export interface Contact {
  name: string;
  role: string;
  phone: string;
  email: string;
  address: string;
  firm: string;
  notes: string;
}

export interface Reminder {
  title: string;
  date: string;
  time: string;
  type: string;
  completed: boolean;
}
