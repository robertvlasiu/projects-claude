# Caselog — Deploy

> **What I can and can't do from here.** I scaffolded the app, built the full
> MVP loop, got `tsc` passing, and added `eas.json` so it's build-ready. I
> **cannot push to the App Store / Play Store from this container** — that
> requires *your* paid developer accounts and signing credentials, which only
> you can authorize. Below is the exact, ordered path. Most of it is one-time.

## Prerequisites (one-time, you must do these)
1. **Apple Developer Program** — $99/year → https://developer.apple.com/programs
2. **Google Play Developer** — $25 one-time → https://play.google.com/console
3. **Expo account** (free) → `npm i -g eas-cli && eas login`
4. **RevenueCat account** (free tier) for subscriptions.

## Step 1 — Finish the launch-blockers first
Do not ship before these from `BUILD_TO_MVP.md` are done:
- §3 Secure storage + app lock (sensitive data).
- §6 RevenueCat wired (real products $9.99/mo, $69/yr).
- §7 Attorney-reviewed copy + disclaimers; privacy policy hosted.
- App icon, splash, screenshots.

## Step 2 — Configure the project
```bash
cd apps/caselog
eas init                      # links to your Expo account, sets project id
# set real bundle ids in app.json (replace com.example.caselog)
```

## Step 3 — Build
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```
EAS provisions signing credentials interactively the first time.

## Step 4 — Submit to the stores (internal testing first)
```bash
eas submit --platform ios       # → TestFlight
eas submit --platform android   # → Play internal testing track
```

## Step 5 — Store listings & review
- App Store Connect / Play Console: fill listing, screenshots, privacy
  questionnaire (declare local-only storage), and the IAP products.
- Subscriptions require the products to be **approved** before the paywall
  works in review — submit them with the first build.
- Expect 1–3 day review. Family/legal-adjacent apps get extra scrutiny on
  claims — the "not legal advice / not admissible" disclaimers matter here.

## When you're ready
Tell me once the accounts exist and I'll walk through `eas` step by step, or
hand this file to the agent finishing the MVP. I can't run these commands for
you because they authenticate against your accounts.
