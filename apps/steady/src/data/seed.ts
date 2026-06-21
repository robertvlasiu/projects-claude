/**
 * Seed protocol content for Steady.
 *
 * IMPORTANT (credibility / liability): this is placeholder scaffolding written
 * from common positive-reinforcement methods. Before launch, ALL protocol copy
 * must be reviewed and co-signed by a credentialed trainer (CPDT-KA / IAABC).
 * See BUILD_TO_MVP.md → "Content & credibility". Do not present this as
 * veterinary or behavioral advice until reviewed.
 */
import type { Protocol } from "./types";

export const PROTOCOLS: Protocol[] = [
  {
    id: "lat",
    title: "Look At That (LAT)",
    summary: "Teach your dog to look at a trigger, then back at you, calmly.",
    durationMin: 10,
    bestFor: ["other_dogs", "men", "women", "children"],
    premium: false, // free taster protocol
    steps: [
      "Find a distance where your dog notices the trigger but stays calm (under threshold).",
      "The instant your dog looks at the trigger, mark with 'yes' and treat.",
      "Repeat. Your dog will start looking at the trigger, then back at you for the treat.",
      "Only decrease distance once your dog is reliably relaxed at the current one.",
    ],
  },
  {
    id: "engage-disengage",
    title: "Engage–Disengage",
    summary: "Reward noticing the trigger, then reward choosing to look away.",
    durationMin: 10,
    bestFor: ["other_dogs", "bikes", "skateboards"],
    premium: true,
    steps: [
      "Stage 1: mark and treat the moment your dog engages (looks at) the trigger.",
      "Stage 2: wait a beat; mark and treat when your dog disengages on its own.",
      "Keep sessions short. End before your dog goes over threshold.",
    ],
  },
  {
    id: "threshold-mapping",
    title: "Threshold Mapping",
    summary: "Find and track the distance where your dog can stay calm.",
    durationMin: 15,
    bestFor: ["other_dogs", "men", "women", "children", "bikes", "cars"],
    premium: true,
    steps: [
      "Approach a trigger slowly and watch for the first signs of tension.",
      "Note the distance — that's today's threshold. Log it in Walk Mode.",
      "Work just outside it. Over weeks, track the threshold shrinking in Progress.",
    ],
  },
  {
    id: "decompression",
    title: "Decompression Walks",
    summary: "Low-trigger sniffari walks to lower baseline stress.",
    durationMin: 30,
    bestFor: ["other"],
    premium: true,
    steps: [
      "Choose a quiet time/place with few triggers (early morning, open fields).",
      "Use a long line. Let your dog sniff and explore freely — no training agenda.",
      "Goal is nervous-system recovery, not obedience. Aim for 2–3x per week.",
    ],
  },
];

export function getProtocol(id: string): Protocol | undefined {
  return PROTOCOLS.find((p) => p.id === id);
}
