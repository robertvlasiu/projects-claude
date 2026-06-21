/**
 * Real RevenueCat implementation (stub). Fill in, then change the export in
 * ./index.ts from `mock` to `revenueCat`. Keep the SubscriptionApi shape.
 *
 * Products: $9.99/mo and $69/yr. Entitlement id "premium".
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
