import express from "express";
import { isAuthController, signinController, signupController } from "@/controllers";
import { signinSchema, signupSchema } from "@/dtos";
import { authenticationMiddleware, dtoValidationMiddleware, tryCatchWrapper } from "@/middlewares";

export const authRouter = express.Router();

// disable maybe? add user directly to db as it'll be the only user which will be adminFs
authRouter.post(
  "/signup",
  dtoValidationMiddleware(signupSchema),
  tryCatchWrapper(signupController)
);
authRouter.post(
  "/signin",
  dtoValidationMiddleware(signinSchema),
  tryCatchWrapper(signinController)
);
authRouter.get(
  "/is-auth",
  authenticationMiddleware,
  tryCatchWrapper(isAuthController)
);
