import { mutation } from "./_generated/server";
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

// Create a new vehicle
export const createVehicle = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx) as BetterAuthUser | null;
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("vehicles", {
      userId: user._id,
      year: args.year,
      make: args.make,
      model: args.model,
      trim: args.trim,
      vin: args.vin,
      miles: args.miles,
      purchasePrice: args.purchasePrice,
      mechanicalCondition: args.mechanicalCondition,
      appearance: args.appearance,
      exteriorColor: args.exteriorColor,
      interiorColor: args.interiorColor,
      status: args.status,
      stockNumber: args.stockNumber,
      purchaseLocation: args.purchaseLocation,
      paymentMethod: args.paymentMethod,
      titleType: args.titleType,
      primaryDamage: args.primaryDamage,
      secondaryDamage: args.secondaryDamage,
      drivability: args.drivability,
      datePurchased: args.datePurchased,
      sellerName: args.sellerName,
      sellerPhone: args.sellerPhone,
      sellerEmail: args.sellerEmail,
      sellerLocation: args.sellerLocation,
      sellerDescription: args.sellerDescription,
      buyerName: args.buyerName,
      salePrice: args.salePrice,
      saleDate: args.saleDate,
      commission: args.commission,
      notes: args.notes,
    });
  },
});

// Update a vehicle (only if owned by user)
export const updateVehicle = mutation({
  args: {
    id: v.id("vehicles"),
    year: v.optional(v.string()),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    trim: v.optional(v.string()),
    vin: v.optional(v.string()),
    miles: v.optional(v.number()),
    purchasePrice: v.optional(v.number()),
    mechanicalCondition: v.optional(v.string()),
    appearance: v.optional(v.string()),
    exteriorColor: v.optional(v.string()),
    interiorColor: v.optional(v.string()),
    status: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx) as BetterAuthUser | null;
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== user._id) {
      throw new Error("Not found or not authorized");
    }

    const { id, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined)
    );

    await ctx.db.patch(args.id, cleanUpdates);
    return args.id;
  },
});

// Delete a vehicle (only if owned by user)
export const deleteVehicle = mutation({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx) as BetterAuthUser | null;
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== user._id) {
      throw new Error("Not found or not authorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Create a new expense
export const createExpense = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    date: v.string(),
    expenseType: v.string(),
    description: v.string(),
    amount: v.number(),
    isIncome: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx) as BetterAuthUser | null;
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("expenses", {
      userId: user._id,
      vehicleId: args.vehicleId,
      date: args.date,
      expenseType: args.expenseType,
      description: args.description,
      amount: args.amount,
      isIncome: args.isIncome,
    });
  },
});

// Update an expense (only if owned by user)
export const updateExpense = mutation({
  args: {
    id: v.id("expenses"),
    vehicleId: v.optional(v.id("vehicles")),
    date: v.optional(v.string()),
    expenseType: v.optional(v.string()),
    description: v.optional(v.string()),
    amount: v.optional(v.number()),
    isIncome: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx) as BetterAuthUser | null;
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== user._id) {
      throw new Error("Not found or not authorized");
    }

    const { id, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined)
    );

    await ctx.db.patch(args.id, cleanUpdates);
    return args.id;
  },
});

// Delete an expense (only if owned by user)
export const deleteExpense = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx) as BetterAuthUser | null;
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== user._id) {
      throw new Error("Not found or not authorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Create a new appraisal
export const createAppraisal = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx) as BetterAuthUser | null;
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("appraisals", {
      userId: user._id,
      vehicleId: args.vehicleId,
      year: args.year,
      make: args.make,
      model: args.model,
      trim: args.trim,
      miles: args.miles,
      mechanicalCondition: args.mechanicalCondition,
      appearance: args.appearance,
      retail: args.retail,
      tradeIn: args.tradeIn,
      privateParty: args.privateParty,
      auction: args.auction,
      wholesale: args.wholesale,
    });
  },
});

// Update an appraisal (only if owned by user)
export const updateAppraisal = mutation({
  args: {
    id: v.id("appraisals"),
    vehicleId: v.optional(v.string()),
    year: v.optional(v.string()),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    trim: v.optional(v.string()),
    miles: v.optional(v.number()),
    mechanicalCondition: v.optional(v.string()),
    appearance: v.optional(v.string()),
    retail: v.optional(v.number()),
    tradeIn: v.optional(v.number()),
    privateParty: v.optional(v.number()),
    auction: v.optional(v.number()),
    wholesale: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx) as BetterAuthUser | null;
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== user._id) {
      throw new Error("Not found or not authorized");
    }

    const { id, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined)
    );

    await ctx.db.patch(args.id, cleanUpdates);
    return args.id;
  },
});

// Delete an appraisal (only if owned by user)
export const deleteAppraisal = mutation({
  args: { id: v.id("appraisals") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx) as BetterAuthUser | null;
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== user._id) {
      throw new Error("Not found or not authorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
