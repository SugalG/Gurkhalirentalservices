import { config } from "@/config";
import { AxiosError, HttpStatusCode } from "axios";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatusCode.InternalServerError,
    isOperational = false
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// todo [aayush]: implement a logger
export const errorHandlerMiddleware: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const stackTrace = config.debug === true && { stackTrace: err.stack };
  console.error("Error Stack Trace", err.stack);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      status: "fail",
      ...(stackTrace),
    });
    return;
  }

  if (err instanceof AxiosError) {
    const statusCode = err.response?.status || 500;
    const message = err.response?.data || "External API Error";
    res.status(statusCode).json({
      message,
      status: "error",
      ...(stackTrace),
    });
    return;
  }

  res.status(500).json({
    message: "Internal Server Error",
    status: "error",
    ...(stackTrace),
  });
};

