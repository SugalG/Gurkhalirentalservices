import { ReactPayPalScriptOptions } from "@paypal/react-paypal-js";

export const initialOptions: ReactPayPalScriptOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  intent: "capture",
  enableFunding: "paypal,card,credit",
  disableFunding: "",
  // buyerCountry: "US",
  currency: "USD",
  components: "buttons",
};
