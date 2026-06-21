/**
 * Subscription gate for Caselog. App talks to this module, never to RevenueCat
 * directly. Default export is a MOCK so the app runs before billing exists.
 * To go live, fill in ./revenuecat and swap the export. See BUILD_TO_MVP.md.
 */

export const ENTITLEMENT_ID = "premium";

export interface SubscriptionApi {
  isSubscribed(): Promise<boolean>;
  getOfferings(): Promise<{ id: string; priceString: string; period: string }[]>;
  purchase(packageId: string): Promise<boolean>;
  restore(): Promise<boolean>;
}

let mockSubscribed = false;

const mock: SubscriptionApi = {
  async isSubscribed() {
    return mockSubscribed;
  },
  async getOfferings() {
    return [
      { id: "monthly", priceString: "$9.99", period: "month" },
      { id: "annual", priceString: "$69.00", period: "year" },
    ];
  },
  async purchase() {
    mockSubscribed = true;
    return true;
  },
  async restore() {
    return mockSubscribed;
  },
};

export const subscriptions: SubscriptionApi = mock;
