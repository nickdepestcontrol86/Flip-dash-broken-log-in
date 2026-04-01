"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Verify a completed checkout session
 * Called from the success page to confirm payment
 */
export const verifySession = action({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return {
        status: session.status,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
        currency: session.currency,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Stripe error";
      throw new Error(`Session verification failed: ${message}`);
    }
  },
});

/**
 * Get customer's subscriptions (for customer portal)
 */
export const getCustomerSubscriptions = action({
  args: { customerId: v.string() },
  handler: async (ctx, { customerId }) => {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 10,
      });

      return subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        currentPeriodEnd: (sub as any).current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Stripe error";
      throw new Error(`Failed to get subscriptions: ${message}`);
    }
  },
});
