import mongoose, { Types } from "mongoose";
import { AVERAGE_SPEED_MI_PER_HR, BUFFER_DURATION_HR } from "@/constants";
import { BillingAddress, BookingDetails, PersonalDetails } from "@/dtos";
import {
  ClientBillingAddress,
  ClientBillingAddressDocument,
  ClientBillingAddressModel,
  ClientBookingDocument,
  ClientBookingModel,
  ClientBookingStatus,
  ClientDetail,
  ClientDetailDocument,
  ClientDetailModel,
  PricingMode,
  TempClientBookingModel,
  VehicleType,
} from "@/models";
import { generateObjectId, getObjectId } from "@/utils";
import {
  captureOrder,
  createOrder,
  refundCapturedPayment,
} from "./paypal.service";
import {
  BookingPaymentDetailDocument,
  BookingPaymentModel,
  PaymentMethod,
  PaymentStatus,
} from "@/models/booking-payment.model";
import { AppError } from "@/middlewares";
import { BookingPaymentRefundModel } from "@/models/booking-payment-refund.model";
import {
  BookingOverviewPipeline,
  bookingOverviewPipeline,
} from "@/mongo-pipelines/booking-overview.pipeline";

export async function createBookingOrder(
  personalDetails: PersonalDetails,
  billingAddress: BillingAddress,
  bookingDetails: BookingDetails & {
    estimatedFare: number;
    distanceMi?: number;
  }
) {
  const originCoordinates = {
    type: "Point",
    coordinates: bookingDetails.originCoordinates,
  };
  const destCoordinates = bookingDetails.destCoordinates
    ? {
        type: "Point",
        coordinates: bookingDetails.destCoordinates,
      }
    : undefined;

  const _personalDetails = new ClientDetailModel({
    ...personalDetails,
    _id: generateObjectId(),
  });
  const _billingAddress = new ClientBillingAddressModel({
    ...billingAddress,
    _id: generateObjectId(),
    clientDetail: _personalDetails._id,
  });
  const _bookingDetails = new ClientBookingModel({
    ...bookingDetails,
    _id: generateObjectId(),
    originCoordinates: originCoordinates,
    destCoordinates: destCoordinates,
    clientDetail: _personalDetails._id,
    clientBillingAddress: _billingAddress._id,
    vehicleType: getObjectId(bookingDetails.vehicleType),
  });

  // paypal transaction creation, with capture intent
  const paymentResult = await createOrder(
    _bookingDetails._id,
    bookingDetails.estimatedFare,
    bookingDetails
  );
  const _paymentDetails = new BookingPaymentModel({
    _id: generateObjectId(),
    bookingDetail: _bookingDetails._id,
    amount: bookingDetails.estimatedFare,
    paymentMethod: PaymentMethod.Paypal,
    paymentMetadata: paymentResult,
    transactionId: paymentResult.id,
    paymentDate: new Date(),
  });

  // temporarily store in a separate table, only commit valid data to the true table
  const _tempEntry = await TempClientBookingModel.create({
    personalDetails: _personalDetails,
    billingAddress: _billingAddress,
    bookingDetails: _bookingDetails,
    paymentDetails: _paymentDetails,
  });

  return {
    bookingDetails: _bookingDetails,
    personalDetails: _personalDetails,
    billingAddress: _billingAddress,
    paymentDetails: _paymentDetails,
  };
}

