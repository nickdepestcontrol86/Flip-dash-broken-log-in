/**
 * Better Auth Setup for Convex (Local Install)
 * Uses local schema for admin plugin support
 * @see https://convex-better-auth.netlify.app/features/local-install
 */
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { admin, apiKey } from "better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { betterAuth } from "better-auth";
import authSchema from "./betterAuth/schema";

const siteUrl = process.env.SITE_URL || "";

/**
 * Get the site URL dynamically from request origin.
 * Falls back to SITE_URL env var.
 */
function getSiteUrl(request?: Request | null): string {
  try {
    if (request && typeof request.headers?.get === "function") {
      const origin = request.headers.get("origin");
      if (origin) return origin;
      const referer = request.headers.get("referer");
      if (referer) {
        try { return new URL(referer).origin; } catch {}
      }
    }
  } catch {}
  return siteUrl;
}

// Create the Better Auth component client with LOCAL schema
// This enables admin plugin and other plugins that require schema changes
export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
  }
);

// Static trusted origins for CORS
const staticOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8081", // Expo Metro dev server
];

/**
 * Extract origin from a URL string safely.
 * Returns null if the URL is invalid or not http(s).
 */
function extractOrigin(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.origin;
    }
  } catch {
    // If it looks like an origin already (starts with http), extract it
    if (url.startsWith("http")) {
      return url.split("/").slice(0, 3).join("/");
    }
  }
  return null;
}

/**
 * Get trusted origins array for Better Auth CORS
 * Automatically trusts the request's origin and referer for all production environments.
 * This ensures deployed sites (Modal previews, Shipper domains, custom domains) all work.
 */
function getTrustedOrigins(request: Request): string[] {
  const origins = [...staticOrigins];
  if (siteUrl) origins.push(siteUrl);

  // Automatically trust the request's origin header
  // This is safe because Better Auth still validates the session cookie/token
  const requestOrigin = extractOrigin(request.headers.get("origin"));
  if (requestOrigin) {
    origins.push(requestOrigin);
  }

  // Also trust the referer origin (fallback for some auth flows like callbacks)
  const refererOrigin = extractOrigin(request.headers.get("referer"));
  if (refererOrigin) {
    origins.push(refererOrigin);
  }

  // For callback URL validation, also check URL params
  try {
    const url = new URL(request.url);
    const callbackOrigin = extractOrigin(url.searchParams.get("callbackURL"))
      || extractOrigin(url.searchParams.get("callback"))
      || extractOrigin(url.searchParams.get("redirectTo"));
    if (callbackOrigin) {
      origins.push(callbackOrigin);
    }
  } catch {}

  return [...new Set(origins)]; // Deduplicate
}

/**
 * Create Better Auth instance.
 * Returns a configured betterAuth instance for use with Convex.
 * Compatible with @convex-dev/better-auth@0.9.x
 */
export const createAuth = (ctx: GenericCtx<DataModel>, request?: Request) => {
  const dynamicSiteUrl = getSiteUrl(request);
  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: getTrustedOrigins,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    // User configuration with admin plugin fields
    user: {
      additionalFields: {
        name: {
          type: "string",
          required: false,
        },
        // Admin plugin required fields
        role: {
          type: "string",
          required: false,
          defaultValue: "user",
        },
        banned: {
          type: "boolean",
          required: false,
          defaultValue: false,
        },
        banReason: {
          type: "string",
          required: false,
        },
        banExpires: {
          type: "number",
          required: false,
        },
      },
    },
    plugins: [
      crossDomain({ siteUrl: dynamicSiteUrl }),
      convex(),
      admin({
        adminRoles: ["admin", "service-admin"],
      }),
      apiKey({
        // Enable session creation for API key requests
        // This allows API keys to authenticate admin operations
        enableSessionForAPIKeys: true,
      }),
    ],
  });
};

// ============================================================================
// USER TYPE - Define explicit type for Better Auth user
// ============================================================================

/**
 * Better Auth user type with admin plugin fields.
 * This provides type safety for user queries.
 */
interface BetterAuthUser {
  _id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: boolean;
  createdAt: number;
  updatedAt: number;
  // Admin plugin fields
  role?: string;
  banned?: boolean;
  banReason?: string;
  banExpires?: number;
}

// ============================================================================
// USER QUERIES - For settings panel and general use
// ============================================================================

/**
 * Get the current authenticated user.
 * NEVER throws — always returns null for unauthenticated/error states.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx): Promise<{
    id: string;
    _id: string;
    email: string;
    name: string | null;
    image: string | null;
    emailVerified: boolean | undefined;
    createdAt: number;
    updatedAt: number;
  } | null> => {
    try {
      const user = await authComponent.getAuthUser(ctx);
      if (!user) return null;

      const u = user as any;
      return {
        id: u._id ?? "",
        _id: u._id ?? "",
        email: u.email ?? "",
        name: u.name ?? null,
        image: u.image ?? null,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt ?? 0,
        updatedAt: u.updatedAt ?? 0,
      };
    } catch (error: unknown) {
      // Catch absolutely everything — never let this query throw
      // This handles: no session, expired session, invalid token, component errors
      return null;
    }
  },
});

/**
 * Get user by email address
 *
 * This is the recommended way to look up other users.
 * Email lookups use an index and avoid ID format issues.
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    try {
      const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
        model: "user",
        where: [{ field: "email", value: email }],
      }) as BetterAuthUser | null;
      if (!user) return null;

      return {
        id: user._id,
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
        createdAt: user.createdAt,
      };
    } catch {
      return null;
    }
  },
});

/**
 * List all users (for admin dashboard)
 *
 * Uses the Better Auth component's findMany to query users.
 */
export const listAllUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 100 }) => {
    try {
      const result = await ctx.runQuery(components.betterAuth.adapter.findMany, {
        model: "user",
        sortBy: {
          field: "createdAt",
          direction: "desc",
        },
        paginationOpts: { numItems: limit, cursor: null },
      });

      return result.page.map((user: any) => ({
        id: user._id,
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: user.role ?? "user",
        banned: user.banned ?? false,
      }));
    } catch {
      return [];
    }
  },
});

// ============================================================================
// ADMIN MUTATIONS - For user management via deploy key
// ============================================================================

/**
 * Delete a user and all their associated data (sessions, accounts)
 * This mutation is called via deploy key from Shipper's admin dashboard.
 * It properly cleans up all Better Auth related data for the user.
 */
export const deleteUser = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    // Delete all sessions for this user
    const sessions = await ctx.runQuery(components.betterAuth.adapter.findMany, {
      model: "session",
      where: [{ field: "userId", value: userId }],
      paginationOpts: { numItems: 100, cursor: null },
    });

    for (const session of sessions.page) {
      await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
        input: {
          model: "session",
          where: [{ field: "_id", value: session._id }],
        },
      });
    }

    // Delete all accounts for this user
    const accounts = await ctx.runQuery(components.betterAuth.adapter.findMany, {
      model: "account",
      where: [{ field: "userId", value: userId }],
      paginationOpts: { numItems: 100, cursor: null },
    });

    for (const account of accounts.page) {
      await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
        input: {
          model: "account",
          where: [{ field: "_id", value: account._id }],
        },
      });
    }

    // Delete the user
    await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
      input: {
        model: "user",
        where: [{ field: "_id", value: userId }],
      },
    });

    return { success: true };
  },
});
