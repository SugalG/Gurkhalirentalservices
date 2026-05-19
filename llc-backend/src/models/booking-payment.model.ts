import { InferSchemaType, Schema, Types, model, Document } from "mongoose";
import { ClientBookingModel } from "./client-bookings.model";

export enum PaymentMethod {
  Paypal = "paypal",
}

export enum PaymentStatus {
  Pending = "pending",
  Completed = "completed",
  Failed = "failed",
  Refunded = "refunded",
  PartiallyRefunded = "partially-refunded",
}

export const bookingPaymentSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
    },
    bookingDetail: {
      type: Schema.Types.ObjectId,
      ref: ClientBookingModel,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
      enum: Object.values(PaymentMethod),
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
    },
    paymentMetadata: {
      type: Schema.Types.Mixed, // usually an object
      required: false,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.Pending,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export type BookingPaymentDetail = InferSchemaType<
  typeof bookingPaymentSchema
> & {
  _id: Types.ObjectId;
};
export type BookingPaymentDetailDocument = BookingPaymentDetail & Document;
export const BookingPaymentModel = model(
  "booking-payments",
  bookingPaymentSchema
);
