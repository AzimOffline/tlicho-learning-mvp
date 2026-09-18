export const LEGACY_STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: "checkout.session.completed",
  INVOICE_PAYMENT_SUCCEEDED: "invoice.payment_succeeded",
} as const;

export type LegacyStripeWebhookAction =
  "create-subscription" | "renew-subscription" | "ignore";

/**
 * Characterizes the webhook events handled by the legacy subscription flow.
 * Stage 1 will replace this with provider-neutral entitlement processing.
 */
export const classifyLegacyStripeWebhookEvent = (
  eventType: string
): LegacyStripeWebhookAction => {
  if (eventType === LEGACY_STRIPE_WEBHOOK_EVENTS.CHECKOUT_COMPLETED)
    return "create-subscription";

  if (eventType === LEGACY_STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED)
    return "renew-subscription";

  return "ignore";
};
