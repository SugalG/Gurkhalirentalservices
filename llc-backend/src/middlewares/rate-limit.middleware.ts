import rateLimit from "express-rate-limit";

export function rateLimitMiddleware(apiCount: number, windowMs: number) {
  return rateLimit({
    windowMs: windowMs,
    max: apiCount,
    standardHeaders: true,
    legacyHeaders: false,
  });
}

