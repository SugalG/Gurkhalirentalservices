import { InferSchemaType, Schema, Types, model } from "mongoose";
import { ClientBookingModel } from "./client-bookings.model";
import { BookingPaymentModel } from "./booking-payment.model";

export const MAX_REFUND_REASON_LENGTH = 1024;

const bookingPaymentRefundSchema = new Schema(
  {
    paymentDetail: {
      type: Schema.Types.ObjectId,
      ref: BookingPaymentModel,
      required: true,
      index: true,
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
    reason: {
      type: String,
      required: false,
      trim: true,
      max: MAX_REFUND_REASON_LENGTH,
    },
    transactionId: {
      type: String,
      required: false,
      trim: true,
    },
    // same as payment metadata; outgoing payment from us
    refundMetadata: {
      type: Schema.Types.Mixed, // usually an object
      required: false,
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

export type BookingPaymentRefundDetail = InferSchemaType<
  typeof bookingPaymentRefundSchema
> & {
  _id: Types.ObjectId;
};

export const BookingPaymentRefundModel = model(
  "booking-payment-refunds",
  bookingPaymentRefundSchema
);
