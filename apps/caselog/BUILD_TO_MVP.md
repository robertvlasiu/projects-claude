# Caselog — Build to MVP

The core loop is already implemented against the mock: onboard → log incidents/
expenses/exchanges → see the balance owed → export a PDF (gated by a mock
paywall). Your job is to harden it, wire real billing, and clear the
liability/positioning bar before launch.

**Definition of done (MVP):** a parent can document incidents, expenses, and
exchanges with attachments; see the running balance owed; subscribe; and export
a clean, timestamped PDF to share with an attorney. Data is stored securely.
Ships to TestFlight + Play internal testing.

## 0. Get it running first
- `npm install && npx expo install && npx expo start`. Resolve any version drift.
- Run `npm run typecheck` and keep it green.
- Walk the full loop on a device: onboarding → log one of each → export PDF
  (mock subscription auto-grants on "purchase").

## 1. Real date/time picking  ⚠️ correctness
Incidents, expenses, and exchanges currently default `occurredAt`/`scheduledAt`
to "now". Add `@react-native-community/datetimepicker` so users can set when the
event actually happened. **Keep `createdAt` stamped at save and never editable**
— that separation is the credibility anchor (see `src/data/types.ts`).
- Files: `app/incident.tsx`, `app/expenses.tsx`, `app/exchanges.tsx`.

## 2. Tamper-evidence (credibility moat)
- Make all `createdAt` values demonstrably immutable. Minimum: never expose UI
  to edit them. Stretch: hash-chain entries (each row stores a hash of the
  previous row's id+createdAt) so reordering/deletion is detectable, and print a
  short integrity note in the report footer.
- Decide and document an edit/delete policy. Recommended: allow editing
  `details`/`occurredAt` but record an "edited at" stamp; never silently mutate.

## 3. Secure storage  ⚠️ blocking for launch
This data is highly sensitive. Move off plain AsyncStorage:
- Swap `src/data/store.ts` internals to **expo-sqlite** with SQLCipher (or
  encrypt the JSON blobs with a key from `expo-secure-store`). The repository
  interface is already isolated, so call sites shouldn't change.
- Add an **app lock** (Face ID / passcode via `expo-local-authentication`) on
  launch. A hostile ex with physical access is part of this threat model.

## 4. Expense model polish  `app/expenses.tsx`
- Replace the hardcoded 50/50 assumption in `owedFor()` with a per-case share %
  (and allow per-expense override). Support "they owe me" vs "I owe them" both
  directions in the balance.
- Add edit/delete with the policy from §2.

## 5. Report polish  `src/report/buildReport.ts` + `app/export.tsx`
- Embed attachment thumbnails in the PDF (base64) or list them as an appendix.
- Add a date-range filter and per-section toggles before export.
- Keep the disclaimer. **Do not** add any "court-admissible" language.

## 6. Wire RevenueCat  `src/subscriptions/`
1. RevenueCat project; iOS + Android apps.
2. Entitlement **`premium`** (matches `ENTITLEMENT_ID`).
3. Products **$9.99/mo** and **$69/yr** in App Store Connect + Play Console;
   add a 7-day trial.
4. Fill in `revenuecat.ts`, call `configureRevenueCat(<public key>)` at startup
   in `app/_layout.tsx`, then switch the export in `src/subscriptions/index.ts`
   from `mock` to `revenueCat`.
5. Paywall: Terms + Privacy links (required), trial messaging, working Restore.
- Keep the gate exactly where it is: free to log, subscribe to export.

## 7. Positioning & liability  ⚠️ blocking for launch
- Have a **family-law attorney review all in-app copy** and the report
  disclaimer (budget ~$200–300). Never state or imply legal advice or
  admissibility.
- Add an explicit onboarding disclaimer + a persistent footer.
- Privacy policy emphasizing local/on-device storage and no data sale.

## 8. Store-readiness
- App icon + splash (replace navy placeholder), screenshots, ASO targeting
  "custody documentation", "co-parenting log", "evidence journal".
- EAS Build → TestFlight + Play internal testing.

## Post-MVP (do NOT block launch)
- Encrypted cloud backup (people fear losing the record if they lose the phone).
- Message/email import, court-date calendar, multi-case support.
- Optional shared/communication mode (only if you choose to compete with OFW).

## Guardrails
- Don't break the `SubscriptionApi` shape or the `store` interface — screens
  and the secure-storage swap both depend on them.
- `createdAt` is sacred: stamped once, never user-editable.
- No "court-admissible"/legal-advice language anywhere, ever.
