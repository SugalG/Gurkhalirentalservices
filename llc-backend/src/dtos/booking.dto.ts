import { z } from "zod";
import { createValidationSchema } from "@/middlewares";
import {
  ClientBookingStatus,
  MAX_ADDRESS_LENGTH,
  MAX_ADDRESS_LINE_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PHONE_NUMBER_LENGTH,
  MAX_POSTAL_CODE_LENGTH,
  MAX_SPECIAL_REQUEST_LENGTH,
  PricingMode,
} from "@/models";
import { getObjectId, isObjectId } from "@/utils";
import { getVehicleType } from "@/services";

export type PersonalDetails = z.infer<typeof personalDetailsSchema>;
export type BillingAddress = z.infer<typeof billingAddressSchema>;
export type BookingDetails = z.infer<typeof bookingDetailsSchema>;

const coordinatesSchema = z.tuple([
  z.number().refine((value) => value >= -90 && value <= 90, {
    message: "Latitude must be between -90 and 90",
  }), // Latitude
  z.number().refine((value) => value >= -180 && value <= 180, {
    message: "Longitude must be between -180 and 180",
  }), // Longitude
]);

const personalDetailsSchema = z.object({
  fullName: z.string().trim().nonempty().max(MAX_NAME_LENGTH),
  email: z.string().trim().toLowerCase().email(),
  phoneNumber: z.string().trim().max(MAX_PHONE_NUMBER_LENGTH),
});

const billingAddressSchema = z.object({
  fullName: z.string().trim().nonempty().max(MAX_NAME_LENGTH),
  affiliation: z.string().trim().max(MAX_NAME_LENGTH).optional(),
  addressLine_1: z.string().trim().max(MAX_ADDRESS_LINE_LENGTH),
  addressLine_2: z.string().trim().max(MAX_ADDRESS_LINE_LENGTH).optional(),
  city: z.string().trim().max(MAX_ADDRESS_LENGTH),
  state: z.string().trim().max(MAX_ADDRESS_LENGTH).optional(),
  postalCode: z.string().trim().max(MAX_POSTAL_CODE_LENGTH),
  country: z.string().trim().max(MAX_ADDRESS_LENGTH),
});

// todo: maybe use discriminated union type for the 2 pricing modes
const bookingDetailsSchema = z.object({
  vehicleType: z
    .string()
    .trim()
    .nonempty()
    .refine((data) => isObjectId(data), "Invalid vehicle type id"),
  originAddress: z.string().trim().nonempty().max(MAX_ADDRESS_LINE_LENGTH),
  destAddress: z
    .string()
    .trim()
    .nonempty()
    .max(MAX_ADDRESS_LINE_LENGTH)
    .optional(),
  originCoordinates: coordinatesSchema,
  destCoordinates: coordinatesSchema.optional(),
  scheduleDate: z.coerce.date(),
  pricingMode: z.enum(Object.values(PricingMode) as [string, ...string[]]),
  durationHourly: z.number().min(0).optional(),
  specialRequests: z.string().trim().max(MAX_SPECIAL_REQUEST_LENGTH).optional(),
  meetAndGreet: z.boolean().optional(),
  meetName: z.string().trim().max(MAX_NAME_LENGTH).optional(),
});

export const createBookingOrderSchema = createValidationSchema({
  body: {
    personalDetails: personalDetailsSchema,
    billingAddress: billingAddressSchema,
    bookingDetails: bookingDetailsSchema
      .refine(
        (data) =>
          data.pricingMode === PricingMode.Distance
            ? !!data.destCoordinates
            : true,
        "Destinaion coordinates required for distance mode"
      )
      .refine(
        (data) =>
          data.pricingMode === PricingMode.Hourly
            ? !!data.durationHourly
            : true,
        "Hours required for hourly mode"
      )
      .refine((data) => {
        return data.meetAndGreet ? !!data.meetName : true;
      }, "Meet name is required when meet and greet is enabled")
      .refine(async (data) => {
        try {
          await getVehicleType(getObjectId(data.vehicleType));
          return true;
        } catch {
          return false;
        }
      }, "Vehicle type doesn't exist"),
  },
});

export const updateBookingOrderSchema = createValidationSchema({
  params: {
    id: z
      .string()
      .trim()
      .nonempty()
      .refine((data) => isObjectId(data), "Invalid vehicle type id"),
  },
  body: {
    personalDetails: personalDetailsSchema.partial().optional(),
    billingAddress: billingAddressSchema.partial().optional(),
    bookingDetails: bookingDetailsSchema
      .partial()
      .refine(
        (data) =>
          data.pricingMode === PricingMode.Distance
            ? !!data.destCoordinates
            : true,
        "Destinaion coordinates required for distance mode"
      )
      .refine(
        (data) =>
          data.pricingMode === PricingMode.Hourly
            ? !!data.durationHourly
            : true,
        "Hours required for hourly mode"
      )
      .refine(async (data) => {
        if (!data.vehicleType) return true;
        try {
          await getVehicleType(getObjectId(data.vehicleType));
          return true;
        } catch {
          return false;
        }
      }, "Vehicle type doesn't exist")
      .optional(),
  },
});

export const bookingIdSchema = createValidationSchema({
  params: {
    id: z.string().trim().nonempty(),
  },
});

export const bookingTransactionSchema = createValidationSchema({
  params: {
    id: z
      .string()
      .trim()
      .nonempty()
      .refine((data) => isObjectId(data), "Invalid booking id"),
    txId: z.string().trim().nonempty(),
  },
});

export const bookingStatusSchema = createValidationSchema({
  params: {
    id: z
      .string()
      .trim()
      .nonempty()
      .refine((data) => isObjectId(data), "Invalid vehicle type id"),
  },
  body: {
    status: z
      .enum(Object.values(ClientBookingStatus) as [string, ...string[]])
      .optional(),
  },
});

export const bookingFilterSchema = createValidationSchema({
  query: {
    // filters
    pricingMode: z
      .enum(Object.values(PricingMode) as [string, ...string[]])
      .optional(),
    bookingStatus: z
      .enum(Object.values(ClientBookingStatus) as [string, ...string[]])
      .optional(),
    scheduleFrom: z.coerce.date().optional(),
    scheduleTo: z.coerce.date().optional(),

    // search params
    id: z
      .string()
      .trim()
      .nonempty()
      .refine((data) => isObjectId(data), "Invalid vehicle type id")
      .optional(),
    email: z.string().trim().nonempty().email().optional(),
    fullName: z.string().trim().nonempty().max(MAX_NAME_LENGTH).optional(),

    // pagination
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).optional(),
  },
});

export const pricingSchema = createValidationSchema({
  body: {
    vehicleType: z
      .string()
      .trim()
      .nonempty()
      .refine((data) => isObjectId(data), "Invalid vehicle type id"),
    originCoordinates: coordinatesSchema,
    destCoordinates: coordinatesSchema.optional(),
    pricingMode: z.enum(Object.values(PricingMode) as [string, ...string[]]),
    durationHourly: z.number().min(0).optional(),
  },
});
