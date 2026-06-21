# Caselog ⚖️

A "document your side" evidence-log app for **high-conflict co-parents**. Single
-player by design: you build your own timestamped record of incidents, expenses,
and custody exchanges, then export a clean PDF for your attorney — the hostile
ex never has to participate.

## The thesis (short version)

- **Customer:** a parent in an active/looming custody dispute, told by a lawyer
  to "keep records," currently drowning in screenshots and a shoebox of receipts.
- **Why they pay, fast:** stakes are their kids and thousands in support/legal
  costs; $9.99/mo is nothing. Cases drag for months–years → long retention.
- **Wedge vs incumbents:** OurFamilyWizard / TalkingParents require BOTH parents
  and are clunky + pricey. Caselog is single-player, modern, cheaper.
- **Monetization:** subscription, **$9.99/mo** or **$69/yr**. Free to log;
  **export is the paywall** (clearest moment of value).
- **Math to $5k/mo:** ~590 subs at ~$8.50 net — a microscopic slice of ~1.3M US
  divorces/year plus never-married custody cases.
- **Distribution:** divorce-TikTok, r/Divorce + r/coparenting + r/Custody, and
  the cheat code — **family-law attorney referrals** (lawyers love organized
  clients).
- **#1 risk:** liability/positioning. Never claim "court-admissible" or give
  legal advice. Copy must be attorney-reviewed.

## What's in this scaffold

A runnable Expo + TypeScript base with the full MVP loop implemented:

```
app/
  _layout.tsx     Stack navigation
  index.tsx       Dashboard: balance owed + recent timeline + quick actions
  onboarding.tsx  Create the case
  incident.tsx    Log incident (category, facts, photo/screenshot attachments)
  expenses.tsx    Expense ledger + running balance owed
  exchanges.tsx   Scheduled-vs-actual custody exchange log
  export.tsx      Generate + share the PDF report (premium-gated)
  paywall.tsx     Subscription modal (mock billing wired)
src/
  theme.ts              Design tokens
  data/types.ts         Domain model (note createdAt vs occurredAt)
  data/store.ts         AsyncStorage repository
  report/buildReport.ts HTML→PDF report builder (the killer feature)
  subscriptions/        RevenueCat wrapper (+ mock for dev)
  components/ui.tsx      Shared primitives
```

## Run it

```bash
npm install
npx expo install
npx expo start
```

## Next steps

See **[BUILD_TO_MVP.md](BUILD_TO_MVP.md)**. The core loop already works in the
mock; remaining work is mostly polish, security hardening, billing, and the
liability-critical content review.
