import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
  PaymentsController,
} from "@paypal/paypal-server-sdk";
import { config } from "@/config";

const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: config.paypal.clientId,
    oAuthClientSecret: config.paypal.clientSecret,
  },
  timeout: 0,
  environment:
    config.environment === "production"
      ? Environment.Production
      : Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});

export const ordersController = new OrdersController(paypalClient);
export const paymentsController = new PaymentsController(paypalClient);
