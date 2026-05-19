import { Response } from "express";
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
  AppError,
  AuthenticatedRequest,
  ValidatedAuthenticatedRequest,
  ValidatedRequest,
} from "@/middlewares";
import {
  calculateEstimatedFare,
  cancelBooking,
  checkExistingBookingsOnVehicle,
  checkVehicleAvailability,
  completeBookingOrder,
  completeUpdateBookingDetails,
  createBookingOrder,
  createOrder,
  getBookingDetails,
  getBookingOverview,
  refundCapturedPayment,
} from "@/services";
import { generateObjectId, getObjectId } from "@/utils";
import { sendEmail } from "@/utils/mail.utils";
import { orderConfirmationEmailTemplate } from "@/views/order-confirmation";
import { clientBookingConfirmationEmailTemplate } from "@/views/booking-confirmation";
import {
  ClientBillingAddressModel,
  ClientBookingModel,
  ClientBookingStatus,
  ClientDetailModel,
  PricingMode,
  TempClientBookingModel,
} from "@/models";
import { getDistanceFromGoogleMaps } from "@/utils/maps.utils";
import { config } from "@/config";
import {
  BookingPaymentDetailDocument,
  BookingPaymentModel,
  PaymentMethod,
  PaymentStatus,
} from "@/models/booking-payment.model";
import { clientBookingCancellationEmailTemplate } from "@/views/booking-cancel";
import { orderCancellationEmailTemplate } from "@/views/order-cancellation";
import { BookingPaymentRefundModel } from "@/models/booking-payment-refund.model";
import mongoose from "mongoose";

export async function getBookingPricingController(
  req: ValidatedRequest<typeof pricingSchema>,
  res: Response
) {
  const params = req.validated.body;
  const {
    vehicleType,
    pricingMode,
    durationHourly,
    destCoordinates,
    originCoordinates,
  } = params;

  if (pricingMode === PricingMode.Distance && !destCoordinates)
    throw new AppError(
      `Destination coordinates required for distance based pricing mode`,
      400
    );

  if (pricingMode === PricingMode.Hourly && !durationHourly)
    throw new AppError(
      `Destination coordinates required for hourly based pricing mode`,
      400
    );

  // calculate distance if pricing mode is distance based, throw error if api call fails
  const distanceResult =
    pricingMode === PricingMode.Distance && destCoordinates
      ? await getDistanceFromGoogleMaps(originCoordinates, destCoordinates)
      : null;

  if (pricingMode === PricingMode.Distance && distanceResult == null)
    throw new AppError(
      `Distance calculation failed. Please try again later or contact support`,
      503
    );

  const estimatedFare = await calculateEstimatedFare(getObjectId(vehicleType), {
    pricingMode,
    durationHourly,
    distanceMi: distanceResult?.distanceMi,
  });

  res.status(200).json({
    ...params,
    estimatedFare: estimatedFare,
    durationHourly: params.durationHourly ?? distanceResult?.durationHrs,
    distanceMi: distanceResult?.distanceMi ?? undefined,
  });
}

export async function createBookingOrderController(
  req: ValidatedRequest<typeof createBookingOrderSchema>,
  res: Response
) {
  const { personalDetails, billingAddress, bookingDetails } =
    req.validated.body;
  const {
    scheduleDate,
    vehicleType,
    pricingMode,
    destAddress,
    originAddress,
    destCoordinates,
    originCoordinates,
  } = bookingDetails;
  const vehicleTypeId = getObjectId(vehicleType);

  // check if vehicle available
  const isAvailable = await checkVehicleAvailability(vehicleTypeId);
  if (!isAvailable)
    throw new AppError(`Vehicle ${vehicleType} not available for booking`, 400);

  // check if the vehicle has prior bookings made to it
  const hasConflictingBookings = await checkExistingBookingsOnVehicle(
    vehicleTypeId,
    scheduleDate
  );
  if (hasConflictingBookings)
    throw new AppError(
      `Vehicle ${vehicleType} has conflicting bookings on ${scheduleDate}`,
      400
    );

  // calculate distance if pricing mode is distance based, throw error if api call fails
  const distanceResult =
    pricingMode === PricingMode.Distance && destCoordinates
      ? await getDistanceFromGoogleMaps(originCoordinates, destCoordinates)
      : null;
  if (pricingMode === PricingMode.Distance && distanceResult == null)
    throw new AppError(
      `Distance calculation failed. Please try again later or contact support`,
      503
    );

  const estimatedFare = await calculateEstimatedFare(vehicleTypeId, {
    ...bookingDetails,
    distanceMi: distanceResult?.distanceMi,
  });
  const { paymentDetails, bookingDetails: bookedDetails } =
    await createBookingOrder(personalDetails, billingAddress, {
      ...bookingDetails,
      distanceMi: distanceResult?.distanceMi,
      estimatedFare,
    });

  res.status(201).json({
    bookingId: bookedDetails._id,
    transactionId: paymentDetails?.transactionId,
    estimatedFare: paymentDetails?.amount,
    paymentMethod: paymentDetails?.paymentMethod,
    paymentMetadata: paymentDetails?.paymentMetadata,
    bookingDetails: bookedDetails,
  });
}

