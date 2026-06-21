# projects-claude

Two B2C mobile apps scaffolded for parallel development. Each lives in its own
folder under `apps/` with a self-contained Expo + TypeScript base and a
`BUILD_TO_MVP.md` that an agent (or you) can follow to reach a shippable MVP.

## The two apps

| Folder | Product | Niche | Monetization |
| --- | --- | --- | --- |
| [`apps/steady`](apps/steady) | **Steady** | Training + symptom tracking for owners of *reactive dogs* | Subscription ($12.99/mo · $79/yr) |
| [`apps/caselog`](apps/caselog) | **Caselog** | "Document your side" evidence log for *high-conflict co-parents* | Subscription ($9.99/mo · $69/yr) |

Both target **$3k–10k/month** with ~450–600 paying subscribers. See each app's
README for the full thesis, math, and distribution plan.

## Shared technical decisions

- **Framework:** Expo (managed) + React Native + TypeScript
- **Navigation:** `expo-router` (file-based)
- **Persistence:** Local-first via AsyncStorage in a thin repository layer
  (`src/data/store.ts`). Swappable to `expo-sqlite` later — see each
  `BUILD_TO_MVP.md`.
- **Subscriptions:** RevenueCat (`react-native-purchases`), wrapped behind
  `src/subscriptions/`. A mock provider lets the app run before billing is wired.
- **No backend required for MVP.** Everything works offline. Sync/cloud backup
  is explicitly post-MVP.

## How the work is split

Each app is independent — no shared packages, no monorepo tooling — so two
agents can work in parallel without collisions. Point each agent at one folder
and tell it to follow that folder's `BUILD_TO_MVP.md`.

## Getting started (either app)

```bash
cd apps/steady   # or apps/caselog
npm install
npx expo install # aligns native deps to the installed Expo SDK
npx expo start
```
