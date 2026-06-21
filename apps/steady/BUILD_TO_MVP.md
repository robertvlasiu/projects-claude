# Steady — Build to MVP

Instructions for the agent/dev finishing this app. The scaffold already gives
you: navigation, a local-first data layer, onboarding that creates a Dog, a
protocol library with premium gating, a working Walk Mode logger, a Progress
stub, and a mock-billing paywall. Your job is to turn this into something a
reactive-dog owner would pay for.

**Definition of done (MVP):** an owner can onboard, run a free protocol, log a
walk one-handed, see a progress trend that proves improvement, hit a paywall on
premium content, and subscribe. Ships to TestFlight + Play internal testing.

Work top-to-bottom; each item notes the files involved.

## 0. Get it running first
- `npm install && npx expo install && npx expo start`. Fix any SDK/native
  version drift `expo install` reports. Run `npm run typecheck` — keep it green.
- Confirm the onboarding → home → walk → progress loop works on a device.

## 1. Onboarding → a screenshot-worthy profile  `app/onboarding.tsx`
- Add steps: breed (optional), approx age, and a **baseline threshold slider**
  ("how close can a trigger get before they react?") → save to
  `Dog.baselineThresholdFt`.
- End on a **"[Dog]'s Profile" summary card** — clean, shareable, branded. This
  is free social marketing; make it genuinely nice to screenshot.

## 2. "Today's session" logic  `app/index.tsx`
- Replace the hardcoded `PROTOCOLS[0]` with a real picker: choose a protocol
  whose `bestFor` overlaps the dog's `triggers`, rotating so the owner isn't
  shown the same thing daily. Factor in recent `ProtocolSession`s.
- Add a simple streak ("3 days in a row") — cheap, strong retention lever.

## 3. Guided session runner  `app/library/[id].tsx`
- Turn the static step list into a one-step-at-a-time guided flow with
  next/back and a finish action (already writes a `ProtocolSession`).
- Optional: a per-session reflection note saved to the session.

## 4. Walk Mode polish  `app/walk.tsx`
- Add **distance capture** (quick stepper in feet) to each `TriggerEvent`.
- Add **haptics** (`expo-haptics`) on every tap and **keep-awake**
  (`expo-keep-awake`) for the duration of a walk.
- Add an **"end walk" overall rating** (1–5) → `Walk.overall`.
- Verify incremental saves survive a force-quit mid-walk.

## 5. Progress — the retention + virality hook  `app/progress.tsx`
- Add a real **trend chart**: average reaction intensity per walk over time,
  and threshold distance over time. Use `victory-native` or
  `react-native-gifted-charts` (pick one, `expo install` it).
- Build a **shareable progress card** (`react-native-view-shot` +
  `expo-sharing`): "Luna — 6 weeks of progress", with the trend line and
  headline stat. **This is the TikTok content engine — prioritize it.**

## 6. Content & credibility  `src/data/seed.ts`  ⚠️ blocking for launch
- The seed protocols are placeholder scaffolding. Before any public launch:
  - Have a **CPDT-KA / IAABC-certified trainer review and co-sign** all
    protocol copy (budget ~$300–500). Add their name + credential in-app.
  - Add a clear disclaimer: educational, not a substitute for professional
    behavioral help; advise vet/behaviorist referral for severe cases.
- Expand to ~10–12 protocols so the premium tier feels worth $12.99/mo.

## 7. Wire RevenueCat  `src/subscriptions/`
1. Create a RevenueCat project; add iOS + Android apps.
2. Create entitlement **`premium`** (matches `ENTITLEMENT_ID`).
3. Create products **$12.99/mo** and **$79/yr** in App Store Connect + Play
   Console; add a free trial (7 days) to improve conversion.
4. Fill in `revenuecat.ts`, call `configureRevenueCat(<public key>)` at app
   start (in `app/_layout.tsx`), then change the export in
   `src/subscriptions/index.ts` from `mock` to `revenueCat`.
5. Paywall (`app/paywall.tsx`): add Terms + Privacy links (App Store requires
   them), trial messaging, and a working Restore.

## 8. Store-readiness
- App icon + splash (replace the teal placeholder), screenshots, ASO copy
  targeting "reactive dog", "leash reactivity", "dog training".
- Privacy policy + Terms (host anywhere). Data is local-only — say so.
- EAS Build → TestFlight + Play internal testing.

## Post-MVP (do NOT block launch)
- Cloud backup/sync (the `store.ts` interface is already swap-ready for
  `expo-sqlite` + a sync layer).
- Multiple dogs, reminders/notifications, trainer-mode sharing, community.

## Guardrails
- Don't break the `SubscriptionApi` shape — screens depend on it.
- Keep everything offline-first; no required backend for MVP.
- Don't claim medical/behavioral authority in copy until §6 is done.
