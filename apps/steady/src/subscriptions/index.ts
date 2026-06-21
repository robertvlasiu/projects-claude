/**
 * Subscription gate for Steady.
 *
 * The app talks to this module, never to RevenueCat directly, so screens can
 * render and be tested before billing exists. Default export is a MOCK that
 * grants/denies entitlement from memory. To go live, follow BUILD_TO_MVP.md →
 * "Wire RevenueCat" and swap `subscriptions` to the real implementation in
 * ./revenuecat.
 */

export const ENTITLEMENT_ID = "premium";

export interface SubscriptionApi {
  /** True if the user currently has premium access. */
  isSubscribed(): Promise<boolean>;
  /** Present available packages (mock returns canned data). */
  getOfferings(): Promise<{ id: string; priceString: string; period: string }[]>;
  /** Begin purchase of a package id; resolves true on success. */
  purchase(packageId: string): Promise<boolean>;
  /** Restore prior purchases. */
  restore(): Promise<boolean>;
}

let mockSubscribed = false;

const mock: SubscriptionApi = {
  async isSubscribed() {
    return mockSubscribed;
  },
  async getOfferings() {
    return [
      { id: "monthly", priceString: "$12.99", period: "month" },
      { id: "annual", priceString: "$79.00", period: "year" },
    ];
  },
  async purchase() {
    mockSubscribed = true; // simulate success in dev
    return true;
  },
  async restore() {
    return mockSubscribed;
  },
};

// Swap this to the real RevenueCat implementation for production.
export const subscriptions: SubscriptionApi = mock;
