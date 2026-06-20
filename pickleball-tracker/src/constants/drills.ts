import { Drill } from '../types';

export const BUILT_IN_DRILLS: Drill[] = [
  {
    id: 'warmup-cross-court',
    name: 'Cross-Court Dink Rally',
    description: 'Stand at the kitchen line and rally cross-court with a partner. Keep it slow and controlled. Focus on staying low and resetting.',
    durationSeconds: 300,
    category: 'warmup',
  },
  {
    id: 'dink-pattern',
    name: 'Dink Pattern Drill',
    description: 'Alternate between cross-court and down-the-line dinks in a set pattern: 3 cross, 1 line. Build speed gradually.',
    durationSeconds: 300,
    category: 'dinking',
  },
  {
    id: 'third-shot-drop',
    name: 'Third Shot Drop',
    description: 'From the baseline, serve then practice your third shot drop into the kitchen. Goal: land 8 of 10 in the kitchen.',
    durationSeconds: 600,
    category: 'thirds',
  },
  {
    id: 'erne-practice',
    name: 'Erne Approach',
    description: 'Practice the Erne — step wide around the kitchen corner to volley. Set up the shot with 2 cross-court dinks then execute.',
    durationSeconds: 300,
    category: 'dinking',
  },
  {
    id: 'reset-drill',
    name: 'Reset Under Pressure',
    description: 'Partner drives at you hard. Your job: reset into the kitchen every time. No counter-driving. Just soft hands.',
    durationSeconds: 420,
    category: 'thirds',
  },
  {
    id: 'speed-up-drill',
    name: 'Speed-Up & Block',
    description: 'Alternate who speeds up from the kitchen. The other player must block back softly. Switch every 10 reps.',
    durationSeconds: 300,
    category: 'driving',
  },
  {
    id: 'serve-return',
    name: 'Serve + Return Sequence',
    description: 'Server: work on deep placement (targets at the baseline corners). Returner: deep return then immediately move to the kitchen.',
    durationSeconds: 600,
    category: 'full',
  },
  {
    id: 'lob-overhead',
    name: 'Lob & Overhead',
    description: 'One player dinks and occasionally lobs. The other must read the lob early, back up, and put away the overhead.',
    durationSeconds: 300,
    category: 'driving',
  },
];
