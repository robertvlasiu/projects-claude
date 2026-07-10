import { Linking, Platform } from 'react-native';
import type {
  CustomerInfo,
  CustomerInfoUpdateListener,
  PurchasesError,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

/** True when running inside the Expo Go client. */
export function isExpoGo(): boolean {
  try {
    const Constants = require('expo-constants').default;
    return Constants.appOwnership === 'expo';
  } catch {
    return false;
  }
}

const API_KEY =
  Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
  }) ?? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

/** RevenueCat public SDK keys are platform-specific on native builds. */
function isNativeStoreApiKey(key: string | undefined): boolean {
  if (!key) return false;
  if (Platform.OS === 'ios') return key.startsWith('appl_');
  if (Platform.OS === 'android') return key.startsWith('goog_');
  return false;
}

/** Expo Go + RevenueCat Test Store key — simulated purchases via RC test modal. */
export function isTestStoreMode(): boolean {
  return isExpoGo() && !!API_KEY?.startsWith('test_');
}

/** Real App Store / Play billing (native build only). */
export function storeBillingSupported(): boolean {
  return Platform.OS !== 'web' && !isExpoGo() && !!API_KEY;
}

/** RevenueCat SDK can initialize (native build or Expo Go test store). */
export function revenueCatEnabled(): boolean {
  if (Platform.OS === 'web' || !API_KEY) return false;
  if (isExpoGo()) return isTestStoreMode();
  // Test Store keys (test_*) only work in Expo Go — native builds need appl_/goog_ keys.
  return isNativeStoreApiKey(API_KEY);
}

/**
 * Subscription/billing layer on top of RevenueCat (react-native-purchases + react-native-purchases-ui).
 *
 * Payments go through the platform stores — the Apple payment sheet on iOS and
 * Google Play billing on Android — which is required by both stores for digital
 * subscriptions.
 *
 * Degrades gracefully: in Expo Go, on web, or without an API key configured,
 * `billingAvailable()` is false and the paywall shows a setup notice instead.
 * Native builds need RevenueCat keys in `.env` (see `.env.example`).
 */

/** Must match the entitlement identifier in RevenueCat → Project → Entitlements. */
export const ENTITLEMENT_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? 'Auris - Divorce Management Pro';

/** Human-readable name shown in the app UI. */
export const ENTITLEMENT_DISPLAY_NAME = 'Auris Pro';

/** Store product identifiers — must match App Store Connect / Play Console + RevenueCat. */
export const PRODUCT_IDS = {
  monthly: 'auris_pro_monthly',
  yearly: 'auris_pro_yearly',
} as const;

/** Introductory free trial length configured in App Store Connect (for UI copy only). */
export const STORE_TRIAL_DAYS = 3;

/** @deprecated Use ENTITLEMENT_ID */
export const ENTITLEMENT = ENTITLEMENT_ID;

export type SubPackage = {
  id: string;
  title: string;
  priceString: string;
  periodLabel: string;
  productId: string;
  raw: PurchasesPackage;
};

export type SubStatus = {
  active: boolean;
  expiresAt: string | null;
  willRenew: boolean;
  managementUrl: string | null;
  productIdentifier: string | null;
  inTrial: boolean;
};

export type PurchaseResult = 'purchased' | 'cancelled' | 'error';

/** Purchase result, or a user-facing error message string. */
export type PurchaseOutcome = PurchaseResult | (string & {});

type PurchasesModule = typeof import('react-native-purchases').default;
type RevenueCatUIModule = typeof import('react-native-purchases-ui').default;
type PaywallResult = import('react-native-purchases-ui').PAYWALL_RESULT;

let purchasesModule: PurchasesModule | null = null;
let revenueCatUIModule: RevenueCatUIModule | null = null;
let configured = false;
let customerInfoListener: CustomerInfoUpdateListener | null = null;
let customerInfoListeners = new Set<(info: CustomerInfo) => void>();

function getPurchases(): PurchasesModule | null {
  if (!revenueCatEnabled()) return null;
  if (!purchasesModule) {
    try {
      purchasesModule = require('react-native-purchases').default;
    } catch {
      return null;
    }
  }
  return purchasesModule;
}

function getRevenueCatUI(): RevenueCatUIModule | null {
  if (!storeBillingSupported()) return null;
  if (!revenueCatUIModule) {
    try {
      revenueCatUIModule = require('react-native-purchases-ui').default;
    } catch {
      return null;
    }
  }
  return revenueCatUIModule;
}

