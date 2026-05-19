import { z } from "zod";
import { createValidationSchema } from "@/middlewares";
import {
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from "@/models";

export const signinSchema = createValidationSchema({
  body: {
    email: z.string().trim().toLowerCase().email(),
    password: z.string().trim(),
  },
});

export const signupSchema = createValidationSchema({
  body: {
    username: z
      .string()
      .trim()
      .min(MIN_USERNAME_LENGTH)
      .max(MAX_USERNAME_LENGTH),
    email: z.string().trim().toLowerCase().email(),
    password: z
      .string()
      .trim()
      .min(MIN_PASSWORD_LENGTH)
      .max(MAX_PASSWORD_LENGTH),
  },
});
