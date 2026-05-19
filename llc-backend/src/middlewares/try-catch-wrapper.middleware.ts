import { Response, NextFunction } from "express";

// fn: express.RequestHandler
// req: express.Request | ValidatedRequest<T>
export const tryCatchWrapper = (fn: any) => {
  return (req: any, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

