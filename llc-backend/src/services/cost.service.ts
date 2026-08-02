import { Types } from "mongoose";
import { DISTANCE_TIER_BREAKPOINT_MI } from "@/constants";
import { AppError } from "@/middlewares";
import { PricingMode } from "@/models";
import { getVehicleType } from "@/services";

export function calculateCostByHour(hour: number, priceMultiplier: number) {
  return Number((hour * priceMultiplier).toFixed(2));
}

/**
 * Graduated (marginal) distance fare:
 *   - miles up to `breakpointMi` are billed at `baseRatePerMi`
 *   - miles beyond `breakpointMi` are billed at `beyondRatePerMi`
 * If a vehicle has no beyond-rate configured, the base rate applies to all
 * miles (single-rate behaviour, matching pre-tier vehicles).
 */
export function calculateCostByDistanceMi(
  distanceMi: number,
  baseRatePerMi: number,
  beyondRatePerMi?: number | null,
  breakpointMi: number = DISTANCE_TIER_BREAKPOINT_MI
) {
  const beyondRate = beyondRatePerMi ?? baseRatePerMi;
  const milesInBase = Math.min(distanceMi, breakpointMi);
  const milesBeyond = Math.max(0, distanceMi - breakpointMi);
  const cost = milesInBase * baseRatePerMi + milesBeyond * beyondRate;
  return Number(cost.toFixed(2));
}

export async function calculateEstimatedFare<
  T extends {
    pricingMode: PricingMode | string;
    distanceMi?: number | null;
    durationHourly?: number | null;
  }
>(vehicleTypeId: Types.ObjectId, bookingDetails: T): Promise<number> {
  const vehicleType = await getVehicleType(vehicleTypeId);
  if (!vehicleType)
    throw new AppError(`Vehicle ${vehicleTypeId.toString()} not found`, 400);

  const { pricingMode, distanceMi, durationHourly } = bookingDetails;
  switch (pricingMode) {
    case PricingMode.Distance:
      if (distanceMi == null) throw new AppError(`Distance is required`, 400);
      return calculateCostByDistanceMi(
        distanceMi,
        vehicleType.distancePriceMultiplier,
        vehicleType.distancePriceMultiplierBeyond
      );
    case PricingMode.Hourly:
      if (durationHourly == null)
        throw new AppError(`Duration is required`, 400);
      return calculateCostByHour(
        durationHourly,
        vehicleType.hourlyPriceMultiplier
      );
    default:
      throw new AppError(`Invalid pricing mode`, 400);
  }
}

export async function calculateDistance(
  coord_1: [number, number],
  coord_2: [number, number]
) {
  // todo [aayush]: implement distance calculation, use maps api
}
