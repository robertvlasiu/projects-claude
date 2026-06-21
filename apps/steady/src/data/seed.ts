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
  {
    id: "u-turn",
    title: "Emergency U-Turn",
    summary: "A cheerful about-face to get out of a trigger ambush calmly.",
    durationMin: 8,
    bestFor: ["other_dogs", "men", "women", "children", "bikes"],
    premium: false, // second free protocol — proves value before paywall
    steps: [
      "Pick a cue word like 'this way!' in a happy, upbeat tone.",
      "In a calm setting, say the cue, turn 180°, and treat as your dog follows.",
      "Practice until the turn is automatic and fun, with zero leash tension.",
      "Use it on walks the moment a trigger appears too close — turn before reacting.",
    ],
  },
  {
    id: "pattern-games",
    title: "Pattern Games (1-2-3)",
    summary: "A predictable counting game that anchors your dog when stressed.",
    durationMin: 10,
    bestFor: ["other_dogs", "men", "women", "children", "loud_noises"],
    premium: true,
    steps: [
      "Say '1, 2, 3' and drop a treat on '3'. Repeat so the rhythm becomes familiar.",
      "Once your dog knows the game, start it when a trigger appears at distance.",
      "The predictable pattern gives an anxious dog something safe to focus on.",
      "Keep moving and counting until you're past the trigger.",
    ],
  },
  {
    id: "mat-settle",
    title: "Mat Settle / Relaxation Protocol",
    summary: "Build a portable 'off switch' your dog can use anywhere.",
    durationMin: 15,
    bestFor: ["loud_noises", "other"],
    premium: true,
    steps: [
      "Reward your dog for any calm interaction with a specific mat or towel.",
      "Gradually shape lying down and relaxing — soft eyes, hip rolled, slow breathing.",
      "Add mild distractions, rewarding continued calm. Build duration slowly.",
      "Bring the mat to cafés, patios, and vet waiting rooms as a safe base.",
    ],
  },
  {
    id: "counter-conditioning",
    title: "Counter-Conditioning (Open Bar)",
    summary: "Change the emotional response: trigger appears = good things rain.",
    durationMin: 12,
    bestFor: ["other_dogs", "men", "women", "children", "cars", "skateboards"],
    premium: true,
    steps: [
      "Stay well under threshold — your dog should notice but not react.",
      "Trigger appears = 'open bar': feed high-value treats continuously.",
      "Trigger leaves = 'bar closes': treats stop completely.",
      "Repeat over many sessions so the trigger starts to predict good things.",
    ],
  },
  {
    id: "find-it",
    title: "Find It Scatter",
    summary: "Toss treats to ground a spiking dog and reset their brain.",
    durationMin: 8,
    bestFor: ["other_dogs", "bikes", "skateboards", "loud_noises"],
    premium: true,
    steps: [
      "Teach 'find it' by tossing a few treats on the ground in a calm setting.",
      "Sniffing and foraging lowers arousal and engages the nose, not the eyes.",
      "When a trigger surprises you, scatter treats to redirect and decompress.",
      "Move on once your dog re-engages with you calmly.",
    ],
  },
  {
    id: "loose-leash",
    title: "Loose-Leash Foundations",
    summary: "Reduce leash tension that amplifies reactivity in the first place.",
    durationMin: 15,
    bestFor: ["other_dogs", "men", "women", "cars"],
    premium: true,
    steps: [
      "In a quiet area, reward your dog for walking with a soft, J-shaped leash.",
      "Stop moving the instant the leash goes tight; resume when it softens.",
      "A relaxed body and loose leash make over-threshold reactions less likely.",
      "Build duration before adding any distractions.",
    ],
  },
  {
    id: "predictability-protocol",
    title: "Predictable Walk Routine",
    summary: "Consistent routes and rituals lower a reactive dog's baseline anxiety.",
    durationMin: 20,
    bestFor: ["other_dogs", "men", "women", "children", "bikes", "cars", "other"],
    premium: true,
    steps: [
      "Pick low-traffic routes and consistent times to reduce surprise triggers.",
      "Open every walk with the same calm warm-up ritual (e.g. a few 'find its').",
      "Scan ahead and create distance early — manage the environment proactively.",
      "End on a positive, under-threshold note so walks stay a good experience.",
    ],
  },
  {
    id: "noise-desensitization",
    title: "Sound Desensitization",
    summary: "Gently rebuild tolerance to the noises that startle your dog.",
    durationMin: 12,
    bestFor: ["loud_noises", "cars"],
    premium: true,
    steps: [
      "Play a recording of the trigger sound at a very low volume, paired with treats.",
      "Keep your dog relaxed; if they react, lower the volume next time.",
      "Increase volume in tiny increments across days, always pairing with good things.",
      "For severe noise phobia, loop in a vet/behaviorist — this is support, not a cure.",
    ],
  },
];

export function getProtocol(id: string): Protocol | undefined {
  return PROTOCOLS.find((p) => p.id === id);
}
