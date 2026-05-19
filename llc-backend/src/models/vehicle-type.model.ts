import { InferSchemaType, Schema, Types, model, Document } from "mongoose";

export const MAX_VEHICLE_NAME_LENGTH = 100;
export const MAX_VEHICLE_PLATE_NUMBER_LENGTH = 50;
export const MAX_VEHICLE_DESCRIPTION_LENGTH = 1024;
export const MAX_VEHICLE_MEDIA_LINK = 1024;
export const MAX_VEHICLE_FEATURES_LENGTH = 1024;

export enum VehicleCategory {
  Economy = "economy",
  Luxury = "luxury",
}

export enum VehicleFuelType {
  Gas = "gas",
  Electric = "electric",
}

const vehicleTypeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: MAX_VEHICLE_NAME_LENGTH,
      unique: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxLength: MAX_VEHICLE_DESCRIPTION_LENGTH,
    },
    photo: {
      type: String,
      required: false,
      trim: true,
      maxLength: MAX_VEHICLE_MEDIA_LINK,
    },
    thumbnail: {
      type: String,
      required: false,
      trim: true,
      maxLength: MAX_VEHICLE_MEDIA_LINK,
    },
    vehiclePlateNumber: {
      type: String,
      required: true,
      trim: true,
      maxLength: MAX_VEHICLE_PLATE_NUMBER_LENGTH,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      enum: Object.values(VehicleCategory),
    },
    features: {
      type: [String],
      required: false,
      default: [],
    },
    maxOccupancy: {
      type: Number,
      required: true,
      min: 0,
    },
    maxStorageCapacityLtr: {
      type: Number,
      required: false,
      min: 0,
    },
    maxSuitcaseCapacity: {
      type: Number,
      required: false,
      min: 0,
    },
    maxEstimatedDistanceCoverageMi: {
      type: Number,
      required: false,
      min: 0,
    },
    distancePriceMultiplier: {
      type: Number,
      required: true,
      min: 0,
    },
    hourlyPriceMultiplier: {
      type: Number,
      required: true,
      min: 0,
    },
    fuelType: {
      type: String,
      enum: Object.values(VehicleFuelType),
      required: false,
      default: undefined,
    },
    availabilityStatus: {
      type: Boolean,
      required: false,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export type VehicleType = InferSchemaType<typeof vehicleTypeSchema> & {
  _id: Types.ObjectId;
};
export type VehicleTypeDocument = VehicleType & Document;
export const VehicleTypeModel = model("vehicle-types", vehicleTypeSchema);
