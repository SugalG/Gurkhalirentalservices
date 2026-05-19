import { Router } from "express";
import {
  cancelBookingController,
  changeBookingStatusController,
  completeBookingOrderController,
  completeUpdateBookingDetailsController,
  createBookingOrderController,
  forceCancelBookingController,
  getBookingController,
  getBookingOverviewController,
  getBookingPricingController,
  getBookingsController,
  updateBookingDetailsController,
} from "@/controllers";
import {
  bookingFilterSchema,
  bookingIdSchema,
  bookingStatusSchema,
  bookingTransactionSchema,
  createBookingOrderSchema,
  pricingSchema,
  updateBookingOrderSchema,
} from "@/dtos";
import {
  authenticationMiddleware,
  dtoValidationMiddleware,
  tryCatchWrapper,
} from "@/middlewares";

export const bookingRouter = Router();

bookingRouter.get(
  "/overview",
  authenticationMiddleware,
  tryCatchWrapper(getBookingOverviewController)
);
bookingRouter.post(
  "/pricing/estimated-fare",
  dtoValidationMiddleware(pricingSchema),
  tryCatchWrapper(getBookingPricingController)
);
bookingRouter.post(
  "/create-order",
  dtoValidationMiddleware(createBookingOrderSchema),
  tryCatchWrapper(createBookingOrderController)
);
bookingRouter.patch(
  "/:id/complete-order",
  dtoValidationMiddleware(bookingIdSchema),
  tryCatchWrapper(completeBookingOrderController)
);
bookingRouter.patch(
  "/:id",
  dtoValidationMiddleware(updateBookingOrderSchema),
  tryCatchWrapper(updateBookingDetailsController)
);
bookingRouter.patch(
  "/:id/transaction/:txId/complete-update-order",
  dtoValidationMiddleware(bookingTransactionSchema),
  tryCatchWrapper(completeUpdateBookingDetailsController)
);
// todo: maybe split into 2 action flows: request -> approve/reject [gives time for business decision]
bookingRouter.patch(
  "/:id/cancel",
  dtoValidationMiddleware(bookingIdSchema),
  tryCatchWrapper(cancelBookingController)
);
bookingRouter.patch(
  "/:id/cancel/force",
  authenticationMiddleware,
  dtoValidationMiddleware(bookingIdSchema),
  tryCatchWrapper(forceCancelBookingController)
);
bookingRouter.get(
  "/",
  authenticationMiddleware,
  dtoValidationMiddleware(bookingFilterSchema),
  tryCatchWrapper(getBookingsController)
);
bookingRouter.get(
  "/:id",
  dtoValidationMiddleware(bookingIdSchema),
  tryCatchWrapper(getBookingController)
);
bookingRouter.patch(
  "/:id/change-status",
  authenticationMiddleware,
  dtoValidationMiddleware(bookingStatusSchema),
  tryCatchWrapper(changeBookingStatusController)
);