export function billingAvailable(): boolean {
  return configured && revenueCatEnabled();
}

export function isEntitlementActive(info: CustomerInfo | null | undefined): boolean {
  return !!info?.entitlements?.active?.[ENTITLEMENT_ID];
}

function customerInfoToStatus(info: CustomerInfo | null | undefined): SubStatus {
  const empty: SubStatus = {
    active: false,
    expiresAt: null,
    willRenew: false,
    managementUrl: info?.managementURL ?? null,
    productIdentifier: null,
    inTrial: false,
  };
  const ent = info?.entitlements?.active?.[ENTITLEMENT_ID];
  if (!ent) return empty;
  return {
    active: true,
    expiresAt: ent.expirationDate ?? null,
    willRenew: ent.willRenew ?? false,
    managementUrl: info?.managementURL ?? null,
    productIdentifier: ent.productIdentifier ?? null,
    inTrial: ent.periodType === 'TRIAL',
  };
}

function periodLabel(packageType: string): string {
  switch (packageType) {
    case 'MONTHLY':
      return 'month';
    case 'ANNUAL':
      return 'year';
    case 'WEEKLY':
      return 'week';
    default:
      return '';
  }
}

/** User-facing plan card copy — prices come from the store via RevenueCat. */
export function planDisplayInfo(pkg: SubPackage): {
  name: string;
  trialLine: string;
  priceLine: string;
} {
  const isYearly =
    pkg.raw.packageType === 'ANNUAL' ||
    /yearly|annual/i.test(pkg.productId) ||
    /yearly|annual/i.test(pkg.id);
  const name = isYearly ? 'Yearly' : 'Monthly';
  const period = isYearly ? 'year' : 'month';
  return {
    name,
    trialLine: `${STORE_TRIAL_DAYS}-day free trial`,
    priceLine: `Then ${pkg.priceString}/${period}`,
  };
}

export async function getPackages(): Promise<SubPackage[]> {
  const offering = await getCurrentOffering();
  const pkgs = (offering?.availablePackages ?? []).filter(
    p => p.packageType !== 'LIFETIME' && !/lifetime/i.test(p.product.identifier),
  );
  return pkgs.map(p => {
    const info = planDisplayInfo({
      id: p.identifier,
      title: '',
      priceString: p.product.priceString,
      periodLabel: periodLabel(p.packageType),
      productId: p.product.identifier,
      raw: p,
    });
    return {
      id: p.identifier,
      title: info.name,
      priceString: p.product.priceString,
      periodLabel: periodLabel(p.packageType),
      productId: p.product.identifier,
      raw: p,
    };
  });
}

