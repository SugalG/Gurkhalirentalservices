import {
  ApiError,
  CheckoutPaymentIntent,
  OrderRequest,
} from "@paypal/paypal-server-sdk";
import { Types } from "mongoose";
import { AxiosError } from "axios";
import { DEFAULT_CURRENCY } from "@/constants";
import { BookingDetails } from "@/dtos";
import { AppError } from "@/middlewares";
import { ordersController, paymentsController } from "@utils/paypal.utils";

/**
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
export async function createOrder(
  bookingId: Types.ObjectId,
  estimatedFare: number,
  bookingDetails?: BookingDetails
) {
  const _estimatedFare = estimatedFare.toFixed(2);
  const taxes = 0; // todo [aayush]: consult with client, calculate taxes based on the estimated fare
  const totalBill = (Number(estimatedFare) + Number(taxes)).toFixed(2);

  const collect = {
    body: {
      intent: CheckoutPaymentIntent.CAPTURE,
      purchaseUnits: [
        {
          referenceId: bookingId.toString(),
          amount: {
            currencyCode: DEFAULT_CURRENCY,
            value: totalBill,
            breakdown: {
              itemTotal: {
                currencyCode: DEFAULT_CURRENCY,
                value: _estimatedFare,
              },
              taxTotal: {
                currencyCode: DEFAULT_CURRENCY,
                value: taxes.toFixed(2),
              },
              // other charges (if any) ...
            },
          },
          items: [
            {
              name:
                "Estimated fare for Hamro llc rides" + bookingDetails
                  ? `, scheduled for ${bookingDetails?.scheduleDate.toDateString()}`
                  : "!",
              quantity: "1",
              unitAmount: {
                currencyCode: DEFAULT_CURRENCY,
                value: _estimatedFare,
              },
            },
          ],
        },
      ],
    } satisfies OrderRequest,
    prefer: "return=minimal",
  };

  try {
    const { body, result, statusCode } = await ordersController.ordersCreate(
      collect
    );

    console.log({ statusCode, result, body });
    if (statusCode !== 201) throw new AppError("Error creating paypal order");

    return result;
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError)
      throw new AxiosError(error.message, error.statusCode.toString());
    throw error;
  }
}

/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
export async function captureOrder(transactionId: string) {
  const collect = {
    id: transactionId,
    prefer: "return=minimal",
  };

  try {
    const { body, result, statusCode } = await ordersController.ordersCapture(
      collect
    );

    console.log({ statusCode, result, body });

    return result;
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError)
      throw new AxiosError(error.message, error.statusCode.toString());
    throw error;
  }
}

export async function refundCapturedPayment(
  capturedPaymentId: string,
  amount?: number
) {
  const collect = {
    captureId: capturedPaymentId,
    prefer: "return=minimal",
    body: amount
      ? { amount: { value: amount.toString(), currencyCode: DEFAULT_CURRENCY } }
      : {},
  };

  try {
    const { body, result } = await paymentsController.capturesRefund(collect);
    console.log({ result, body });
    return result;
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError)
      throw new AxiosError(error.message, error.statusCode.toString());
    throw error;
  }
}
