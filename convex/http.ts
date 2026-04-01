import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { createAuth } from "./auth";
import Stripe from "stripe";

const http = httpRouter();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ============================================================================
// BETTER AUTH ROUTES — handles all /api/auth/* requests
// ============================================================================

/**
 * Better Auth catch-all handler for GET requests
 * Handles: session checks, OAuth callbacks, email verification, etc.
 */
http.route({
  pathPrefix: "/api/auth/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = createAuth(ctx, request);
    return auth.handler(request);
  }),
});

/**
 * Better Auth catch-all handler for POST requests
 * Handles: sign-in, sign-up, sign-out, password reset, etc.
 */
http.route({
  pathPrefix: "/api/auth/",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = createAuth(ctx, request);
    return auth.handler(request);
  }),
});

// ============================================================================
// STRIPE ROUTES
// ============================================================================

/**
 * Stripe Checkout - Redirect Flow
 * Opens Stripe's hosted checkout page in a new tab
 */
http.route({
  path: "/stripe/checkout",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const priceId = url.searchParams.get("priceId");
    const appOrigin = url.searchParams.get("origin") || request.headers.get("referer")?.replace(/\/[^/]*$/, "") || "";

    if (!priceId) {
      return new Response("Missing priceId parameter", { status: 400 });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${appOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appOrigin}/pricing`,
      });

      return Response.redirect(session.url!, 303);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Stripe error";
      console.error("Checkout error:", message);
      return new Response(`Checkout failed: ${message}`, { status: 500 });
    }
  }),
});

/**
 * Stripe Webhook Handler
 */
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.log("STRIPE_WEBHOOK_SECRET not configured, skipping verification");
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Webhook signature verification failed: ${message}`);
      return new Response(`Webhook Error: ${message}`, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✅ Checkout completed:", session.id);
        
        await ctx.runMutation(internal.stripeWebhook.savePayment, {
          stripeSessionId: session.id,
          stripeCustomerId: session.customer as string | undefined,
          stripePaymentIntentId: session.payment_intent as string | undefined,
          stripeSubscriptionId: session.subscription as string | undefined,
          userEmail: session.customer_details?.email || undefined,
          amount: session.amount_total || 0,
          currency: session.currency || "usd",
          status: "completed",
          paymentType: session.mode === "subscription" ? "subscription" : "one_time",
          paidAt: Date.now(),
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("📦 Subscription updated:", subscription.id, subscription.status);
        
        await ctx.runMutation(internal.stripeWebhook.upsertSubscription, {
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id || "",
          status: subscription.status as "active" | "cancelled" | "past_due" | "unpaid" | "trialing",
          currentPeriodStart: (subscription as any).current_period_start * 1000,
          currentPeriodEnd: (subscription as any).current_period_end * 1000,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("❌ Subscription cancelled:", subscription.id);
        
        await ctx.runMutation(internal.stripeWebhook.cancelSubscription, {
          stripeSubscriptionId: subscription.id,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("⚠️ Payment failed for invoice:", invoice.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
