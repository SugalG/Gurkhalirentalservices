import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { AppError } from "@middlewares/index";
import { verifyJwtSessionToken } from "@services/index";
import { getObjectId } from "@/utils";

export type AuthenticatedRequest = Request & {
  user: {
    _id: Types.ObjectId;
  };
};

function getSessionToken(req: Request): string {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new AppError("Session info not found.", 401);

  const [tokenKey, tokenValue] = authHeader.split(" ");
  if (tokenKey === "Bearer" && tokenValue) return tokenValue;

  throw new AppError("Session info as Bearer Token required.", 401);
}

export async function authenticationMiddleware(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const jwtSessionToken = getSessionToken(req);
    const user = verifyJwtSessionToken(jwtSessionToken);
    req.user = {
      ...user,
      _id: getObjectId(user._id),
    };

    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
}