function purchaseErrorMessage(error: unknown): string {
  const e = error as PurchasesError | undefined;
  if (e?.userCancelled) return 'cancelled';
  try {
    const { PURCHASES_ERROR_CODE } = require('react-native-purchases') as typeof import('react-native-purchases');
    if (e?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return 'cancelled';
    if (e?.code === PURCHASES_ERROR_CODE.NETWORK_ERROR) {
      return 'Network error. Check your connection and try again.';
    }
    if (e?.code === PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR) {
      return 'The app store is unavailable right now. Try again later.';
    }
  } catch {
    // react-native-purchases unavailable on this platform
  }
  return e?.message ?? 'Purchase failed. You were not charged.';
}

/** Safe to call multiple times. Returns whether RevenueCat billing is usable. */
export async function initBilling(appUserId?: string): Promise<boolean> {
  if (!revenueCatEnabled()) return false;
  const Purchases = getPurchases();
  if (!Purchases) return false;
  try {
    if (!configured) {
      if (__DEV__) {
        const { LOG_LEVEL } = require('react-native-purchases') as typeof import('react-native-purchases');
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }
      Purchases.configure({ apiKey: API_KEY!, appUserID: appUserId ?? null });
      configured = true;

      customerInfoListener = (info: CustomerInfo) => {
        customerInfoListeners.forEach(listener => listener(info));
      };
      Purchases.addCustomerInfoUpdateListener(customerInfoListener);
    } else if (appUserId) {
      await Purchases.logIn(appUserId);
    }
    return true;
  } catch {
    // Native module not present (Expo Go) or misconfigured key.
    return false;
  }
}

/** Subscribe to RevenueCat customer-info updates (purchase, restore, renewal, etc.). */
export function onCustomerInfoUpdated(listener: (info: CustomerInfo) => void): () => void {
  customerInfoListeners.add(listener);
  return () => customerInfoListeners.delete(listener);
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  const Purchases = getPurchases();
  if (!Purchases || !configured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  const Purchases = getPurchases();
  if (!Purchases || !configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

export async function getStatus(): Promise<SubStatus> {
  const info = await getCustomerInfo();
  return customerInfoToStatus(info);
}

/** Returns 'purchased' | 'cancelled' | an error message. */
export async function purchase(pkg: SubPackage): Promise<PurchaseOutcome> {
  const Purchases = getPurchases();
  if (!Purchases || !configured) return 'Billing is not available in this build.';
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg.raw);
    return isEntitlementActive(customerInfo) ? 'purchased' : 'cancelled';
  } catch (e) {
    const message = purchaseErrorMessage(e);
    return message === 'cancelled' ? 'cancelled' : message;
  }
}

export async function restorePurchases(): Promise<boolean> {
  const Purchases = getPurchases();
  if (!Purchases || !configured) return false;
  try {
    const info = await Purchases.restorePurchases();
    return isEntitlementActive(info);
  } catch {
    return false;
  }
}

function paywallSucceeded(result: PaywallResult): boolean {
  const RevenueCatUI = getRevenueCatUI();
  if (!RevenueCatUI) return false;
  return (
    result === RevenueCatUI.PAYWALL_RESULT.PURCHASED ||
    result === RevenueCatUI.PAYWALL_RESULT.RESTORED
  );
}

/** Present the RevenueCat-designed paywall modally. */
export async function presentPaywall(offering?: PurchasesOffering): Promise<PurchaseResult> {
  const RevenueCatUI = getRevenueCatUI();
  if (!RevenueCatUI || !configured) return 'error';
  try {
    const result = await RevenueCatUI.presentPaywall(
      offering ? { offering, displayCloseButton: true } : { displayCloseButton: true },
    );
    if (paywallSucceeded(result)) return 'purchased';
    if (result === RevenueCatUI.PAYWALL_RESULT.CANCELLED) return 'cancelled';
    return 'error';
  } catch {
    return 'error';
  }
}

/** Present paywall only when the Pro entitlement is not active. */
export async function presentPaywallIfNeeded(offering?: PurchasesOffering): Promise<PurchaseResult | 'not_needed'> {
  const RevenueCatUI = getRevenueCatUI();
  if (!RevenueCatUI || !configured) return 'error';
  try {
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: ENTITLEMENT_ID,
      ...(offering ? { offering, displayCloseButton: true } : { displayCloseButton: true }),
    });
    if (result === RevenueCatUI.PAYWALL_RESULT.NOT_PRESENTED) return 'not_needed';
    if (paywallSucceeded(result)) return 'purchased';
    if (result === RevenueCatUI.PAYWALL_RESULT.CANCELLED) return 'cancelled';
    return 'error';
  } catch {
    return 'error';
  }
}

/** Open RevenueCat Customer Center (manage plan, restore, refunds on iOS). */
export async function presentCustomerCenter(
  onUpdated?: (info: CustomerInfo) => void,
): Promise<boolean> {
  const RevenueCatUI = getRevenueCatUI();
  if (!RevenueCatUI || !configured) return false;
  try {
    await RevenueCatUI.presentCustomerCenter({
      callbacks: {
        onRestoreCompleted: ({ customerInfo }) => onUpdated?.(customerInfo),
        onRestoreFailed: ({ error }) => {
          if (__DEV__) console.warn('[RevenueCat] restore failed', error.message);
        },
      },
    });
    return true;
  } catch {
    return false;
  }
}

/** Cancellation happens in the store — open its subscription management page. */
export async function openManageSubscriptions(managementUrl?: string | null) {
  const opened = await presentCustomerCenter();
  if (opened) return;

  const fallback =
    Platform.OS === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions';
  try {
    await Linking.openURL(managementUrl || fallback);
  } catch {
    await Linking.openURL(fallback);
  }
}

/** Lazy accessor for embedding `<RevenueCatUI.Paywall />` in React screens. */
export function getPaywallComponent(): RevenueCatUIModule['Paywall'] | null {
  return getRevenueCatUI()?.Paywall ?? null;
}

/** Lazy accessor for embedding `<RevenueCatUI.CustomerCenterView />`. */
export function getCustomerCenterComponent(): RevenueCatUIModule['CustomerCenterView'] | null {
  return getRevenueCatUI()?.CustomerCenterView ?? null;
}
