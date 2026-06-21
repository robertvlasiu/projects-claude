# Steady 🐾

A training + symptom-tracking app for owners of **reactive dogs** (dogs that
lunge/bark at other dogs, people, bikes). The rare niche where the customer
already spends thousands on trainers, the problem is daily and emotional, and
the app category is underserved.

## The thesis (short version)

- **Customer:** stressed owner of a reactive/rescue dog, dreads walks.
- **Why they pay:** already paying $150–250/session for trainers; a $12.99/mo
  app between sessions is a rounding error. Reactivity is a months-to-years
  journey → long retention.
- **Monetization:** subscription, **$12.99/mo** or **$79/yr** (push annual).
- **Math to $5k/mo:** ~455 paying subs at ~$11 net. A rounding error of the
  niche (r/reactivedogs alone is 180k+).
- **Distribution:** TikTok/Reels "Day 1 vs Day 40" transformation arcs (the
  in-app progress card is the content engine), r/reactivedogs, FB support groups.
- **#1 risk:** authenticity — if you don't live this, partner with a real
  reactive-dog owner/trainer for content. Credibility also requires a certified
  trainer to co-sign the protocol content.

## What's in this scaffold

A runnable Expo + TypeScript base with the core loop stubbed:

```
app/
  _layout.tsx        Stack navigation
  index.tsx          Home / "Today's session"
  onboarding.tsx     Trigger quiz → creates the Dog profile
  library/index.tsx  Protocol list
  library/[id].tsx   Protocol detail + premium gating + session logging
  walk.tsx           Walk Mode — big one-handed reaction logging
  progress.tsx       Aggregates (chart + shareable card are TODO)
  paywall.tsx        Subscription modal (mock billing wired)
src/
  theme.ts                 Design tokens
  data/types.ts            Domain model
  data/store.ts            AsyncStorage repository
  data/seed.ts             Protocol content (NEEDS trainer review)
  subscriptions/           RevenueCat wrapper (+ mock for dev)
  components/ui.tsx         Shared primitives
```

## Run it

```bash
npm install
npx expo install
npx expo start
```

## Next steps

See **[BUILD_TO_MVP.md](BUILD_TO_MVP.md)** for the prioritized task list to
reach a shippable MVP.