export async function completeBookingOrder(id: Types.ObjectId) {
  const tempEntry = await TempClientBookingModel.findOne({
    "bookingDetails._id": id,
  });
  if (!tempEntry)
    throw new AppError(`Booking details for ${id} not found`, 400);
  if (!tempEntry.paymentDetails)
    throw new AppError(`Payment details for ${id} not found`, 400);

  const personalDetails = (
    tempEntry.personalDetails as unknown as ClientDetailDocument
  ).toObject();
  const billingAddress = (
    tempEntry.billingAddress as unknown as ClientBillingAddressDocument
  ).toObject();
  const bookingDetails = (
    tempEntry.bookingDetails as unknown as ClientBookingDocument
  ).toObject();
  const paymentDetails = (
    tempEntry.paymentDetails as unknown as BookingPaymentDetailDocument
  ).toObject();

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const _clientDetail = await ClientDetailModel.findOne({
      email: personalDetails.email,
    });

    if (_clientDetail) {
      _clientDetail.fullName = personalDetails.fullName;
      _clientDetail.phoneNumber = personalDetails.phoneNumber;
      await _clientDetail.save({ session });

      billingAddress.clientDetail = _clientDetail._id;
      bookingDetails.clientDetail = _clientDetail._id;
    } else if (!_clientDetail) {
      await ClientDetailModel.findOneAndUpdate(
        { email: personalDetails.email },
        { ...personalDetails },
        { upsert: true, new: true, session: session }
      );
    }

    const clientBillingAddress = new ClientBillingAddressModel(billingAddress);
    await clientBillingAddress.save({ session });

    const clientBookingDetails = new ClientBookingModel(bookingDetails);
    clientBookingDetails.status = ClientBookingStatus.Booked;
    await clientBookingDetails.save({ session });

    const completeOrder = await captureOrder(paymentDetails.transactionId);
    const clientPaymentDetails = new BookingPaymentModel(paymentDetails);
    clientPaymentDetails.status = PaymentStatus.Completed;
    clientPaymentDetails.paymentMetadata = {
      ...clientPaymentDetails.paymentMetadata,
      onComplete: completeOrder,
    };
    await clientPaymentDetails.save({ session });

    await TempClientBookingModel.deleteOne({ _id: tempEntry._id }, { session });

    await session.commitTransaction();
    return completeOrder;
  } catch (error: unknown) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function completeUpdateBookingDetails(
  id: Types.ObjectId,
  txId: string
) {
  const tempEntry = await TempClientBookingModel.findOne({
    "bookingDetails._id": id,
    "paymentDetails.transactionId": txId,
  });
  if (!tempEntry)
    throw new AppError(`Update details for booking ${id} not found`, 400);
  if (!tempEntry.paymentDetails)
    throw new AppError(`Payment details for ${id} not found`, 400);

  const { personalDetails, billingAddress, bookingDetails, paymentDetails } =
    tempEntry;
  const { createdAt: pc, ..._personalDetails } = (
    personalDetails as ClientDetailDocument
  ).toObject();
  const { createdAt: bc, ..._billingAddress } = (
    billingAddress as ClientBillingAddressDocument
  ).toObject();
  const { createdAt: boc, ..._bookingDetails } = (
    bookingDetails as ClientBookingDocument
  ).toObject();
  const { createdAt: pac, ..._paymentDetails } = (
    paymentDetails as BookingPaymentDetailDocument
  ).toObject();

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await ClientDetailModel.updateOne(
      { _id: _personalDetails._id },
      { $set: _personalDetails },
      { session }
    );
    await ClientBillingAddressModel.updateOne(
      { _id: _billingAddress._id },
      { $set: _billingAddress },
      { session }
    );

    await ClientBookingModel.updateOne(
      { _id: _bookingDetails._id },
      { $set: _bookingDetails },
      { session }
    );

    const completeOrder = await captureOrder(_paymentDetails.transactionId);
    const clientPaymentDetails = new BookingPaymentModel({
      ..._paymentDetails,
      _id: _paymentDetails._id,
      createdAt: pac,
      status: PaymentStatus.Completed,
      paymentMetadata: {
        ..._paymentDetails.paymentMetadata,
        onComplete: completeOrder,
      },
    });
    await clientPaymentDetails.save({ session });

    await TempClientBookingModel.deleteOne({ _id: tempEntry._id }, { session });

    await session.commitTransaction();
    return completeOrder;
  } catch (error: unknown) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

