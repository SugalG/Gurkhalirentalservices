import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  ENVIRONMENT: z.enum(["production", "development"]).default("development"),
  DB_URI: z.string().nonempty(),
  DEBUG: z.coerce.boolean(),
  JWT_SECRET: z.string().nonempty(),
  PAYPAL_CLIENT_ID: z.string().nonempty(),
  PAYPAL_CLIENT_SECRET: z.string().nonempty(),
  EMAIL_HOST: z.string().nonempty(),
  EMAIL_PORT: z.coerce.number().default(587),
  EMAIL_USER: z.string().nonempty(),
  EMAIL_PASS: z.string().nonempty(),
  LLC_ADMIN_EMAIL: z.string().email().nonempty(),
  LLC_MARKETING_EMAIL: z.string().email().nonempty(),
  GOOGLE_MAPS_API_KEY: z.string().nonempty(),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error(
    "Environment variable validation error:",
    envVars.error.format()
  );
  throw new Error("Environment validation error");
}

export const config = {
  port: envVars.data.PORT,
  environment: envVars.data.ENVIRONMENT,
  dbUri: envVars.data.DB_URI,
  debug: envVars.data.DEBUG,
  jwtSecret: envVars.data.JWT_SECRET,
  paypal: {
    clientId: envVars.data.PAYPAL_CLIENT_ID,
    clientSecret: envVars.data.PAYPAL_CLIENT_SECRET,
  },
  emailProvider: {
    host: envVars.data.EMAIL_HOST,
    port: envVars.data.EMAIL_PORT,
    auth: {
      user: envVars.data.EMAIL_USER,
      pass: envVars.data.EMAIL_PASS,
    },
  },
  llcAdminEmail: envVars.data.LLC_ADMIN_EMAIL,
  llcMarketingEmail: envVars.data.LLC_MARKETING_EMAIL,
  googleMapsApiKey: envVars.data.GOOGLE_MAPS_API_KEY,
};
