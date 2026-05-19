import { Response } from "express";
import {
  paymentFilterSchema,
  paymentIdSchema,
  paymentStatusSchema,
} from "@/dtos";
import { AppError, ValidatedAuthenticatedRequest } from "@/middlewares";
import { BookingPaymentModel } from "@/models/booking-payment.model";
import { getObjectId } from "@/utils";

export async function getPaymentsController(
  req: ValidatedAuthenticatedRequest<typeof paymentFilterSchema>,
  res: Response
) {
  const { page, limit, ...filters } = req.validated.query;

  const paymentQuery = BookingPaymentModel.find(
    {
      ...(filters.id && { _id: getObjectId(filters.id) }),
      ...(filters.bookingId && {
        bookingDetail: getObjectId(filters.bookingId),
      }),
      ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
      ...(filters.status && { status: filters.status }),
      ...(filters.paymentFrom && {
        paymentDate: { $gte: filters.paymentFrom },
      }),
      ...(filters.paymentTo && { paymentDate: { $lte: filters.paymentTo } }),
    },
    { paymentMetadata: 0 }
  ).populate("bookingDetail");

  if (page && limit) {
    paymentQuery.skip((page - 1) * limit).limit(limit);
  }

  const [payments, count] = await Promise.all([
    paymentQuery.sort({ createdAt: -1 }).exec(),
    BookingPaymentModel.countDocuments(paymentQuery.getQuery()),
  ]);

  const paginationMetadata = {
    currentPage: page || 1,
    currentLimit: limit || 0,
    totalItems: count,
    totalPages: limit ? Math.ceil(count / limit) : 1,
  };

  res.status(200).json({ payments, metadata: paginationMetadata });
}

export async function getPaymentController(
  req: ValidatedAuthenticatedRequest<typeof paymentIdSchema>,
  res: Response
) {
  const { id } = req.validated.params;

  const bookingDetail = await BookingPaymentModel.findOne(
    {
      _id: getObjectId(id),
    },
    { paymentMetadata: 0 }
  ).populate("bookingDetail");
  if (!bookingDetail) throw new AppError("Payment detail not found", 404);
  res.status(200).json(bookingDetail);
}

export async function changePaymentStatusController(
  req: ValidatedAuthenticatedRequest<typeof paymentStatusSchema>,
  res: Response
) {
  const {
    body: { status },
    params: { id },
  } = req.validated;

  const booking = await BookingPaymentModel.findOneAndUpdate(
    { _id: getObjectId(id) },
    { status: status },
    { new: true }
  );
  if (!booking) throw new AppError("Payment detail not found", 404);
  res.status(200).json(booking);
}