// todo [aayush]: think this through, might want to work a bit on buffer time and distance based calculation
export async function checkExistingBookingsOnVehicle(
  vehicleTypeId: Types.ObjectId,
  scheduleDate: Date,
  bookingId?: Types.ObjectId
): Promise<boolean> {
  const existingBookings = await ClientBookingModel.find({
    vehicleType: vehicleTypeId,
    status: {
      $in: [
        ClientBookingStatus.Booked,
        // ClientBookingStatus.Pending,
        ClientBookingStatus.InProgress,
      ],
    },
  });

  // Check for any conflicting bookings
  const hasConflict = existingBookings.some((booking) => {
    const {
      _id,
      scheduleDate: existingScheduleDate,
      durationHourly,
      distanceMi,
      pricingMode,
    } = booking;

    if (bookingId && _id.toString() === bookingId.toString()) return false; // checking against itself for update!

    let existingBookingStartTime = existingScheduleDate.getTime();
    let existingBookingEndTime = 0;

    if (pricingMode === PricingMode.Hourly && durationHourly) {
      existingBookingEndTime =
        existingBookingStartTime +
        durationHourly * 36_00_000 +
        BUFFER_DURATION_HR * 60_000;
    } else if (pricingMode === PricingMode.Distance && distanceMi) {
      const travelTimeHr = distanceMi / AVERAGE_SPEED_MI_PER_HR;
      existingBookingEndTime =
        existingBookingStartTime +
        travelTimeHr * 36_00_000 + // estimated travel time
        BUFFER_DURATION_HR * 60_000;
    } else {
      return true;
    }

    const newBookingStartTime = scheduleDate.getTime();
    const newBookingEndTime =
      newBookingStartTime +
      (pricingMode === PricingMode.Hourly && durationHourly
        ? durationHourly * 36_00_000
        : 0) + // Distance-based pricing doesn't have predefined duration
      BUFFER_DURATION_HR * 60_000;

    return (
      (newBookingStartTime >= existingBookingStartTime &&
        newBookingStartTime < existingBookingEndTime) ||
      (newBookingEndTime > existingBookingStartTime &&
        newBookingEndTime <= existingBookingEndTime) ||
      (newBookingStartTime <= existingBookingStartTime &&
        newBookingEndTime >= existingBookingEndTime)
    );
  });

  return hasConflict;
}

export async function getBookingDetails(bookingId: Types.ObjectId) {
  const bookingDetails = await ClientBookingModel.findOne({
    _id: bookingId,
  })
    .populate<{
      clientDetail: ClientDetail;
      clientBillingAddress: ClientBillingAddress;
      vehicleType: VehicleType;
    }>("clientDetail clientBillingAddress vehicleType")
    .exec();
  if (!bookingDetails)
    throw new AppError(`Booking deatils for ${bookingId} not found`, 404);
  return bookingDetails;
}

export async function cancelBooking(id: Types.ObjectId, forced?: boolean) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const bookingDetails = await getBookingDetails(id);
    bookingDetails.status = forced
      ? ClientBookingStatus.AdminCancelled
      : ClientBookingStatus.Cancelled;
    await bookingDetails.save({ session: session });

    const paymentDetails = await BookingPaymentModel.find({
      bookingDetail: id,
    });
    if (paymentDetails.length === 0)
      throw new AppError(`Payment info for booking ${id} not found`, 404);

    await BookingPaymentModel.updateMany(
      { bookingDetail: id },
      { $set: { status: PaymentStatus.Refunded } },
      { session }
    );

    const captures = paymentDetails.flatMap((payment) =>
      payment.paymentMetadata?.onComplete?.purchaseUnits
        .find((x: any) => x.referenceId === id.toString())
        ?.payments.captures.filter(
          (x: any) => x.status === "COMPLETED" && x.finalCapture
        )
        .map((x: any) => (x ? { ...x, paymentDetailId: payment._id } : null))
        .filter((x: any) => x !== null)
    );

    if (captures.length === 0)
      throw new AppError(`Cannot find any captures fo the payment order`, 500);

    const results = [];
    // want sync behaviour
    for (let i = 0; i < captures.length; ++i) {
      const capture = captures[i];
      const result = await refundCapturedPayment(capture.id);
      // save without the session, because we want to commit this everytime in case of multiple captures and one of them succeeds
      await BookingPaymentRefundModel.create({
        paymentDetail: capture.paymentDetailId,
        bookingDetail: bookingDetails._id,
        amount: capture.amount.value,
        paymentMethod: PaymentMethod.Paypal,
        refundMetadata: result,
        transactionId: result?.id,
        paymentDate: new Date(),
      });
      results.push(result);
    }

    await session.commitTransaction();

    return results;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function getBookingOverview() {
  const pipeline = bookingOverviewPipeline();
  const result = (
    await ClientBookingModel.aggregate<BookingOverviewPipeline>(pipeline)
  )[0];

  const { bookingDistribution, statusOverview } = result;
  Object.values(PricingMode).forEach((mode) => {
    const entry = bookingDistribution.some((x) => x.pricingMode === mode);
    if (!entry) {
      bookingDistribution.push({
        pricingMode: mode,
        count: 0,
        revenue: 0,
      });
    }
  });
  Object.values(ClientBookingStatus).forEach((status) => {
    const entry = statusOverview.some((x) => x.status === status);
    if (!entry) {
      statusOverview.push({
        status,
        count: 0,
      });
    }
  });

  return { ...result, bookingDistribution, statusOverview };
}
