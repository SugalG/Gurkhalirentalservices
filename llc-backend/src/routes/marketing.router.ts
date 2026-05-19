import { Router } from "express";
import {
  addNewEmailSubscriptionController,
  createNewSupportContactController,
  getClientOverviewController,
  getContactSupportRequestController,
  getEmailSubscriptionsController,
} from "@/controllers/marketing.controller";
import { emailSubscriptionSchema, supportContactSchema } from "@/dtos";
import {
  authenticationMiddleware,
  dtoValidationMiddleware,
  tryCatchWrapper,
} from "@/middlewares";

export const marketingRouter = Router();

marketingRouter.get(
  "/client-overview",
  authenticationMiddleware,
  tryCatchWrapper(getClientOverviewController)
);
marketingRouter.put(
  "/email-subscription",
  dtoValidationMiddleware(emailSubscriptionSchema),
  tryCatchWrapper(addNewEmailSubscriptionController)
);
marketingRouter.get(
  "/email-subscription",
  authenticationMiddleware,
  tryCatchWrapper(getEmailSubscriptionsController)
);
marketingRouter.put(
  "/support",
  dtoValidationMiddleware(supportContactSchema),
  tryCatchWrapper(createNewSupportContactController)
);
marketingRouter.get(
  "/support",
  authenticationMiddleware,
  tryCatchWrapper(getContactSupportRequestController)
);
