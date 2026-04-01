import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Better Auth tables (user, session, account, verification) are managed
  // automatically by the @convex-dev/better-auth component.

  // Application tables
  vehicles: defineTable({
    userId: v.string(),
    year: v.string(),
    make: v.string(),
    model: v.string(),
    trim: v.optional(v.string()),
    vin: v.optional(v.string()),
    miles: v.number(),
    purchasePrice: v.number(),
    mechanicalCondition: v.string(),
    appearance: v.string(),
    exteriorColor: v.optional(v.string()),
    interiorColor: v.optional(v.string()),
    status: v.string(),
    stockNumber: v.optional(v.string()),
    purchaseLocation: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    titleType: v.optional(v.string()),
    primaryDamage: v.optional(v.string()),
    secondaryDamage: v.optional(v.string()),
    drivability: v.optional(v.string()),
    datePurchased: v.optional(v.string()),
    sellerName: v.optional(v.string()),
    sellerPhone: v.optional(v.string()),
    sellerEmail: v.optional(v.string()),
    sellerLocation: v.optional(v.string()),
    sellerDescription: v.optional(v.string()),
    buyerName: v.optional(v.string()),
    salePrice: v.optional(v.number()),
    saleDate: v.optional(v.string()),
    commission: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_make", ["make"]),

  expenses: defineTable({
    userId: v.string(),
    vehicleId: v.id("vehicles"),
    date: v.string(),
    expenseType: v.string(),
    description: v.string(),
    amount: v.number(),
    isIncome: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_vehicleId", ["vehicleId"])
    .index("by_expenseType", ["expenseType"]),

  appraisals: defineTable({
    userId: v.string(),
    vehicleId: v.optional(v.string()),
    year: v.string(),
    make: v.string(),
    model: v.string(),
    trim: v.optional(v.string()),
    miles: v.number(),
    mechanicalCondition: v.string(),
    appearance: v.string(),
    retail: v.number(),
    tradeIn: v.number(),
    privateParty: v.number(),
    auction: v.number(),
    wholesale: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_vehicleId", ["vehicleId"]),

  payments: defineTable({
    userId: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    stripeSessionId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    priceId: v.optional(v.string()),
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
  })
    .index("by_user", ["userId"])
    .index("by_session", ["stripeSessionId"])
    .index("by_status", ["status"]),

  subscriptions: defineTable({
    userId: v.string(),
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
  })
    .index("by_user", ["userId"])
    .index("by_subscription", ["stripeSubscriptionId"])
    .index("by_customer", ["stripeCustomerId"]),
});
