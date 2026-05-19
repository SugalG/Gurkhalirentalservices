import { Types } from "mongoose";
import { AppError } from "@/middlewares";
import { PricingMode } from "@/models";
import { getVehicleType } from "@/services";

// todo [aayush]: consult with the client for the price formula
export function calculateCostByHour(hour: number, priceMultiplier: number) {
  return Number((hour * priceMultiplier).toFixed(2));
}

// todo [aayush]: consult with the client for the price formula
export function calculateCostByDistanceMi(
  distanceMi: number,
  priceMultiplier: number
) {
  return Number((distanceMi * priceMultiplier).toFixed(2));
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
        vehicleType.distancePriceMultiplier
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
