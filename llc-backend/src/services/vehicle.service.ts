import { Types } from "mongoose";
import {
  VehicleCategory,
  VehicleFuelType,
  VehicleTypeDocument,
  VehicleTypeModel,
} from "@/models";
import { AppError } from "@/middlewares";
import {
  VehicleOverviewPipeline,
  vehicleOverviewPipeline,
} from "@/mongo-pipelines/vehicle-overview.pipeline";

/**
 * Retrieves a vehicle type by its ID.
 *
 * @param {Types.ObjectId} id - The ID of the vehicle type to retrieve.
 * @returns {Promise<VehicleTypeDocument>} A promise that resolves to the vehicle type document.
 * @throws {AppError} If the vehicle type is not found.
 */
export async function getVehicleType(
  id: Types.ObjectId
): Promise<VehicleTypeDocument> {
  const vehicleType = await VehicleTypeModel.findOne({
    _id: id,
  });
  if (!vehicleType)
    throw new AppError(`Vehicle ${vehicleType} not found!`, 404);

  // todo [aayush]: implement cache, this will be frequently used
  return vehicleType;
}

export async function checkVehicleAvailability(
  id: Types.ObjectId
): Promise<boolean> {
  try {
    const vehicleType = await getVehicleType(id);
    return Boolean(vehicleType.availabilityStatus);
  } catch {
    return false;
  }
}

export async function getVehicleOverview() {
  const pipeline = vehicleOverviewPipeline();
  const result = (
    await VehicleTypeModel.aggregate<VehicleOverviewPipeline>(pipeline)
  )[0];

  const { availabilityStatus, category, fuelType } = result;
  (["available", "maintenance"] as const).forEach((status) => {
    const entry = availabilityStatus.some((x) => x.status === status);
    if (!entry) {
      availabilityStatus.push({
        status: status,
        count: 0,
      });
    }
  });
  Object.values(VehicleFuelType).forEach((fuel) => {
    const entry = fuelType.some((x) => x.fuelType === fuel);
    if (!entry) {
      fuelType.push({
        fuelType: fuel,
        count: 0,
      });
    }
  });
  Object.values(VehicleCategory).forEach((categoryType) => {
    const entry = category.some((x) => x.category === categoryType);
    if (!entry) {
      category.push({
        category: categoryType,
        count: 0,
      });
    }
  });

  return { availabilityStatus, fuelType, category };
}
