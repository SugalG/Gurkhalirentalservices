import { Response } from "express";
import {
  createVehicleTypeSchema,
  updateVehicleTypeSchema,
  vehicleTypeFilterSchema,
  vehicleTypeIdSchema,
} from "@/dtos";
import {
  AppError,
  AuthenticatedRequest,
  ValidatedAuthenticatedRequest,
  ValidatedRequest,
} from "@/middlewares";
import { ClientBookingModel, VehicleTypeModel } from "@/models";
import { getVehicleOverview, getVehicleType } from "@/services/vehicle.service";
import { getObjectId } from "@/utils";

export async function createVehicleTypeController(
  req: ValidatedAuthenticatedRequest<typeof createVehicleTypeSchema>,
  res: Response
) {
  // todo [aayush]: handle file uploads as well
  const vehicleTypeDto = req.validated.body;
  const vehicleType = await VehicleTypeModel.create(vehicleTypeDto);
  res.status(201).json(vehicleType);
}

export async function getVehicleTypesController(
  req: ValidatedRequest<typeof vehicleTypeFilterSchema>,
  res: Response
) {
  const { page, limit, ...filters } = req.validated.query;

  // todo [aayush]: check for prior booking before schedule date
  const vehicleTypesQuery = VehicleTypeModel.find({
    ...(filters.id && { _id: getObjectId(filters.id) }),
    ...(filters.category && { category: filters.category }),
    ...(filters.fuelType && { fuelType: filters.fuelType }),
    // return available vehicles unless explicitly queried otherwise
    ...(filters.availabilityStatus != null
      ? {
          availabilityStatus: filters.availabilityStatus,
        }
      : { availabilityStatus: true }),
    ...(filters.occupancy && { maxOccupancy: { $gte: filters.occupancy } }),
    ...(filters.suitcaseCapacity && {
      maxSuitcaseCapacity: { $gte: filters.suitcaseCapacity },
    }),
    ...(filters.estimatedDistanceCoverageMi && {
      estimatedDistanceCoverageMi: {
        $gte: filters.estimatedDistanceCoverageMi,
      },
    }),
  });

  if (page && limit) {
    vehicleTypesQuery.skip((page - 1) * limit).limit(limit);
  }

  const [vehicleTypes, count] = await Promise.all([
    vehicleTypesQuery.sort({ createdAt: -1 }).exec(),
    VehicleTypeModel.countDocuments(vehicleTypesQuery.getQuery()),
  ]);

  const paginationMetadata = {
    currentPage: page || 1,
    currentLimit: limit || 0,
    totalItems: count,
    totalPages: limit ? Math.ceil(count / limit) : 1,
  };

  res.status(200).json({ vehicleTypes, metadata: paginationMetadata });
}

export async function getVehicleTypeController(
  req: ValidatedRequest<typeof vehicleTypeIdSchema>,
  res: Response
) {
  const { id } = req.validated.params;
  const vehicleType = await getVehicleType(getObjectId(id));
  if (!vehicleType) throw new AppError("Vehicle type not found.", 404);
  res.status(200).json(vehicleType);
}

export async function updateVehicleTypeController(
  req: ValidatedAuthenticatedRequest<typeof updateVehicleTypeSchema>,
  res: Response
) {
  const {
    body: vehicleTypeDto,
    params: { id },
  } = req.validated;

  const vehicleType = await VehicleTypeModel.findOneAndUpdate(
    {
      _id: getObjectId(id),
    },
    {
      $set: vehicleTypeDto,
    },
    { new: true }
  );

  if (!vehicleType) throw new AppError("Vehicle type not found.", 404);
  res.status(200).json(vehicleType);
}

export async function deleteVehicleTypeController(
  req: ValidatedAuthenticatedRequest<typeof vehicleTypeIdSchema>,
  res: Response
) {
  const { id } = req.validated.params;

  const doesVehicleHaveBookings = await ClientBookingModel.find({
    vehicleType: getObjectId(id),
  });
  if (doesVehicleHaveBookings.length > 0)
    throw new AppError("Vehicle type has bookings. Cannot delete.", 400);

  //? maybe soft delete
  const deleteResult = await VehicleTypeModel.deleteOne({
    _id: getObjectId(id),
  });

  if (deleteResult.deletedCount === 0)
    throw new AppError(
      "Task couldn't be deleted. Id mismatch or Insufficient permissions.",
      400
    );

  res.sendStatus(204);
}

export async function getVehicleOverviewController(
  req: AuthenticatedRequest,
  res: Response
) {
  const overview = await getVehicleOverview();
  res.status(200).json(overview);
}
