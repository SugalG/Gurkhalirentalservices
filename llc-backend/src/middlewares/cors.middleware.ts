import cors from "cors";
import { Request } from "express";

const allowedOrigins: Record<string, string[]> = {
  GET: ["*"],
  POST: ["*"],
  PUT: ["*"],
  PATCH: ["*"],
  DELETE: ["*"],
  OPTIONS: ["*"],
};

const getOrigins = (method: string) => {
  return allowedOrigins[method] || [];
};

const getCorsOptions = (origin: string | undefined, method: string) => {
  const allowedOriginsForMethod = getOrigins(method);

  if (allowedOriginsForMethod.includes("*")) return { origin: "*" };
  if (origin && allowedOriginsForMethod.includes(origin))
    return { origin, methods: ["GET", method] }; // todo get all the methods associated with the origin

  return { origin: false };
};

export const corsHandlerMiddleware = cors((req: Request, callback) => {
  const { origin } = req.headers;
  const method = req.method;
  const options = getCorsOptions(origin, method);

  callback(null, options);
});
