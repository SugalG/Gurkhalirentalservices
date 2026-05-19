import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

// infer zod schema type
type InferSchemaType<T> = T extends z.ZodObject<infer R>
  ? {
      [K in keyof R]: R[K] extends z.ZodType ? z.infer<R[K]> : never;
    }
  : never;

export type ValidatedRequest<
  T extends ReturnType<typeof createValidationSchema>
> = Request & { validated: InferSchemaType<T> };

export type ValidatedAuthenticatedRequest<
  T extends ReturnType<typeof createValidationSchema>
> = ValidatedRequest<T> & AuthenticatedRequest;

export const createValidationSchema = <
  B extends z.ZodRawShape = {},
  Q extends z.ZodRawShape = {},
  P extends z.ZodRawShape = {}
>({
  body = {} as B,
  query = {} as Q,
  params = {} as P,
}: {
  body?: B;
  query?: Q;
  params?: P;
}) => {
  return z.object({
    body: z.object(body),
    query: z.object(query),
    params: z.object(params),
  });
};

export const dtoValidationMiddleware = <
  T extends ReturnType<typeof createValidationSchema>
>(
  schema: T
) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const result = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.validated = result as InferSchemaType<T>;

      next();
    } catch (error) {
      console.error(error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: error.errors,
        });
        return;
      }

      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  };
};
