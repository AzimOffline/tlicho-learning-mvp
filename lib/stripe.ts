import Stripe from "stripe";

import { isDemoMode } from "./demo-mode";
import { getStripeEnvironment } from "./env";

// Paid features are legacy-only and unavailable in the local demo. This
// non-secret placeholder lets Next.js discover the retained webhook route.
const apiSecretKey = isDemoMode()
  ? process.env.STRIPE_API_SECRET_KEY?.trim() || "sk_test_demo_mode_disabled"
  : getStripeEnvironment().apiSecretKey;

export const stripe = new Stripe(apiSecretKey, {
  apiVersion: "2026-08-26.dahlia",
  typescript: true,
});
