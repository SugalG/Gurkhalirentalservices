import { z } from "zod";
import { createValidationSchema } from "@/middlewares";
import { PaymentMethod, PaymentStatus } from "@/models/booking-payment.model";
import { isObjectId } from "@/utils";

export const paymentIdSchema = createValidationSchema({
  params: {
    id: z
      .string()
      .trim()
      .nonempty()
      .refine((data) => isObjectId(data), "Invalid vehicle type id"),
  },
});

export const paymentStatusSchema = createValidationSchema({
  params: {
    id: z
      .string()
      .trim()
      .nonempty()
      .refine((data) => isObjectId(data), "Invalid vehicle type id"),
  },
  body: {
    status: z
      .enum(Object.values(PaymentStatus) as [string, ...string[]])
      .optional(),
  },
});

export const paymentFilterSchema = createValidationSchema({
  query: {
    // filters
    status: z
      .enum(Object.values(PaymentStatus) as [string, ...string[]])
      .optional(),
    paymentMethod: z
      .enum(Object.values(PaymentMethod) as [string, ...string[]])
      .optional(),
    paymentFrom: z.coerce.date().optional(),
    paymentTo: z.coerce.date().optional(),

    // search params
    id: z
      .string()
      .trim()
      .nonempty()
      .refine((data) => isObjectId(data), "Invalid vehicle type id")
      .optional(),
    bookingId: z
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
