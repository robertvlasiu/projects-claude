import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CustomerInfo } from 'react-native-purchases';
import {
  ENTITLEMENT_ID,
  SubStatus,
  billingAvailable,
  getStatus,
  initBilling,
  isEntitlementActive,
  onCustomerInfoUpdated,
  revenueCatEnabled,
  presentCustomerCenter,
  presentPaywall,
  presentPaywallIfNeeded,
} from '../lib/subscription';

type SubscriptionContextValue = {
  ready: boolean;
  available: boolean;
  isPro: boolean;
  hasAccess: boolean;
  status: SubStatus | null;
  refresh: () => Promise<void>;
  presentPaywall: () => Promise<'purchased' | 'cancelled' | 'error'>;
  presentPaywallIfNeeded: () => Promise<'purchased' | 'cancelled' | 'error' | 'not_needed'>;
  openCustomerCenter: () => Promise<boolean>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({
  userId,
  children,
}: {
  userId: string | null;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState<SubStatus | null>(null);

  const applyCustomerInfo = useCallback((info: CustomerInfo) => {
    const ent = info.entitlements.active[ENTITLEMENT_ID];
    setStatus({
      active: isEntitlementActive(info),
      expiresAt: ent?.expirationDate ?? null,
      willRenew: ent?.willRenew ?? false,
      managementUrl: info.managementURL ?? null,
      productIdentifier: ent?.productIdentifier ?? null,
      inTrial: ent?.periodType === 'TRIAL',
    });
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) {
      setAvailable(false);
      setStatus(null);
      setReady(true);
      return;
    }

    const ok = await initBilling(userId);
    const usable = ok && billingAvailable();
    setAvailable(usable);
    if (usable) {
      setStatus(await getStatus());
    } else {
      setStatus(null);
    }
    setReady(true);
  }, [userId]);

  useEffect(() => {
    setReady(false);
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!available) return;
    return onCustomerInfoUpdated(applyCustomerInfo);
  }, [available, applyCustomerInfo]);

  const isPro = !!status?.active;
  // Bypass paywall only when this build has no billing configured at all
  // (web, missing key, or Expo Go without a test key). If billing IS
  // configured but `initBilling` failed at runtime, fail closed — show the
  // paywall's "unable to load" state instead of granting free access.
  const billingSupported = revenueCatEnabled();
  const hasAccess = isPro || !billingSupported;

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      ready,
      available,
      isPro,
      hasAccess,
      status,
      refresh,
      presentPaywall: () => presentPaywall(),
      presentPaywallIfNeeded: () => presentPaywallIfNeeded(),
      openCustomerCenter: () =>
        presentCustomerCenter(info => {
          applyCustomerInfo(info);
        }),
    }),
    [ready, available, isPro, hasAccess, status, refresh, applyCustomerInfo],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return ctx;
}
