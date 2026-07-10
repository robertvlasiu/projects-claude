# Auris — Launch TODO

## Auth & Accounts
- [x] Disable email confirmation (verified via Management API: `mailer_autoconfirm` is on)
- [ ] Email confirmation template (designed, saved in `email-template-confirm.html` — paste into Supabase when re-enabling)
- [ ] Google SSO — DEFERRED (Apple-first launch). Code is ready in `src/lib/authProviders.ts`
      (`signInWithGoogle`), just re-add the button on Login/Register when targeting Android. Setup then:
  1. Google Cloud Console → Credentials → create an **OAuth client (Web application)**.
     Authorized redirect URI: `https://ujqmhnbqyyhlojxrkedo.supabase.co/auth/v1/callback`
  2. Supabase → Authentication → Providers → Google → enable, paste client ID + secret.
  3. Supabase → Authentication → URL Configuration → Redirect URLs — add:
     `auris://auth/callback` (production/dev builds) and your Expo Go URL while testing
     (`exp://<your-lan-ip>:8081/--/auth/callback`).
- [x] Apple SSO — app code done (native Sign in with Apple → Supabase id-token).
  - [x] Bundle ID set: `com.vcorp.auris` (app.json, iOS + Android)
  - [x] Supabase Apple provider enabled via Management API; client IDs: `com.vcorp.auris`, `host.exp.Exponent`
  - [ ] Apple Developer → Identifiers → create App ID `com.vcorp.auris` → enable **Sign in with Apple** capability
  - [ ] Build to test: `eas build --profile development --platform ios` (Apple button needs a real
        signed build; in Expo Go the `host.exp.Exponent` client id makes it work there too, but the
        native Apple sheet still needs an iOS device)
- [x] Account deletion (in-app, Settings → Delete account; `delete_user()` RPC is in `supabase/schema.sql`) — **required by App Store review**
- [ ] Forgot-password flow (LoginScreen has the link, needs `resetPasswordForEmail` + deep-link handling)
- [ ] TestFlight (build + submit to App Store Connect for internal testing)

## Monetisation
- [x] Paywall + manage/cancel subscription screens (More → Subscription). Billing goes through
      Apple's payment sheet on iOS (store requirement). **3-day app trial** then paywall gate.
- [x] Product IDs aligned: `auris_pro_monthly`, `auris_pro_yearly`
- [x] `PaywallGate` blocks app after trial unless subscribed (`useSubscription().hasAccess`)
- [ ] **App Store Connect — fix "Missing Metadata" on both subscriptions:**
  1. Open each subscription → add **Subscription Display Name** + **Description** (localization)
  2. Set **Price** for each territory (or base country)
  3. Subscription group → add **Subscription Group Display Name**
  4. Add **Introductory Offer** → Free Trial → **3 days** on monthly + yearly (optional store trial on subscribe)
  5. App → version → **In-App Purchases and Subscriptions** → link subscription group
  6. Paid Apps Agreement, banking, and tax must be active in App Store Connect
- [ ] **RevenueCat dashboard:**
  1. iOS app with bundle ID `com.vcorp.auris` + App Store Connect API key (Issuer ID, Key ID, .p8)
  2. Products: `auris_pro_monthly`, `auris_pro_yearly` (import from App Store)
  3. Entitlement **`Auris - Divorce Management Pro`** → attach both products
  4. Default **Offering** → packages `$rc_monthly` → monthly, `$rc_annual` → yearly
  5. Design Paywall in RevenueCat (or use embedded UI — already wired)
  6. Copy **iOS public API key** to `.env` as `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
- [ ] EAS / TestFlight build (`eas build --platform ios`) — billing does not work in Expo Go
- [ ] Privacy policy + Terms URLs on paywall (App Store requirement)

## Compliance (blockers for store review)
- [ ] Privacy policy URL + Terms of Service (required by App Store/Play with accounts & subscriptions; link them on the paywall and Register screen)
- [ ] App Store privacy "nutrition label" / Play Data safety form (declare: encrypted user content, email)

## Growth & Marketing
- [ ] Website / landing page
- [ ] SEO (meta tags, sitemap, structured data)
- [ ] Fiverr video (demo / explainer)
- [ ] Reddit launch posts (r/legaladvice, r/divorce, r/entrepreneur)
- [ ] Go-to-market strategy

## Nice-to-have next
- [ ] Crash/error reporting (Sentry) before public launch
- [ ] Offline queue for saves (records currently require a connection)
- [ ] PDF export styling (ExportScreen currently produces plain text)
