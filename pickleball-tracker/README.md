# Pickleball Tracker

A focused match and skill tracking app for serious pickleball players. Log matches, rate your shots, track drills, and watch your game improve over time.

## What it does

**Match Logging** — Log singles or doubles matches in under 30 seconds: opponent name, score, location, and per-shot ratings across 6 shot types (serve, return, dink, drop shot, drives, overhead).

**Shot Skill Analytics** — After each match, rate each shot type 1–5. The app averages these across your last 5, 10, or all-time matches and shows animated skill bars with your weakest and strongest shots called out. A personalized drill tip is generated from your lowest-rated shot.

**Drill Timer** — 8 built-in, categorized drills (warm-up, dinking, third shot, driving, full game) with a full-screen countdown timer, progress bar, vibrate on complete, and automatic session logging.

**Match History** — Filterable list (all / wins / losses) with color-coded win/loss indicator, score, opponent, location, and a dot-row showing shot quality for that match.

**Dashboard** — Win rate, current streak, this-month W/L record, recent matches, quick "Log Match" button.

## Monetization

| Plan | Price | Features |
|------|-------|---------|
| Free | $0 | Up to 15 matches, all drills, basic stats |
| Premium | $6.99/month or $49.99/year | Unlimited matches, full skill trend history |

The freemium gate hard-blocks adding a 16th match with an upgrade prompt (no silent data loss).

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | React Native + Expo SDK 56 |
| Language | TypeScript (strict) |
| Navigation | React Navigation 7 (stack + bottom tabs) |
| State | Zustand with AsyncStorage persistence |
| Storage | Local-first, no backend required in v1 |
| Subscriptions | Wire to RevenueCat (hook at `setIsPremium`) |

## Project structure

```
src/
  screens/
    HomeScreen.tsx       — Dashboard
    MatchesScreen.tsx    — History list
    LogMatchScreen.tsx   — Log/edit match (modal)
    SkillsScreen.tsx     — Shot analytics
    DrillsScreen.tsx     — Timer + drill library
    SettingsScreen.tsx   — Profile, premium, settings
  components/
    MatchCard.tsx        — Match list item
    StatCard.tsx         — KPI card
    SkillBar.tsx         — Animated rating bar
  store/
    index.ts             — Zustand store + freemium gate
  constants/
    theme.ts             — Colors, spacing, fonts, shadows
    drills.ts            — 8 built-in drill definitions
  types/
    index.ts             — TypeScript interfaces + nav param lists
  utils/
    helpers.ts           — Date formatting, stat calculations
```

## Running locally

```bash
cd pickleball-tracker
npm install
npm start          # opens Expo Go QR code
npm run ios        # iOS simulator (requires macOS + Xcode)
npm run android    # Android emulator
```

## Adding RevenueCat (subscriptions)

1. `npx expo install react-native-purchases`
2. Initialize in `App.tsx`: `Purchases.configure({ apiKey: 'your_key' })`
3. Replace the mock `setIsPremium(true)` in `SettingsScreen.tsx` with a real `Purchases.purchasePackage()` call
4. On app launch, restore entitlements: `Purchases.getCustomerInfo()` and call `setIsPremium(true)` if active

## QA checklist

- [ ] Log a match → appears in Home and Matches tabs
- [ ] Edit a match → changes persist
- [ ] Delete a match → removed from all tabs
- [ ] Log 15 matches (free) → 16th attempt shows upgrade alert, no data added
- [ ] Shot ratings 1-5 appear correctly colored in match card dots
- [ ] Skills tab shows correct averages after adding matches
- [ ] Period filter (5/10/all) on Skills tab updates charts
- [ ] Drill timer counts down, vibrates at 0, logs session
- [ ] Closing drill modal while timer runs → timer stops, no ghost session logged
- [ ] Win streak updates correctly after win/loss sequence
- [ ] Safe area: header text not clipped on iPhone with Dynamic Island
