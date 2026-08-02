// Distance-based fares use graduated (marginal) per-mile pricing.
// Miles up to DISTANCE_TIER_BREAKPOINT_MI are billed at the vehicle's base rate
// (distancePriceMultiplier); miles beyond it at the vehicle's extended rate
// (distancePriceMultiplierBeyond). Client baseline: $4.50 up to 50 mi, $5.50 after.
export const DISTANCE_TIER_BREAKPOINT_MI = 50;
export const DEFAULT_DISTANCE_RATE_PER_MI = 4.5; // 0–50 mi
export const DEFAULT_DISTANCE_RATE_BEYOND_PER_MI = 5.5; // beyond 50 mi
