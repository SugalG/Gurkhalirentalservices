import {
  BookingPaymentDetail,
  BookingPaymentDetailDocument,
} from "@/models/booking-payment.model";
import { getBookingDetails } from "@/services";

// order confirmation sent to admin of the system
export const orderConfirmationEmailTemplate = (
  basePublicUrl: string,
  bookingDetails: Awaited<ReturnType<typeof getBookingDetails>>,
  paymentDetails: BookingPaymentDetail | BookingPaymentDetailDocument
) => {
  const {
    _id: bookingId,
    scheduleDate,
    originAddress,
    destAddress,
    estimatedFare,
    clientDetail,
    vehicleType,
  } = bookingDetails;

  const mediaUrl = `${basePublicUrl}/public/email-template-images`;

  return `
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Order Confirmation</title>
</head>

<body style="margin: 0; padding: 0; background-color: #E5E7EB; font-family: Arial, sans-serif;">

	<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb;">
		<div
			style="background-color: #111827; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
			<div style="display: flex; align-items: center; gap: 10px;">
				<img src=${mediaUrl + "/LLC2.png"} alt="logo" style="height: 40px;">
				<p style="margin: 0; font-size: 20px; font-weight: bold;">LLC</p>
			</div>
		</div>

		<div style="background-color: #111827; text-align: center;">
			<img src=${mediaUrl + "/frame.png"} alt="Frame">
			<h4 style="color: #CBA135; font-size: 24px; font-weight: 700; margin-top: 5px; margin-bottom: auto;">
				New Booking Received
			</h4>
			<p style="margin-top: -px; color: #e5e7eb; padding-bottom: 10px;">
				${bookingId}
			</p>
		</div>


		<div style="padding: 10px 30px 30px 30px; border-bottom: #E5E7EB solid 1px;">
			<h2 style="font-size: 18px; font-weight: bold; color: #111827; ">Customer Details</h2>
			<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
				<div>
					<p style="margin: 0; font-size: 16px; color: #4B5563;">Name</p>
					<p style="margin: 5px 0 0; font-size: 16px; font-weight: 700; color: black;">${
            clientDetail.fullName
          }</p>
				</div>
				<div>
					<p style="margin: 0; font-size: 16px; color: #4B5563;">Phone</p>
					<p style="margin: 5px 0 0; font-size: 16px; font-weight: 700; color: black;">${
            clientDetail.phoneNumber
          }</p>
				</div>
				<div>
					<p style="margin: 0; font-size: 16px; color: #4B5563;">Email</p>
					<p style="margin: 5px 0 0; font-size: 16px; font-weight: 700; color: black;">${
            clientDetail.email
          }</p>
				</div>
			</div>
		</div>


		<div style="padding:15px 30px 30px 30px; border-bottom: 1px solid #e5e7eb;">
			<h2 style="font-size: 18px; font-weight: bold; color: #111827; margin-bottom: 16px;">Booking Details</h2>
			<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
				<p style="margin: 0; font-size: 16px; color: #4B5563;">Pickup Date & Time</p>
				<p style="margin: 0; font-size: 16px; color: #000; font-weight: 700;">${scheduleDate.toISOString()}</p>
			</div>
			<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
				<p style="margin: 0; font-size: 16px; color: #4B5563;">Pickup Location</p>
				<p style="margin: 0; font-size: 16px; color: #000; font-weight: 700;">${originAddress}</p>
			</div>
			<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
				<p style="margin: 0; font-size: 16px; color: #4B5563;">Drop-off Location</p>
				<p style="margin: 0; font-size: 16px; color: #000; font-weight: 700;">${destAddress}</p>
			</div>
			<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
				<p style="margin: 0; font-size: 16px; color: #4B5563;">Vehicle Type</p>
				<p style="margin: 0; font-size: 16px; color: #000; font-weight: 700;">${
          vehicleType.name
        }</p>
			</div>
		</div>


		<div style="padding: 15px 30px 30px 30px;  border-bottom: 1px solid #e5e7eb;">
			<h2 style="font-size: 16px; font-weight: bold; color: #111827; margin-bottom: 16px;">Payment Summary</h2>
			<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
				<p style="margin: 0; font-size: 16px; color: #4B5563;">Base Fare</p>
				<p style="margin: 0; font-size: 18px; color: #111827; font-weight: 700;">$${estimatedFare}</p>
			</div>
			<div style="display: flex; justify-content: space-between; padding-top: 20px; font-weight: bold;">
				<p style="margin: 0; font-size: 18px; color: #111827; font-weight: 700;">Total Amount</p>
				<p style="margin: 0; font-size: 18px; color: #D4AF37; font-weight: 700;">$${estimatedFare}</p>
			</div>
		</div>


		<div style="padding: 15px 30px 30px 30px; border-bottom: 1px solid #e5e7eb;">
			<h3 style="color: #4B5563; font-size: 16px; font-weight: 400;">Payment Method</h3>
			<p style="margin-top: 10px; font-size: 12px; font-weight: 500;"><img src=${
        mediaUrl + "/paypal2.png"
      } alt="Phone "
					style="margin: 0px 10px 0px 0px">PayPal(${
            paymentDetails.paymentMetadata?.onComplete?.paymentSource?.paypal
              ?.emailAddress
          })</p>
			<p style="font-size: 14px; color: #4B5563; margin-top: -5px;">Transaction ID: ${
        paymentDetails.transactionId
      }</p>
		</div>

		<div style="padding: 20px 30px 30px 30px; width: full;">
			<a href="https://gurkhaliluxuryrides.com/"
				style="width: 100%; height: 48px; color: #000; border: #CBA135 solid 1px; background-color: #D4AF37; border-radius: 8px; font-size: 16px; font-weight: 700;">View
				Booking Details</a>
		</div>

		<div style="background-color: #111827; padding: 20px; text-align: center; color: white;">
			<div style="margin-bottom: 16px;">
				<a href="#" style="margin: 0 5px; color: #CBA135; text-decoration: none;">
					<img src=${mediaUrl + "/facebook.png"} alt="facebook">
				</a>
				<a href="#" style="margin: 0 5px; color: #CBA135; text-decoration: none;">
					<img src=${mediaUrl + "/insta.png"} alt="Instagram">
				</a>
			</div>
			<div style="margin-bottom: 8px; font-size: 14px;">© 2025 LLC. All rights reserved.</div>
		</div>

	</div>

</body>

</html>
`;
};
