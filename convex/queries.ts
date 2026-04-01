import { query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

// Type for Better Auth user (for TypeScript)
interface BetterAuthUser {
  _id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: boolean;
  createdAt: number;
  updatedAt: number;
}

// Helper to safely get auth user (returns null instead of throwing)
async function safeGetAuthUser(ctx: any): Promise<BetterAuthUser | null> {
  try {
    return await authComponent.getAuthUser(ctx) as BetterAuthUser | null;
  } catch {
    return null;
  }
}

// List all vehicles for the authenticated user
export const listVehicles = query({
  args: {},
  handler: async (ctx) => {
    const user = await safeGetAuthUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("vehicles")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();
  },
});

// Alias for listVehicles
export const getMyVehicles = listVehicles;

// Get a single vehicle by ID (only if owned by user)
export const getVehicle = query({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    const user = await safeGetAuthUser(ctx);
    if (!user) return null;

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== user._id) return null;
    return item;
  },
});

// List all expenses for the authenticated user
export const listExpenses = query({
  args: {},
  handler: async (ctx) => {
    const user = await safeGetAuthUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("expenses")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();
  },
});

// Alias for listExpenses
export const getMyExpenses = listExpenses;

// Get a single expense by ID (only if owned by user)
export const getExpense = query({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const user = await safeGetAuthUser(ctx);
    if (!user) return null;

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== user._id) return null;
    return item;
  },
});

// List all appraisals for the authenticated user
export const listAppraisals = query({
  args: {},
  handler: async (ctx) => {
    const user = await safeGetAuthUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("appraisals")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();
  },
});

// Alias for listAppraisals
export const getMyAppraisals = listAppraisals;

// Get a single appraisal by ID (only if owned by user)
export const getAppraisal = query({
  args: { id: v.id("appraisals") },
  handler: async (ctx, args) => {
    const user = await safeGetAuthUser(ctx);
    if (!user) return null;

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== user._id) return null;
    return item;
  },
});

// Get the current user's subscription status
export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await safeGetAuthUser(ctx);
    if (!user) return null;

    // Check for active subscription by userId
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .first();

    if (subscription && subscription.status === "active") {
      return {
        active: true,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      };
    }

    // Also check payments table for completed subscription payments
    // Match by userId first, then by email as fallback
    let payment = await ctx.db
      .query("payments")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .filter((q: any) => q.and(
        q.eq(q.field("status"), "completed"),
        q.eq(q.field("paymentType"), "subscription")
      ))
      .first();

    if (!payment && user.email) {
      // Fallback: check by email (for payments made before userId was linked)
      const allPayments = await ctx.db
        .query("payments")
        .filter((q: any) => q.and(
          q.eq(q.field("userEmail"), user.email),
          q.eq(q.field("status"), "completed"),
          q.eq(q.field("paymentType"), "subscription")
        ))
        .first();
      payment = allPayments;
    }

    if (payment) {
      return {
        active: true,
        status: "active" as const,
        currentPeriodEnd: (payment.paidAt || Date.now()) + 30 * 24 * 60 * 60 * 1000,
        cancelAtPeriodEnd: false,
      };
    }

    return { active: false, status: "none" as const };
  },
});
