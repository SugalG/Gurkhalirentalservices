import { Document, InferSchemaType, Schema, Types, model } from "mongoose";
import { clientDetailSchema } from "./client-details.model";
import { clientBillingAddressSchema } from "./client-billing-address.model";
import { clientBookingSchema } from "./client-bookings.model";
import { bookingPaymentSchema } from "./booking-payment.model";

export const tempClientBookingSchema = new Schema(
  {
    personalDetails: {
      type: clientDetailSchema,
      required: true,
    },
    billingAddress: {
      type: clientBillingAddressSchema,
      required: true,
    },
    bookingDetails: {
      type: clientBookingSchema,
      required: true,
    },
    paymentDetails: {
      type: bookingPaymentSchema,
      required: false,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

tempClientBookingSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 1296000 }
);

export type TempClientBooking = InferSchemaType<
  typeof tempClientBookingSchema
> & {
  _id: Types.ObjectId;
};
export type TempClientBookingDocument = TempClientBooking & Document;
export const TempClientBookingModel = model<TempClientBookingDocument>(
  "temp-client-bookings",
  tempClientBookingSchema
);
