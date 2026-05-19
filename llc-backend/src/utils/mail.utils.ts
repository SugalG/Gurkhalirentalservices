import { config } from "@/config";
import { AppError } from "@/middlewares";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: config.emailProvider.host,
  port: config.emailProvider.port,
  auth: {
    user: config.emailProvider.auth.user,
    pass: config.emailProvider.auth.pass,
  },
  debug: config.environment === "development" ? true : false,
  logger: true,
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: config.llcMarketingEmail,
      to,
      subject,
      html, // Email content (HTML format)
    });

    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new AppError("Failed to send an email", 500);
  }
}
