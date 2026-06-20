# Flock Tracker

A purpose-built app for backyard chicken keepers. Track each bird individually, log daily egg production, record health events, calculate feed costs, and manage incubation batches.

## What it does

**Flock Roster** — Add each bird with name, breed, sex, hatch date, color, and notes. Birds show as cards with emoji avatars (or photos). Toggle birds inactive when they're retired or passed — their history stays.

**Egg Log** — Log daily egg counts with a single tap on quick-count buttons (1–12) or a custom input. A 30-day bar chart shows production history at a glance. Today's laying rate (% of active hens) and 7-day average are always visible. Tap any bar in the chart to view/edit that day.

**Health Records** — Per-bird health history with typed events: observation, checkup, illness, treatment, passed. Each record has a date, notes field, and optional treatment field (shown for illness/treatment types). Long-press any record to delete.

**Feed Tracker** — Log feed purchases by type, pounds, and cost. The app calculates your real cost per dozen eggs based on the last 30 days of feed spend vs eggs collected. 10 common feed types in a picker, plus custom input.

**Hatch Tracker** — Track incubation batches with a 21-day countdown, progress bar showing current day, and expected hatch date. Mark complete (enter chick count, get hatch rate %) or failed. Uses a proper cross-platform modal instead of iOS-only `Alert.prompt`.

## Monetization

| Plan | Price | Features |
|------|-------|---------|
| Free | $0 | Up to 6 birds, all features |
| Premium | $4.99/month or $29.99/year | Unlimited flock size |

6 birds covers most starter flocks and gives enough value to hook users before the paywall.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | React Native + Expo SDK 56 |
| Language | TypeScript (strict) |
| Navigation | React Navigation 7 (stack + bottom tabs) |
| State | Zustand with AsyncStorage persistence |
| Images | expo-image-picker (bird photos — wired, UI pending) |
| Storage | Local-first, no backend required in v1 |
| Subscriptions | Wire to RevenueCat (hook at `setIsPremium`) |

## Project structure

```
src/
  screens/
    HomeScreen.tsx        — Dashboard: egg hero card, flock summary, incubation, recent health
    FlockScreen.tsx       — Bird grid
    AddBirdScreen.tsx     — Add/edit bird (modal)
    BirdDetailScreen.tsx  — Bird profile + health history
    AddHealthScreen.tsx   — Add health record (modal)
    EggLogScreen.tsx      — Daily egg logging + 30-day chart
    FeedScreen.tsx        — Feed cost tracker + cost-per-dozen
    HatchScreen.tsx       — Incubation batch tracker
  components/
    BirdCard.tsx          — Bird grid card
  store/
    index.ts              — Zustand store (birds, eggs, health, feed, hatch, freemium gate)
  constants/
    theme.ts              — Warm amber/sage color palette, spacing, fonts
  types/
    index.ts              — TypeScript interfaces + nav param lists
  utils/
    helpers.ts            — Date math, age calculation, egg stats, breed list
```

## Running locally

```bash
cd flock-tracker
npm install
npm start          # opens Expo Go QR code
npm run ios        # iOS simulator
npm run android    # Android emulator
```

## Known platform behavior

- `Alert.prompt` is iOS-only. The hatch completion flow uses a cross-platform modal with `TextInput` instead. Do not use `Alert.prompt` anywhere in this codebase.
- `KeyboardAvoidingView` uses `behavior="padding"` on iOS and `behavior="height"` on Android throughout.

## QA checklist

- [ ] Add 6 birds (free limit) → 7th shows "upgrade" state, add button disabled
- [ ] Add bird → appears in flock grid with correct emoji for sex
- [ ] Tap bird card → detail screen shows with health history
- [ ] Add health record → appears in bird detail and on home screen recent events
- [ ] Log today's eggs via quick-tap → hero card on home updates
- [ ] Log same day twice → upserts (replaces) rather than creating duplicate
- [ ] Feed log entry → cost-per-dozen calculator updates
- [ ] Start hatch batch → countdown appears on home and hatch screen
- [ ] Mark hatch complete → hatch rate % calculated correctly
- [ ] Hatch complete modal works on Android (no Alert.prompt crash)
- [ ] Safe area: headers not clipped on iPhone with Dynamic Island
- [ ] 30-day egg chart renders correctly with 0-egg days shown as empty bars
- [ ] Math.max on large egg log history → no RangeError (uses reduce)
