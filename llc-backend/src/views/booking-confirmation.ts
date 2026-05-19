import { config } from "@/config";
import { getBookingDetails } from "@/services";

// booking confirmation sent to client
export const clientBookingConfirmationEmailTemplate = (
  basePublicUrl: string,
  bookingDetails: Awaited<ReturnType<typeof getBookingDetails>>
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
      <title>Booking Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb;">
        <!-- Header Section -->
        <div
          style="background-color: #111827; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #CBA135;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src=${mediaUrl + "/LLC2.png"} alt="logo" style="height: 40px;">
            <p style="margin: 0; font-size: 20px; font-weight: bold;">LLC</p>
          </div>
          <div style="font-size: 14px;">Welcome to Premium Service</div>
        </div>

        <!-- Title Section -->
        <div style="padding: 30px;">
          <h1 style="font-size: 24px; font-weight: normal; color: #111827; margin-bottom: 30px;">Hello ${
            clientDetail.fullName
          },<br>Your car
            booking is <span style="color: #CBA135; font-weight: bold;">confirmed!</span></h1>
        </div>

        <!-- Booking Card Section -->
        <div
          style="background-color: #CBA135; color: white; padding: 20px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; margin: 0 30px;">
          <div>
            <p style="margin: 0; font-size: 14px;">Your Booking ID</p>
            <h3 style="font-size: 24px; font-weight: bold; margin: 5px 0;">${bookingId}</h3>
            <a href="https://gurkhaliluxuryrides.com/"
              style="display: inline-block; text-decoration: none; color: white; background-color: #111827; padding: 10px 20px; border-radius: 8px; font-size: 16px; margin-top: 16px;">
              <img src=${
                mediaUrl + "/i.png"
              } alt="view" style="margin: 0px 10px 0px 0px">View Your Booking</a>
          </div>
          <img src=${
            mediaUrl + "/car.png"
          } alt="Car" style="width: 120px; border-radius: 8px;">
        </div>

        <!-- Trip Details -->
        <div style="padding: 30px;">
          <h2 style="font-size: 16px; font-weight: bold; color: #111827; margin-bottom: 16px;">Trip Details</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <p style="margin: 0; font-size: 14px; color: #CBA135;">Pickup Date & Time</p>
              <p style="margin: 5px 0 0; font-size: 16px; color: #111827;">${scheduleDate.toISOString()}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 14px; color: #CBA135;">Pickup Location</p>
              <p style="margin: 5px 0 0; font-size: 16px; color: #111827;">${originAddress}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 14px; color: #CBA135;">Drop-off Location</p>
              <p style="margin: 5px 0 0; font-size: 16px; color: #111827;">${
                destAddress ?? "None"
              }</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 14px; color: #CBA135;">Car Type</p>
              <p style="margin: 5px 0 0; font-size: 16px; color: #111827;">${
                vehicleType.name
              }</p>
            </div>
          </div>
        </div>

        <!-- Price Summary -->
        <div style="padding: 30px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
          <h2 style="font-size: 16px; font-weight: bold; color: #111827; margin-bottom: 16px;">Price Summary</h2>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <p style="margin: 0; font-size: 16px; color: #4B5563;">Base Fare</p>
            <p style="margin: 0; font-size: 16px; color: #111827;">$${estimatedFare}</p>
          </div>
          <div
            style="display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; padding-top: 20px; font-weight: bold;">
            <p style="margin: 0; font-size: 16px; color: #111827;">Total Amount</p>
            <p style="margin: 0; font-size: 16px; color: #111827;">$${estimatedFare}</p>
          </div>
        </div>

        <!-- Help Section -->
        <div style="padding: 30px;">
          <h3 style="margin: 0; color: #BE252D; font-size: 16px; font-weight: bold;">Need Help?</h3>
          <p style="margin: 10px 0; font-size: 16px; color: #4B5563;">Contact our 24/7 support team:</p>
          <div style="margin-top: 16px;">
            <p style="margin: 0;"><img src=${
              mediaUrl + "/call.png"
            } alt="Phone " style="margin: 0px 10px 0px 0px"> +1 800-CAR-BOOK</p>
            <p style="margin: 0;"><img src=${
              mediaUrl + "/gmail.png"
            } alt="gmail" style="margin: 0px 10px 0px 0px">${
    config.llcMarketingEmail
  }</p>
          </div>
        </div>

        <div style="padding-bottom: 20px;">
          <div style="display: flex; justify-content: space-around; padding: 20px;">
            <div style="text-align: center;">
              <img src=${
                mediaUrl + "/freecancelation.png"
              } alt="Free Cancellation"
                style="width: 40px; height: auto; margin-bottom: 8px;">
              <p style="font-size: 12px; font-weight: 600; color: #111827; margin: 0;">Free Cancellation</p>
            </div>
            <div style="text-align: center;">
              <img src=${
                mediaUrl + "/paypal.png"
              } alt="Pay with PayPal" style="width: 40px; height: auto; margin-bottom: 8px;">
              <p style="font-size: 12px; font-weight: 600; color: #111827; margin: 0;">Pay safe with PayPal</p>
            </div>
            <div style="text-align: center;">
              <img src=${
                mediaUrl + "/driver.png"
              } alt="Licensed Drivers" style="width: 40px; height: auto; margin-bottom: 8px;">
              <p style="font-size: 12px; font-weight: 600; color: #111827; margin: 0;">Licensed Drivers</p>
            </div>
            <div style="text-align: center;">
              <img src=${
                mediaUrl + "/support.png"
              } alt="24/7 Support" style="width: 40px; height: auto; margin-bottom: 8px;">
              <p style="font-size: 12px; font-weight: 600; color: #111827; margin: 0;">24/7 Support</p>
            </div>
          </div>
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
          <div style="margin-bottom: 8px; font-size: 14px;">© ${new Date().getFullYear()} LLC. All rights reserved.</div>
        </div>
      </div>
    </body>
  </html>
`;
};

// later when the client asks, add this to the email as well
// <div style="font-size: 14px;">
//   <a href="#" style="color: #9CA3AF; text-decoration: none; margin: 0 5px;">Terms</a>
//   <a href="#" style="color: #9CA3AF; text-decoration: none; margin: 0 5px;">Privacy</a>
// </div>
