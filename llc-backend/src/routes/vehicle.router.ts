import { Router } from "express";
import {
  createVehicleTypeController,
  deleteVehicleTypeController,
  getVehicleOverviewController,
  getVehicleTypeController,
  getVehicleTypesController,
  updateVehicleTypeController,
} from "@/controllers";
import {
  createVehicleTypeSchema,
  updateVehicleTypeSchema,
  vehicleTypeFilterSchema,
  vehicleTypeIdSchema,
} from "@/dtos";

import {
  authenticationMiddleware,
  dtoValidationMiddleware,
  tryCatchWrapper,
} from "@/middlewares";

export const vehicleRouter = Router();

vehicleRouter.get(
  "/overview",
  authenticationMiddleware,
  tryCatchWrapper(getVehicleOverviewController)
);
vehicleRouter.post(
  "/",
  authenticationMiddleware,
  dtoValidationMiddleware(createVehicleTypeSchema),
  tryCatchWrapper(createVehicleTypeController)
);
vehicleRouter.get(
  "/",
  dtoValidationMiddleware(vehicleTypeFilterSchema),
  tryCatchWrapper(getVehicleTypesController)
);
vehicleRouter.get(
  "/:id",
  dtoValidationMiddleware(vehicleTypeIdSchema),
  tryCatchWrapper(getVehicleTypeController)
);
vehicleRouter.patch(
  "/:id",
  authenticationMiddleware,
  dtoValidationMiddleware(updateVehicleTypeSchema),
  tryCatchWrapper(updateVehicleTypeController)
);
vehicleRouter.delete(
  "/:id",
  authenticationMiddleware,
  dtoValidationMiddleware(vehicleTypeIdSchema),
  tryCatchWrapper(deleteVehicleTypeController)
);