export async function completeBookingOrderController(
  req: ValidatedRequest<typeof bookingIdSchema>,
  res: Response
) {
  const { id } = req.validated.params;
  const basePublicUrl = `${req.protocol}://${req.get("host")}`;
  const tempEntry = await TempClientBookingModel.findOne({
    "bookingDetails._id": getObjectId(id),
  });
  if (!tempEntry)
    throw new AppError(`Booking details for booking ${id} not found`, 400);

  const result = await completeBookingOrder(getObjectId(id));
  const [bookingDetails, paymentDetails] = await Promise.all([
    getBookingDetails(getObjectId(id)),
    BookingPaymentModel.findOne({ bookingDetail: getObjectId(id) }),
  ]);

  if (!paymentDetails) throw new AppError(`Payment details not found`, 400);

  await Promise.allSettled([
    sendEmail({
      to: bookingDetails.clientDetail.email,
      subject: "Booking Confirmation",
      html: clientBookingConfirmationEmailTemplate(
        basePublicUrl,
        bookingDetails
      ),
    }),
    sendEmail({
      to: config.llcAdminEmail,
      subject: "New Booking Order Received",
      html: orderConfirmationEmailTemplate(
        basePublicUrl,
        bookingDetails,
        paymentDetails as any
      ),
    }),
  ]);

  res
    .status(200)
    .json({ message: `Booking order ${id} completed`, result: result });
}

export async function getBookingsController(
  req: ValidatedAuthenticatedRequest<typeof bookingFilterSchema>,
  res: Response
) {
  const { page, limit, ...filters } = req.validated.query;

  const client =
    filters.email || filters.fullName
      ? await ClientDetailModel.findOne({
          $or: [
            ...(filters.email ? [{ email: filters.email }] : []),
            ...(filters.fullName ? [{ fullName: filters.fullName }] : []),
          ],
        })
      : null;

  const bookingQuery = ClientBookingModel.find({
    ...(client && { clientDetail: client._id }),
    ...(filters.id && { _id: getObjectId(filters.id) }),
    ...(filters.pricingMode && { pricingMode: filters.pricingMode }),
    ...(filters.bookingStatus && { status: filters.bookingStatus }),
    ...(filters.scheduleFrom && {
      scheduleDate: { $gte: filters.scheduleFrom },
    }),
    ...(filters.scheduleTo && { scheduleDate: { $lte: filters.scheduleTo } }),
  }).populate("clientDetail vehicleType clientBillingAddress");

  if (page && limit) {
    bookingQuery.skip((page - 1) * limit).limit(limit);
  }

  const [bookings, count] = await Promise.all([
    bookingQuery.sort({ createdAt: -1 }).exec(),
    ClientBookingModel.countDocuments(bookingQuery.getQuery()),
  ]);

  const paginationMetadata = {
    currentPage: page || 1,
    currentLimit: limit || 0,
    totalItems: count,
    totalPages: limit ? Math.ceil(count / limit) : 1,
  };

  res.status(200).json({ bookings, metadata: paginationMetadata });
}

export async function getBookingController(
  req: ValidatedRequest<typeof bookingIdSchema>,
  res: Response
) {
  const { id } = req.validated.params;

  const bookingDetail = await ClientBookingModel.findOne({
    _id: getObjectId(id),
  }).populate("clientDetail vehicleType clientBillingAddress");
  if (!bookingDetail) throw new AppError("Booking not found", 404);
  res.status(200).json(bookingDetail);
}

