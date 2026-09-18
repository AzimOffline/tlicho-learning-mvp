import Stripe from "stripe";

import { getStripeEnvironment } from "./env";

const { apiSecretKey } = getStripeEnvironment();

export const stripe = new Stripe(apiSecretKey, {
  apiVersion: "2026-08-26.dahlia",
  typescript: true,
});
