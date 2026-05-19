import { z } from "zod";
import { createValidationSchema } from "@/middlewares";
import {
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
  MAX_SUBJECT_LENGTH,
} from "@/models";

export const emailSubscriptionSchema = createValidationSchema({
  body: {
    email: z.string().trim().toLowerCase().email(),
  },
});

export const supportContactSchema = createValidationSchema({
  body: {
    fullName: z.string().nonempty().max(MAX_NAME_LENGTH),
    email: z.string().trim().toLowerCase().email(),
    subject: z.string().nonempty().max(MAX_SUBJECT_LENGTH),
    message: z.string().max(MAX_MESSAGE_LENGTH),
  },
});