export async function changeBookingStatusController(
  req: ValidatedAuthenticatedRequest<typeof bookingStatusSchema>,
  res: Response
) {
  const {
    body: { status },
    params: { id },
  } = req.validated;

  const booking = await ClientBookingModel.findOneAndUpdate(
    { _id: getObjectId(id) },
    { status: status },
    { new: true }
  );
  if (!booking) throw new AppError("Booking not found", 404);
  res.status(200).json(booking);
}

export async function updateBookingDetailsController(
  req: ValidatedAuthenticatedRequest<typeof updateBookingOrderSchema>,
  res: Response
) {
  const {
    body: {
      personalDetails: updatablePersonalDetails,
      billingAddress: updatableBillingAddress,
      bookingDetails: updatableBookingDetails,
    },
    params: { id },
  } = req.validated;

  /**
   * 3 cases:
   *    - only details updates, no paypal updates
   *    - updated details contains changes that costs less than prev, so refund remaining difference
   *    - updated details contains changes that costs more than prev, so create new payment
   */

  const __existingBookingDetails = (
    await getBookingDetails(getObjectId(id))
  ).toObject();
  const {
    clientDetail: existingClientDetails,
    clientBillingAddress: existingClientBillingAddress,
    vehicleType: existingVehicleType,
    ...existingBookingDetails
  } = __existingBookingDetails;

  const _destCoordinates = updatableBookingDetails?.destCoordinates
    ? {
        type: "Point",
        coordinates: updatableBookingDetails.destCoordinates,
      }
    : existingBookingDetails.destCoordinates;
  const _originCoordinates = updatableBookingDetails?.originCoordinates
    ? {
        type: "Point",
        coordinates: updatableBookingDetails.originCoordinates,
      }
    : existingBookingDetails.originCoordinates;

  const _bookingDetails = new ClientBookingModel({
    ...existingBookingDetails,
    ...updatableBookingDetails,
    _id: existingBookingDetails._id,
    destCoordinates: _destCoordinates,
    originCoordinates: _originCoordinates,
    vehicleType: updatableBookingDetails?.vehicleType
      ? getObjectId(updatableBookingDetails.vehicleType)
      : existingVehicleType._id,
    clientDetail: existingClientDetails._id,
    clientBillingAddress: existingClientBillingAddress._id,
  });
  const _personalDetails = new ClientDetailModel({
    ...existingClientDetails,
    ...updatablePersonalDetails,
    _id: existingClientDetails._id,
  });
  const _clientBillingAddress = new ClientBillingAddressModel({
    ...existingClientBillingAddress,
    ...updatableBillingAddress,
    _id: existingClientBillingAddress._id,
  });

  // check vehicle availability if changed
  if (
    existingVehicleType.toString() !==
      _bookingDetails?.vehicleType?.toString() ||
    existingBookingDetails.scheduleDate.getTime() !==
      _bookingDetails?.scheduleDate.getTime()
  ) {
    const { vehicleType, scheduleDate } = _bookingDetails;
    const hasConflictingBookings = await checkExistingBookingsOnVehicle(
      vehicleType,
      scheduleDate,
      _bookingDetails._id
    );
    if (hasConflictingBookings)
      throw new AppError(
        `Vehicle ${vehicleType} has conflicting bookings on ${scheduleDate}`,
        400
      );
  }

  // update estimated fare if location changed
  if (
    existingBookingDetails.pricingMode !== _bookingDetails?.pricingMode ||
    existingBookingDetails.originCoordinates.coordinates.join(",") !==
      _bookingDetails.originCoordinates.coordinates.join(",") ||
    existingBookingDetails.destCoordinates?.coordinates.join(",") !==
      _bookingDetails.destCoordinates?.coordinates.join(",")
  ) {
    const _distanceResult =
      _bookingDetails.pricingMode === PricingMode.Distance && _destCoordinates
        ? await getDistanceFromGoogleMaps(
            _originCoordinates.coordinates as [number, number],
            _destCoordinates.coordinates as [number, number]
          )
        : null;
    if (
      _bookingDetails.pricingMode === PricingMode.Distance &&
      _distanceResult == null
    )
      throw new AppError(
        `Distance calculation failed. Please try again later or contact support`,
        503
      );

    _bookingDetails.distanceMi =
      _distanceResult?.distanceMi ?? _bookingDetails.distanceMi;
  }

  const updatedEstimatedFare = await calculateEstimatedFare(
    _bookingDetails.vehicleType,
    _bookingDetails
  );
  _bookingDetails.estimatedFare = updatedEstimatedFare;

  // check fare difference
  const fareDifference = Number(
    (updatedEstimatedFare - existingBookingDetails.estimatedFare).toFixed(2)
  );
  const paymentDetails = await BookingPaymentModel.find({
    bookingDetail: getObjectId(id),
  });
  if (paymentDetails.length === 0)
    throw new AppError(`Payment details for booking ${id} not found`, 400);

  // create new entry
  if (fareDifference > 0) {
    // paypal transaction creation, with capture intent
    const paymentResult = await createOrder(
      _bookingDetails._id,
      fareDifference
    );
    const _paymentDetails = new BookingPaymentModel({
      _id: generateObjectId(),
      bookingDetail: _bookingDetails._id,
      amount: fareDifference,
      paymentMethod: PaymentMethod.Paypal,
      paymentMetadata: paymentResult,
      transactionId: paymentResult.id,
      paymentDate: new Date(),
    });

    // temporarily store in a separate table, only commit valid data to the true table
    const _tempEntry = await TempClientBookingModel.create({
      personalDetails: _personalDetails,
      billingAddress: _clientBillingAddress,
      bookingDetails: _bookingDetails,
      paymentDetails: _paymentDetails,
    });

    res.status(201).json({
      bookingId: _bookingDetails._id,
      transactionId: _paymentDetails?.transactionId,
      estimatedFare: _paymentDetails?.amount,
      paymentMethod: _paymentDetails?.paymentMethod,
      paymentMetadata: _paymentDetails?.paymentMetadata,
      bookingDetails: _bookingDetails,
    });

    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (fareDifference < 0) {
      const captures = paymentDetails.flatMap((payment: any) =>
        payment.paymentMetadata?.onComplete?.purchaseUnits
          .find((x: any) => x.referenceId === id.toString())
          ?.payments.captures.filter(
            (x: any) => x.status === "COMPLETED" && x.finalCapture
          )
          .map((x: any) => (x ? { ...x, paymentDetailId: payment._id } : null))
          .filter((x: any) => x !== null)
      );

      const requiredCaptures = captures
        .sort(
          (a: any, b: any) => Number(b.amount.value) - Number(a.amount.value)
        )
        .reduce(
          (acc, curr) => {
            if (acc.total >= Math.abs(fareDifference)) return acc;
            const remainingAmount = Math.abs(fareDifference) - acc.total;
            const refundAmount = Math.min(
              Number(curr.amount.value),
              remainingAmount
            );
            return {
              total: acc.total + refundAmount,
              details: [...acc.details, { ...curr, refundAmount }],
            };
          },
          { total: 0, details: [] } as any
        );

      if (requiredCaptures.details.length === 0)
        throw new AppError(
          `Cannot find any captures for the payment order`,
          500
        );

      // want sync behaviour
      for (const capture of requiredCaptures.details) {
        const result = await refundCapturedPayment(
          capture.id,
          capture.refundAmount === Number(capture.amount.value)
            ? undefined
            : capture.refundAmount
        );

        // save without the session, because we want to commit this everytime in case of multiple captures and one of them succeeds
        await BookingPaymentRefundModel.create({
          paymentDetail: capture.paymentDetailId,
          bookingDetail: _bookingDetails._id,
          amount: capture.refundAmount,
          paymentMethod: PaymentMethod.Paypal,
          refundMetadata: result,
          transactionId: result?.id,
          paymentDate: new Date(),
        });

        await BookingPaymentModel.updateOne(
          { _id: capture.paymentDetailId },
          {
            $set: {
              status:
                capture.refundAmount === Number(capture.amount.value)
                  ? PaymentStatus.Refunded
                  : PaymentStatus.PartiallyRefunded,
            },
          },
          { session }
        );
      }
    }

    await ClientDetailModel.updateOne(
      { _id: _personalDetails._id },
      { $set: _personalDetails },
      { session }
    );
    await ClientBillingAddressModel.updateOne(
      { _id: _clientBillingAddress._id },
      { $set: _clientBillingAddress },
      { session }
    );

    await ClientBookingModel.updateOne(
      { _id: _bookingDetails._id },
      { $set: _bookingDetails },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  // only return updated fields, no payment updates here
  res.status(201).json({
    bookingId: _bookingDetails._id,
    ...(fareDifference ? { refunded: Math.abs(fareDifference) } : {}),
    personalDetails: _personalDetails,
    billingAddress: _clientBillingAddress,
    bookingDetails: _bookingDetails,
  });
}

export async function completeUpdateBookingDetailsController(
  req: ValidatedRequest<typeof bookingTransactionSchema>,
  res: Response
) {
  const { id, txId } = req.validated.params;
  const basePublicUrl = `${req.protocol}://${req.get("host")}`;
  const tempEntry = await TempClientBookingModel.findOne({
    "bookingDetails._id": id,
    "paymentDetails.transactionId": txId,
  });
  if (!tempEntry)
    throw new AppError(`Update details for booking ${id} not found`, 400);

  const result = await completeUpdateBookingDetails(getObjectId(id), txId);
  const [bookingDetails, paymentDetails] = await Promise.all([
    getBookingDetails(getObjectId(id)),
    BookingPaymentModel.findOne({ bookingDetail: getObjectId(id) }),
  ]);

  await Promise.allSettled([
    sendEmail({
      to: bookingDetails.clientDetail.email,
      subject: "Booking Update Confirmation",
      html: clientBookingConfirmationEmailTemplate(
        basePublicUrl,
        bookingDetails
      ),
    }),
    sendEmail({
      to: config.llcAdminEmail,
      subject: "Booking Order Update",
      html: orderConfirmationEmailTemplate(
        basePublicUrl,
        bookingDetails,
        paymentDetails as any
      ),
    }),
  ]);
  res
    .status(200)
    .json({ message: `Booking order ${id} update completed`, result: result });
}

export async function cancelBookingController(
  req: ValidatedRequest<typeof bookingIdSchema>,
  res: Response
) {
  const { id } = req.validated.params;
  const basePublicUrl = `${req.protocol}://${req.get("host")}`;
  const bookingDetails = await getBookingDetails(getObjectId(id));

  if (
    ![ClientBookingStatus.Booked, ClientBookingStatus.Pending].includes(
      bookingDetails.status
    )
  )
    throw new AppError(
      `Cannot cancel booking in ${bookingDetails.status} state`,
      400
    );

  if (bookingDetails.createdAt.getTime() + 86_400_000 < Date.now())
    throw new AppError(
      `Booking can only be cancelled within the first 24 Hour`,
      400
    );

  const result = await cancelBooking(getObjectId(id));
  await Promise.allSettled([
    sendEmail({
      to: bookingDetails.clientDetail.email,
      subject: "Booking Cancellation",
      html: clientBookingCancellationEmailTemplate(
        basePublicUrl,
        bookingDetails
      ),
    }),
    sendEmail({
      to: config.llcAdminEmail,
      subject: "Booking Order Cancellation",
      html: orderCancellationEmailTemplate(basePublicUrl, bookingDetails),
    }),
  ]);
  res.status(200).json({
    message: `Booking order ${id} cancellation successful`,
    result: result,
  });
}

export async function forceCancelBookingController(
  req: ValidatedAuthenticatedRequest<typeof bookingIdSchema>,
  res: Response
) {
  const { id } = req.validated.params;
  const basePublicUrl = `${req.protocol}://${req.get("host")}`;
  const bookingDetails = await getBookingDetails(getObjectId(id));

  if (
    ![ClientBookingStatus.Booked, ClientBookingStatus.Pending].includes(
      bookingDetails.status
    )
  )
    throw new AppError(
      `Cannot cancel booking in ${bookingDetails.status} state`,
      400
    );

  const result = await cancelBooking(getObjectId(id), true);
  await sendEmail({
    to: bookingDetails.clientDetail.email,
    subject: "Booking Cancellation",
    html: clientBookingCancellationEmailTemplate(basePublicUrl, bookingDetails),
  });
  res.status(200).json({
    message: `Booking order ${id} cancellation successful`,
    result: result,
  });
}

export async function getBookingOverviewController(
  req: AuthenticatedRequest,
  res: Response
) {
  const overview = await getBookingOverview();
  res.status(200).json(overview);
}
