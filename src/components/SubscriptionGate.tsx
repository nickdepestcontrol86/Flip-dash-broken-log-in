import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "@tanstack/react-router";

/**
 * Wraps protected app content. Shows paywall if user has no active subscription.
 * Returns children if subscription is active or if Convex is not configured.
 */
export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const hasConvex = !!import.meta.env.VITE_CONVEX_URL;
  const currentUser = useQuery(api.auth.getCurrentUser, hasConvex ? {} : "skip");
  const subscription = useQuery(api.queries.getMySubscription, hasConvex ? {} : "skip");

  // No Convex = dev mode, show everything
  if (!hasConvex) return <>{children}</>;

  // Still loading auth
  if (currentUser === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#3dd45c]/20 border-t-[#3dd45c] animate-spin" />
      </div>
    );
  }

  // Not logged in — redirect to sign in
  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-[#131a2b] border border-white/[0.08] flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-gray-400 mb-6">You need to sign in to access this page.</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/signin"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
            <Link
              to="/pricing"
              className="px-6 py-2.5 rounded-xl border border-white/[0.1] text-gray-300 font-medium text-sm hover:bg-white/[0.04] transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Still loading subscription
  if (subscription === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#3dd45c]/20 border-t-[#3dd45c] animate-spin" />
      </div>
    );
  }

  // No active subscription — show paywall
  if (!subscription || !subscription.active) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3dd45c]/10 to-[#00c9a7]/10 border border-[#3dd45c]/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚡</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Activate Your{" "}
            <span className="bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] bg-clip-text text-transparent">
              FlipDash Pro
            </span>{" "}
            Subscription
          </h2>
          <p className="text-gray-400 mb-2 leading-relaxed">
            Get full access to inventory tracking, market valuations, Flip Score™, and everything you need to flip profitably.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Just <span className="text-white font-semibold">$49/month</span> — cancel anytime.
          </p>
          <Link
            to="/pricing"
            className="inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black font-bold text-base hover:shadow-lg hover:shadow-[#3dd45c]/20 hover:scale-[1.01] transition-all duration-200"
          >
            Start My Subscription
          </Link>
          <div className="mt-5 flex items-center justify-center gap-3 text-xs text-gray-500">
            <span>🔒 Secure payment via Stripe</span>
            <span>•</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    );
  }

  // Active subscription — show the app
  return <>{children}</>;
}
