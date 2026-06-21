/**
 * Core domain types for Steady.
 *
 * Mental model: an owner has one (or more) Dogs. Each Dog has known Triggers.
 * Owners run Protocols (named training methods) and log Walks; during a walk
 * they record TriggerEvents (a reaction to a trigger at a distance/intensity).
 * Progress is derived from TriggerEvents over time.
 */

export type TriggerKind =
  | "other_dogs"
  | "men"
  | "women"
  | "children"
  | "bikes"
  | "cars"
  | "skateboards"
  | "loud_noises"
  | "other";

export interface Dog {
  id: string;
  name: string;
  breed?: string;
  ageMonths?: number;
  /** Trigger kinds the owner selected during onboarding. */
  triggers: TriggerKind[];
  /** Owner's self-assessed starting threshold distance in feet. */
  baselineThresholdFt?: number;
  createdAt: string; // ISO
}

/** A named, evidence-based training method. Content lives in seed.ts. */
export interface Protocol {
  id: string;
  /** e.g. "Look At That (LAT)" */
  title: string;
  /** One-line promise shown in the library list. */
  summary: string;
  /** Estimated minutes per session. */
  durationMin: number;
  /** Ordered, do-this-now steps. */
  steps: string[];
  /** Which triggers this protocol is most useful for. */
  bestFor: TriggerKind[];
  /** True for protocols gated behind the paywall. */
  premium: boolean;
}

/** Records that an owner completed a protocol session on a given day. */
export interface ProtocolSession {
  id: string;
  dogId: string;
  protocolId: string;
  completedAt: string; // ISO
  notes?: string;
}

/** A single logged reaction during a walk. */
export interface TriggerEvent {
  id: string;
  walkId: string;
  trigger: TriggerKind;
  /** Distance to the trigger in feet when the dog reacted. */
  distanceFt?: number;
  /** 1 (noticed, calm) .. 5 (full explosion). Maps to colors.intensity. */
  intensity: 1 | 2 | 3 | 4 | 5;
  at: string; // ISO
}

export interface Walk {
  id: string;
  dogId: string;
  startedAt: string; // ISO
  endedAt?: string; // ISO
  events: TriggerEvent[];
  /** Owner's one-tap overall rating of the walk, 1-5. */
  overall?: 1 | 2 | 3 | 4 | 5;
}
