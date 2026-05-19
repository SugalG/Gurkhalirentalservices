import { InferSchemaType, Schema, Types, model, Document } from "mongoose";
import {
  ClientBillingAddressModel,
  MAX_ADDRESS_LINE_LENGTH,
} from "./client-billing-address.model";
import { ClientDetailModel, MAX_NAME_LENGTH } from "./client-details.model";
import { VehicleTypeModel } from "./vehicle-type.model";

export const MAX_SPECIAL_REQUEST_LENGTH = 1024;

export enum ClientBookingStatus {
  Pending = "pending",
  Booked = "booked",
  InProgress = "in-progress",
  Completed = "completed",
  Cancelled = "cancelled",
  AdminCancelled = "admin-cancelled",
}

export enum PricingMode {
  Hourly = "hourly",
  Distance = "distance",
}

export const pointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  { _id: false }
);

export const clientBookingSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
    },
    clientDetail: {
      type: Schema.Types.ObjectId,
      ref: ClientDetailModel,
      required: true,
    },
    clientBillingAddress: {
      type: Schema.Types.ObjectId,
      ref: ClientBillingAddressModel,
      required: true,
    },
    vehicleType: {
      type: Schema.Types.ObjectId,
      ref: VehicleTypeModel,
      required: true,
    },
    originAddress: {
      type: String,
      required: true,
      trim: true,
      maxLength: MAX_ADDRESS_LINE_LENGTH,
    },
    destAddress: {
      type: String,
      trim: true,
      maxLength: MAX_ADDRESS_LINE_LENGTH,
      required: function (this: any) {
        return this.pricingMode === PricingMode.Distance;
      },
    },
    originCoordinates: {
      type: pointSchema,
      required: true,
    },
    destCoordinates: {
      type: pointSchema,
      required: function (this: any) {
        return this.pricingMode === PricingMode.Distance;
      },
    },
    scheduleDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ClientBookingStatus),
      default: ClientBookingStatus.Pending,
    },
    pricingMode: {
      type: String,
      required: true,
      enum: Object.values(PricingMode),
    },
    estimatedFare: {
      type: Number,
      min: 0,
      required: true,
    },
    distanceMi: {
      type: Number,
      min: 0,
      default: undefined,
      required: function (this: any) {
        return this.pricingMode == PricingMode.Distance;
      },
    },
    durationHourly: {
      type: Number,
      min: 0,
      default: undefined,
      required: function (this: any) {
        return this.pricingMode == PricingMode.Hourly;
      },
    },
    specialRequests: {
      type: String,
      trim: true,
      maxLength: MAX_SPECIAL_REQUEST_LENGTH,
    },
    meetAndGreet: {
      type: Boolean,
      default: false,
    },
    meetName: {
      type: String,
      trim: true,
      maxLength: MAX_NAME_LENGTH,
    },
  },
  {
    timestamps: true,
  }
);

export type ClientBooking = InferSchemaType<typeof clientBookingSchema> & {
  _id: Types.ObjectId;
};
export type ClientBookingDocument = ClientBooking & Document;
export const ClientBookingModel = model<ClientBookingDocument>(
  "client-bookings",
  clientBookingSchema
);
