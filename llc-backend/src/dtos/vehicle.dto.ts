import { z } from "zod";
import { createValidationSchema } from "@/middlewares";
import {
  MAX_VEHICLE_DESCRIPTION_LENGTH,
  MAX_VEHICLE_FEATURES_LENGTH,
  MAX_VEHICLE_MEDIA_LINK,
  MAX_VEHICLE_NAME_LENGTH,
  MAX_VEHICLE_PLATE_NUMBER_LENGTH,
  VehicleCategory,
  VehicleFuelType,
} from "@/models";
import { isObjectId } from "@/utils";

export const createVehicleTypeSchema = createValidationSchema({
  body: {
    name: z.string().trim().nonempty().max(MAX_VEHICLE_NAME_LENGTH),
    description: z
      .string()
      .trim()
      .max(MAX_VEHICLE_DESCRIPTION_LENGTH)
      .optional(),
    photo: z.string().trim().max(MAX_VEHICLE_MEDIA_LINK).optional(),
    vehiclePlateNumber: z
      .string()
      .trim()
      .nonempty()
      .max(MAX_VEHICLE_PLATE_NUMBER_LENGTH),
    category: z.enum(Object.values(VehicleCategory) as [string, ...string[]]),
    features: z
      .array(z.string().trim().max(MAX_VEHICLE_FEATURES_LENGTH))
      .optional(),
    distancePriceMultiplier: z.number().min(0),
    hourlyPriceMultiplier: z.number().min(0),
    maxOccupancy: z.number().min(0),
    maxStorageCapacityLtr: z.number().min(0).optional(),
    maxSuitcaseCapacityKg: z.number().min(0).optional(),
    maxEstimatedDistanceCoverageMi: z.number().min(0).optional(),
    fuelType: z.enum(Object.values(VehicleFuelType) as [string, ...string[]]),
    availabilityStatus: z.boolean().optional(),
  },
});

export const updateVehicleTypeSchema = createValidationSchema({
  params: {
    id: z
      .string()
      .trim()
      .nonempty()
      .refine((data) => isObjectId(data), "Invalid vehicle type id"),
  },
  body: {
    name: z.string().trim().nonempty().max(MAX_VEHICLE_NAME_LENGTH).optional(),
    description: z
      .string()
      .trim()
      .max(MAX_VEHICLE_DESCRIPTION_LENGTH)
      .optional(),
    photo: z.string().trim().max(MAX_VEHICLE_MEDIA_LINK).optional(),
    vehiclePlateNumber: z
      .string()
      .trim()
      .nonempty()
      .max(MAX_VEHICLE_PLATE_NUMBER_LENGTH)
      .optional(),
    category: z
      .enum(Object.values(VehicleCategory) as [string, ...string[]])
      .optional(),
    features: z
      .array(z.string().trim().max(MAX_VEHICLE_FEATURES_LENGTH))
      .optional(),
    distancePriceMultiplier: z.number().min(0).optional(),
    hourlyPriceMultiplier: z.number().min(0).optional(),
    maxOccupancy: z.number().min(0).optional(),
    maxStorageCapacityLtr: z.number().min(0).optional(),
    maxSuitcaseCapacityKg: z.number().min(0).optional(),
    maxEstimatedDistanceCoverageMi: z.number().min(0).optional(),
    fuelType: z
      .enum(Object.values(VehicleFuelType) as [string, ...string[]])
      .optional(),
    availabilityStatus: z.boolean().optional(),
  },
});

export const vehicleTypeIdSchema = createValidationSchema({
  params: {
    id: z
      .string()
      .trim()
      .nonempty()
      .refine((data) => isObjectId(data), "Invalid vehicle type id"),
  },
});

export const vehicleTypeFilterSchema = createValidationSchema({
  query: {
    // filters
    scheduleDate: z.coerce.date().optional(),
    category: z
      .enum(Object.values(VehicleCategory) as [string, ...string[]])
      .optional(),
    fuelType: z
      .enum(Object.values(VehicleFuelType) as [string, ...string[]])
      .optional(),
    availabilityStatus: z
      .enum(["true", "false"])
      .transform((value) => value === "true"),

    // returns result with the field value as lower bounds
    occupancy: z.coerce.number().min(1).optional(),
    suitcaseCapacity: z.coerce.number().min(1).optional(),
    estimatedDistanceCoverageMi: z.coerce.number().min(1).optional(),

    // search params
    id: z
      .string()
      .trim()
      .nonempty()
      .refine((data) => isObjectId(data), "Invalid vehicle type id")
      .optional(),

    // pagination
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).optional(),
  },
});
