/**
 * Real RevenueCat implementation (stub).
 *
 * Fill this in during the "Wire RevenueCat" task, then change the export in
 * ./index.ts from `mock` to `revenueCat`. Keep the SubscriptionApi shape so no
 * screen code changes.
 *
 * Setup checklist (BUILD_TO_MVP.md has the full version):
 *  1. Create a RevenueCat project; add iOS + Android apps.
 *  2. Create an entitlement called "premium" (see ENTITLEMENT_ID).
 *  3. Create products $12.99/mo and $79/yr in App Store Connect + Play Console.
 *  4. Put the public SDK keys in app config / env and read them below.
 */
import Purchases from "react-native-purchases";
import { ENTITLEMENT_ID, type SubscriptionApi } from "./index";

export function configureRevenueCat(apiKey: string, appUserId?: string) {
  Purchases.configure({ apiKey, appUserID: appUserId });
}

export const revenueCat: SubscriptionApi = {
  async isSubscribed() {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  },
  async getOfferings() {
    const offerings = await Purchases.getOfferings();
    const pkgs = offerings.current?.availablePackages ?? [];
    return pkgs.map((p) => ({
      id: p.identifier,
      priceString: p.product.priceString,
      period: p.packageType,
    }));
  },
  async purchase(packageId: string) {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (p) => p.identifier === packageId
    );
    if (!pkg) return false;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  },
  async restore() {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  },
};
