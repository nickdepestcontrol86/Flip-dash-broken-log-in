import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Save a completed payment to the database
 */
export const savePayment = internalMutation({
  args: {
    stripeSessionId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded"),
      v.literal("cancelled")
    ),
    paymentType: v.union(v.literal("one_time"), v.literal("subscription")),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if payment already exists (idempotency)
    const existing = await ctx.db
      .query("payments")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .first();

    if (existing) {
      // Update existing payment
      await ctx.db.patch(existing._id, {
        status: args.status,
        paidAt: args.paidAt,
      });
      return existing._id;
    }

    // Create new payment record
    return await ctx.db.insert("payments", args);
  },
});

/**
 * Create or update a subscription
 */
export const upsertSubscription = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("past_due"),
      v.literal("unpaid"),
      v.literal("trialing")
    ),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Find existing subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_subscription", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .first();

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      });
      return existing._id;
    }

    // Create new subscription (need userId - you may want to look this up by stripeCustomerId)
    return await ctx.db.insert("subscriptions", {
      userId: "", // TODO: Look up userId by stripeCustomerId from your users table
      ...args,
    });
  },
});

/**
 * Mark a subscription as cancelled
 */
export const cancelSubscription = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, { stripeSubscriptionId }) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_subscription", (q) => q.eq("stripeSubscriptionId", stripeSubscriptionId))
      .first();

    if (subscription) {
      await ctx.db.patch(subscription._id, {
        status: "cancelled",
      });
    }
  },
});
