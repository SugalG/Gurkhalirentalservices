import { Router } from "express";
import {
  changePaymentStatusController,
  getPaymentController,
  getPaymentsController,
} from "@/controllers/payment.controller";
import {
  paymentFilterSchema,
  paymentIdSchema,
  paymentStatusSchema,
} from "@/dtos";
import { dtoValidationMiddleware, tryCatchWrapper } from "@/middlewares";

export const paymentRouter = Router();

paymentRouter.get(
  "/",
  dtoValidationMiddleware(paymentFilterSchema),
  tryCatchWrapper(getPaymentsController)
);
paymentRouter.get(
  "/:id",
  dtoValidationMiddleware(paymentIdSchema),
  tryCatchWrapper(getPaymentController)
);
paymentRouter.patch(
  "/:id/change-status",
  dtoValidationMiddleware(paymentStatusSchema),
  tryCatchWrapper(changePaymentStatusController)
);
