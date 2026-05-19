import express, { Request, Response } from "express";
import { createMediaTypeController } from "@/controllers";
import {
  authenticationMiddleware,
  rateLimitMiddleware,
  tryCatchWrapper,
} from "@/middlewares";
import { vehicleRouter } from "@routes/vehicle.router";
import { bookingRouter } from "@routes/booking.router";
import { authRouter } from "@routes/auth.router";
import { marketingRouter } from "@routes/marketing.router";
import { paymentRouter } from "@routes/payment.router";
import upload from "@/utils/multer.utils";
import { sendEmail } from "@/utils/mail.utils";

export const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  res.status(200).json({ message: "Running...", timestamp: Date.now() });
});
router.use("/auth", rateLimitMiddleware(100, 60e3), authRouter);
router.post(
  "/llc-media",
  upload.single("media"),
  tryCatchWrapper(createMediaTypeController)
);
router.use("/llc-vehicles", rateLimitMiddleware(100, 60e3), vehicleRouter);
router.use("/llc-bookings", rateLimitMiddleware(100, 60e3), bookingRouter);
router.use(
  "/llc-payments",
  rateLimitMiddleware(100, 60e3),
  authenticationMiddleware,
  paymentRouter
);
router.use("/llc-marketing", rateLimitMiddleware(100, 60e3), marketingRouter);
router.use("/llc-support", rateLimitMiddleware(100, 60e3), marketingRouter);
router.get("/email-test", async (req, res) => {
  await sendEmail({
    to: "aayush.twayana@gmail.com",
    subject: "Test Email",
    html: "<h1>Test Email</h1>",
  });
  res.send("email-test");
});
