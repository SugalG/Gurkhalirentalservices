"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, DollarSign, FileQuestion } from "lucide-react";
import { Label } from "@components/ui/label";
import { Input } from "@components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Checkbox } from "@components/ui/checkbox";
import { RadioGroup } from "@components/ui/radio-group";
import { PaymentFormProps } from "@/app/types";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import toast from "react-hot-toast";
import {
  completeOrder,
  completeOrderWithExtraPay,
  createBookingOrder,
  updateBooking,
} from "@/app/(Home_Routes)/action";
import { initialOptions } from "@/app/lib/paypalConfig";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { redirect, useSearchParams } from "next/navigation";

import { IBookingEditResponse } from "@/app/types/bookingData";
import { Button } from "../ui/button";

interface PaymentDetails {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: string;
  termsAccepted: boolean;
}

export function PaymentForm({
  extraAmount = 0,
  amount,
  bookingDetails,
  decodedObject,
  selectedVehicleId,
  formType,
}: PaymentFormProps) {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<PaymentDetails>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    paymentMethod: "paypal",
    termsAccepted: false,
  });
  const [isOpen, setIsOpen] = useState(false);
  const bookingIdRef = useRef<string | null>(null);
  const transactionIdRef = useRef<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value,
    }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value }));
  };

  const handleFreeUpdate = async () => {
    const { bookingId } = await updateBooking(
      decodedObject?._id!,
      extractTheFinalObject()
    );
    if (!bookingId) return toast.error("Couldn't Process the Booking Edit");
    toast.success("Edited Successfully");
    return redirect("/");
  };

  const extractTheFinalObject = () => {
    const finalBooking = {
      ...bookingDetails,
      paymentDetails: { ...formData },
      decodedObject,
    };
    const extractedObject = {
      personalDetails: {
        fullName: `${finalBooking?.passengerDetails?.firstName} ${finalBooking?.passengerDetails?.lastName}`,
        email: finalBooking?.passengerDetails?.email || "",
        phoneNumber: finalBooking?.passengerDetails?.phone || "",
      },
      billingAddress: {
        fullName: `${finalBooking.paymentDetails.firstName} ${finalBooking.paymentDetails.lastName}`,
        addressLine_1: finalBooking.paymentDetails.address,
        state: finalBooking.paymentDetails.state,
        city: finalBooking.paymentDetails.city,
        postalCode: finalBooking.paymentDetails.zipCode,
        country: finalBooking.paymentDetails.country,
        affiliation: "Hello",
        addressLine_2: finalBooking.paymentDetails.address,
      },
      bookingDetails: {
        vehicleType: selectedVehicleId || "",
        originAddress: finalBooking?.decodedObject?.pickupLocation?.label || "",
        ...(finalBooking?.decodedObject?.pricing_mode !== "hourly" && {
          destAddress: finalBooking?.decodedObject?.destination?.label || "",
        }),

        originCoordinates: [
          finalBooking?.decodedObject?.pickupCoordinates?.lat || 0,
          finalBooking?.decodedObject?.pickupCoordinates?.lng || 0,
        ],
        destCoordinates: [
          finalBooking?.decodedObject?.destinationCoordinates?.lat || 0,
          finalBooking?.decodedObject?.destinationCoordinates?.lng || 0,
        ],
        scheduleDate: finalBooking.decodedObject?.scheduleDate || "",
        pricingMode: (finalBooking?.decodedObject?.pricing_mode ||
          "distance") as "distance" | "hourly",
        durationHourly: parseInt(
          finalBooking?.decodedObject?.duration || "0",
          10
        ),
        distanceKm: finalBooking?.decodedObject?.distanceKm || 0,
        specialRequests:
          finalBooking?.passengerDetails?.specialInstructions || "",
        meetName: finalBooking?.passengerDetails?.meetAndGreetName || "",
        meetAndGreet:
          (finalBooking?.passengerDetails?.meetAndGreetName?.length ?? 0) > 0
            ? true
            : false,
      },
    };

    return extractedObject;
  };

  useEffect(() => {
    const decodedEditObject = decodedObject as unknown as IBookingEditResponse;
    if (searchParams?.get("type") === "edit") {
      setFormData(() => ({
        firstName:
          decodedEditObject?.clientBillingAddress?.fullName?.split(" ")[0] ||
          "",
        lastName:
          decodedEditObject?.clientBillingAddress?.fullName?.split(" ")[1] ||
          "",
        address: decodedEditObject?.clientBillingAddress?.addressLine_1 || "",
        city: decodedEditObject?.clientBillingAddress?.city || "",
        state: decodedEditObject?.clientBillingAddress?.state || "",
        zipCode: decodedEditObject?.clientBillingAddress?.postalCode || "",
        country: decodedEditObject?.clientBillingAddress?.country || "",
        paymentMethod: "paypal",
        termsAccepted: false,
      }));
    }
  }, [decodedObject]);

  const memoizedFormContent = () => {
    return (
      <div className="max-w-3xl py-8 bg-white p-5 mx-auto rounded-2xl text-main space-y-5">
        {!formType && (
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Payment</h2>
            <p className="text-sm">Billing Address</p>
          </div>
        )}
        {/* </div> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="bg-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="bg-white"
              required
            />
          </div>
        </div>
        {/* Address Field */}
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="bg-white"
            required
          />
        </div>
        {/* City, State, and ZIP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="bg-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="bg-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP / Postal Code</Label>
            <Input
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className="bg-white"
              required
            />
          </div>
        </div>
        {/* Country Select */}
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select
            value={formData.country}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, country: value }))
            }
            required
          >
            <SelectTrigger id="country" className="bg-white">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent defaultValue={"US"}>
              <SelectItem value="US">United States</SelectItem>
              {/* <SelectItem value="CA">Canada</SelectItem>
              <SelectItem value="GB">United Kingdom</SelectItem> */}
            </SelectContent>
          </Select>
        </div>
        {/* Price Breakdown */}
        <div className="space-y-3 bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span>Outward trip price</span>
            <span>${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total price</span>
            <span>${amount.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-500">No additional fees</p>
          <div className="flex items-center gap-3 text-sm text-emerald-700 bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <FileQuestion className="w-5 h-5" />
            <span>Free cancellation within 24 hours of booking</span>
          </div>
        </div>
        {/* Payment Method */}
        <div className="space-y-3">
          <Label>Payment Method</Label>
          <RadioGroup
            defaultValue="paypal"
            name="paymentMethod"
            onValueChange={handlePaymentMethodChange}
            required
          >
            <div className="space-y-3">
              <div
                onClick={() => handlePaymentMethodChange("paypal")}
                className={`${
                  formData.paymentMethod === "paypal"
                    ? "bg-main text-white"
                    : ""
                } flex items-center gap-4 p-4 border rounded-lg  cursor-pointer`}
              >
                <DollarSign className="w-5 h-5 text-blue-600" />
                <Label htmlFor="paypal" className="cursor-pointer">
                  PayPal
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
        {/* Terms and Conditions */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, termsAccepted: !!checked }))
            }
            className="border-main"
            required
          />
          <Label htmlFor="terms" className="text-sm leading-none">
            I agree to the{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </Label>
        </div>
        {formType === "edit" ? (
          <>
            {" "}
            {extraAmount === 0 && (
              <Button
                className="w-full mt-10  py-6 text-white "
                variant={"outline"}
                onClick={handleFreeUpdate}
              >
                Confirm Update
              </Button>
            )}
            {extraAmount < 0 && (
              <Button
                className="w-full mt-10  py-6 text-white"
                variant={"outline"}
                onClick={handleFreeUpdate}
              >
                Claim ${Number(extraAmount.toFixed(2)) * -1} Refund
              </Button>
            )}
            {extraAmount > 0 && (
              <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                  style={{
                    shape: "rect",
                    layout: "vertical",
                    color: "silver",
                    label: "paypal",
                  }}
                  disabled={
                    !formData.termsAccepted ||
                    !formData.firstName ||
                    !formData.lastName ||
                    !formData.address ||
                    !formData.city ||
                    !formData.state ||
                    !formData.zipCode
                  }
                  createOrder={async () => {
                    try {
                      const orderData = await updateBooking(
                        decodedObject?._id!,
                        extractTheFinalObject()
                      );

                      if (orderData.transactionId) {
                        transactionIdRef.current = orderData.transactionId;
                        bookingIdRef.current = orderData.bookingId;

                        return orderData.transactionId;
                      } else {
                        const errorDetail = orderData?.details?.[0];
                        const errorMessage = errorDetail
                          ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                          : JSON.stringify(orderData);

                        throw new Error(errorMessage);
                      }
                    } catch (error) {
                      console.error(error);
                      toast.error(
                        `Could not initiate PayPal Checkout...${error}`
                      );
                    }
                  }}
                  onApprove={async (data, actions) => {
                    try {
                      if (!bookingIdRef.current) {
                        throw new Error("Booking ID is missing!");
                      }

                      const orderData = await completeOrderWithExtraPay(
                        bookingIdRef.current,
                        transactionIdRef.current!
                      );
                      if (orderData.message) {
                        toast.success(orderData.message);
                        //todo: replace wi
                        actions.redirect(process.env.NEXT_PUBLIC_NEXTAUTH_URL!);
                      } else {
                        toast.error("Could not complete the order");
                      }
                      // Three cases to handle:
                      //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                      //   (2) Other non-recoverable errors -> Show a failure message
                      //   (3) Successful transaction -> Show confirmation or thank you message

                      // const errorDetail = orderData?.details?.[0];

                      // if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                      // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                      // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
                      // return actions.restart();
                      // } else if (errorDetail) {
                      // (2) Other non-recoverable errors -> Show a failure message
                      // throw new Error(
                      // `${errorDetail.description} (${orderData.debug_id})`
                      // );
                      // } else {
                      // (3) Successful transaction -> Show confirmation or thank you message
                      // Or go to another URL:  actions.redirect('thank_you.html');
                      // const transaction =
                      // orderData.purchase_units[0].payments.captures[0];
                      // toast.error(
                      //   `Transaction ${transaction.status}: ${transaction.id}. See console for all available details`
                      // );
                      // }
                    } catch (error) {
                      console.error(error);
                      toast.error(
                        `Sorry, your transaction could not be processed...${error}`
                      );
                    }
                  }}
                />
              </PayPalScriptProvider>
            )}
          </>
        ) : (
          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
              style={{
                shape: "rect",
                layout: "vertical",
                color: "silver",
                label: "paypal",
              }}
              disabled={
                !formData.termsAccepted ||
                !formData.firstName ||
                !formData.lastName ||
                !formData.address ||
                !formData.city ||
                !formData.state ||
                !formData.zipCode
              }
              createOrder={async () => {
                try {
                  const orderData = await createBookingOrder(
                    extractTheFinalObject()
                  );

                  if (orderData.transactionId) {
                    bookingIdRef.current = orderData.bookingId;

                    return orderData.transactionId;
                  } else {
                    const errorDetail = orderData?.details?.[0];
                    const errorMessage = errorDetail
                      ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                      : JSON.stringify(orderData);

                    throw new Error(errorMessage);
                  }
                } catch (error) {
                  console.error(error);
                  toast.error(`Could not initiate PayPal Checkout...${error}`);
                }
              }}
              onApprove={async (data, actions) => {
                try {
                  if (!bookingIdRef.current) {
                    throw new Error("Booking ID is missing!");
                  }

                  const orderData = await completeOrder(bookingIdRef.current);
                  if (orderData.message) {
                    toast.success(orderData.message);
                    //todo: replace wi
                    actions.redirect(process.env.NEXT_PUBLIC_NEXTAUTH_URL!);
                  } else {
                    toast.error("Could not complete the order");
                  }
                  // Three cases to handle:
                  //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                  //   (2) Other non-recoverable errors -> Show a failure message
                  //   (3) Successful transaction -> Show confirmation or thank you message

                  // const errorDetail = orderData?.details?.[0];

                  // if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                  // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                  // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
                  // return actions.restart();
                  // } else if (errorDetail) {
                  // (2) Other non-recoverable errors -> Show a failure message
                  // throw new Error(
                  // `${errorDetail.description} (${orderData.debug_id})`
                  // );
                  // } else {
                  // (3) Successful transaction -> Show confirmation or thank you message
                  // Or go to another URL:  actions.redirect('thank_you.html');
                  // const transaction =
                  // orderData.purchase_units[0].payments.captures[0];
                  // toast.error(
                  //   `Transaction ${transaction.status}: ${transaction.id}. See console for all available details`
                  // );
                  // }
                } catch (error) {
                  console.error(error);
                  toast.error(
                    `Sorry, your transaction could not be processed...${error}`
                  );
                }
              }}
            />
          </PayPalScriptProvider>
        )}
      </div>
    );
  };
  if (formType === "edit") {
    return (
      <div className="w-full mx-auto p-4">
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="border rounded-lg overflow-hidden"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white overflow-hidden">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Payment Details</h2>
            </div>
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 pt-0 bg-white">
            {memoizedFormContent()}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return <div className="md:w-2/3 w-full">{memoizedFormContent()}</div>;
}
