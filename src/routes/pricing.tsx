import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function useAuthState() {
  const hasConvex = !!import.meta.env.VITE_CONVEX_URL;
  const currentUser = useQuery(api.auth.getCurrentUser, hasConvex ? {} : "skip");
  return {
    isLoading: hasConvex && currentUser === undefined,
    isLoggedIn: hasConvex && currentUser !== undefined && currentUser !== null,
  };
}

const PRICE_ID = "price_1THEaR3tkOMfsQ3kfwRkYBUp";

const features = [
  "Unlimited vehicle inventory tracking",
  "Real-time market valuations",
  "Flip Score™ on every deal",
  "Profit & expense tracking",
  "VIN decoder & vehicle insights",
  "Marketplace comparisons",
  "Detailed P&L reports",
  "Priority support",
];

function PricingPage() {
  const { isLoading, isLoggedIn } = useAuthState();

  const checkoutUrl = `${import.meta.env.VITE_CONVEX_SITE_URL}/stripe/checkout?priceId=${PRICE_ID}&origin=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "")}`;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-16 px-4">
      {/* Header */}
      <div className="text-center mb-12 max-w-2xl">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3dd45c]/10 border border-[#3dd45c]/20 text-[#3dd45c] text-xs font-semibold tracking-wide mb-5">
          💰 Simple Pricing
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
          One Plan.{" "}
          <span className="bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] bg-clip-text text-transparent">
            Everything You Need.
          </span>
        </h1>
        <p className="mt-4 text-gray-400 text-lg leading-relaxed">
          Get full access to every FlipDash feature. Cancel anytime.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="w-full max-w-md">
        <div className="relative bg-[#131a2b]/80 border border-[#3dd45c]/20 rounded-2xl p-8 sm:p-10 shadow-xl shadow-[#3dd45c]/[0.04]">
          {/* Popular badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black text-xs font-bold tracking-wide">
              MOST POPULAR
            </span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-white">FlipDash Pro</h2>
            <div className="mt-4 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-extrabold text-white">$49</span>
              <span className="text-gray-400 text-lg">/month</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Billed monthly</p>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-0.5 text-[#3dd45c] text-sm shrink-0">✓</span>
                <span className="text-sm text-gray-300">{f}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          {isLoading ? (
            <div className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-center text-black font-bold opacity-60">
              Loading...
            </div>
          ) : isLoggedIn ? (
            <a
              href={checkoutUrl}
              className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-center text-black font-bold text-base hover:shadow-lg hover:shadow-[#3dd45c]/20 hover:scale-[1.01] transition-all duration-200"
            >
              Start My Subscription
            </a>
          ) : (
            <Link
              to="/signup"
              className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-center text-black font-bold text-base hover:shadow-lg hover:shadow-[#3dd45c]/20 hover:scale-[1.01] transition-all duration-200"
            >
              Start My Subscription
            </Link>
          )}

          {/* Trust signals */}
          <div className="mt-5 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">🔒 Secure payment</span>
            <span>•</span>
            <span>Cancel anytime</span>
          </div>
          <div className="mt-3 flex items-center justify-center">
            <span className="text-[11px] text-gray-500">Powered by</span>
            <svg className="ml-1.5 h-4" viewBox="0 0 60 25" fill="none">
              <path d="M5 11.2C5 8.5 7.1 7.3 9.3 7.3c1.7 0 3 .7 3 .7l.6-2.5s-1.5-.9-3.8-.9C5.3 4.6 2 7 2 11.4c0 6.5 8.8 5.4 8.8 8.2 0 1.1-1 2-2.8 2-2.2 0-3.7-1-3.7-1L3.6 23s1.7 1 4.1 1c4 0 6.3-2.3 6.3-5.6C14 12 5 13.3 5 11.2z" fill="#6772e5"/>
              <path d="M20.5 4.6l-3 .6-1.2 5.5h-1.8l-.5 2.5h1.8L14 22.5c-.8 3.8 1 5 3.3 5 1 0 1.8-.2 1.8-.2l.5-2.5s-.5.1-1.2.1c-1 0-1.4-.5-1.1-2l1.7-9.7h2.3l.5-2.5h-2.3l.9-4.3-.1-.1z" fill="#6772e5"/>
              <path d="M30 8.8c-1.2 0-2.3.6-2.9 1.5l-.1-1.3h-2.8l-2 12h3l1-5.7c.4-2 1.5-3.2 2.8-3.2.5 0 .8.1.8.1l.6-3s-.5-.2-1.2-.2h-.2z" fill="#6772e5"/>
              <path d="M34.5 8.8c-3.3 0-5.5 3-5.5 6.3 0 2.5 1.5 4.5 4.3 4.5 1.3 0 2.5-.4 3.4-1.2l-.2 1h2.8l2-12h-3l-.1 1.2c-.7-.9-1.8-1.5-3.2-1.5l-.5.1zm.8 8.5c-1.3 0-2-1-2-2.3 0-2 1.2-3.8 3-3.8 1.3 0 2 1 2 2.3 0 2-1.2 3.8-3 3.8z" fill="#6772e5"/>
              <path d="M44 8.8c-3.3 0-5.5 3-5.5 6.3 0 2.5 1.5 4.5 4.3 4.5 3.3 0 5.5-3 5.5-6.3 0-2.5-1.5-4.5-4.3-4.5zm-.5 8.5c-1.3 0-2-1-2-2.3 0-2 1.2-3.8 3-3.8 1.3 0 2 1 2 2.3 0 2-1.2 3.8-3 3.8z" fill="#6772e5"/>
            </svg>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-lg w-full">
        <h3 className="text-center text-lg font-bold mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            { q: "Can I cancel anytime?", a: "Yes! Cancel your subscription at any time from your settings. No questions asked." },
            { q: "Is my payment secure?", a: "Absolutely. All payments are processed through Stripe, the industry standard for secure payments. We never see or store your card details." },
            { q: "What happens after I subscribe?", a: "You get instant access to all FlipDash features. Start tracking inventory, analyzing deals, and maximizing profits right away." },
          ].map((faq) => (
            <div key={faq.q} className="bg-[#131a2b]/60 border border-white/[0.06] rounded-xl p-5">
              <h4 className="text-sm font-semibold text-white">{faq.q}</h4>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});
