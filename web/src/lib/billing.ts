import { getUserTier, isPremiumUser } from "@/lib/db";

/**
 * Feature definitions and their required tiers
 */
export const FEATURES = {
  // Free tier features
  "basic_alerts": ["free", "premium"] as const,
  "watchlist": ["free", "premium"] as const,
  "signal_feed": ["free", "premium"] as const,
  
  // Premium tier features
  "realtime_signals": ["premium"] as const,
  "phone_calls": ["premium"] as const,
  "alpaca_trading": ["premium"] as const,
};

export type Feature = keyof typeof FEATURES;
export type Tier = "free" | "premium";

/**
 * Check if a user can access a specific feature based on their tier
 */
export async function canAccessFeature(
  userId: string,
  feature: Feature
): Promise<boolean> {
  const tier = await getUserTier(userId);
  const allowedTiers = FEATURES[feature];
  return (allowedTiers as readonly string[]).includes(tier);
}

/**
 * Check if user has premium access
 */
export { isPremiumUser };

/**
 * Get user's tier
 */
export { getUserTier };

/**
 * Feature gating response for API routes
 * Returns a 403 response if user doesn't have access
 */
export function featureGateResponse(feature: Feature): Response {
  const featureNames: Record<Feature, string> = {
    basic_alerts: "Basic Alerts",
    watchlist: "Watchlist",
    signal_feed: "Signal Feed",
    realtime_signals: "Real-time Signals",
    phone_calls: "Phone Call Alerts",
    alpaca_trading: "Alpaca Trading",
  };

  return new Response(
    JSON.stringify({
      error: "Premium required",
      message: `${featureNames[feature]} is only available for Premium subscribers`,
      feature,
      upgradeUrl: "/settings",
    }),
    {
      status: 403,
      headers: { "Content-Type": "application/json" },
    }
  );
}
