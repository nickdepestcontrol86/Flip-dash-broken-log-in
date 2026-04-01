import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/checkout/success")({
  component: CheckoutSuccessPage,
});

function CheckoutSuccessPage() {
  const convex = useConvex();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [details, setDetails] = useState<{
    email?: string;
    amount?: number;
    currency?: string;
  } | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setStatus("error");
      return;
    }

    convex
      .action(api.stripe.verifySession, { sessionId })
      .then((result) => {
        if (result.status === "complete" || result.paymentStatus === "paid") {
          setStatus("success");
          setDetails({
            email: result.customerEmail || undefined,
            amount: result.amountTotal ? result.amountTotal / 100 : undefined,
            currency: result.currency?.toUpperCase(),
          });
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [convex]);

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#3dd45c]/20 border-t-[#3dd45c] animate-spin mx-auto mb-6" />
          <p className="text-gray-400 text-lg">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Issue</h1>
          <p className="text-gray-400 mb-8">
            Something went wrong verifying your payment. Please try again or contact support.
          </p>
          <button
            onClick={() => navigate({ to: "/pricing" })}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black font-bold text-base hover:shadow-lg hover:shadow-[#3dd45c]/20 hover:scale-[1.01] transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Success animation */}
        <div className="w-20 h-20 rounded-full bg-[#3dd45c]/10 border-2 border-[#3dd45c]/30 flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3dd45c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold mb-2">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] bg-clip-text text-transparent">FlipDash Pro!</span>
        </h1>
        <p className="text-gray-400 text-lg mb-2">
          Your subscription is active. Time to start flipping smarter.
        </p>

        {details?.email && (
          <p className="text-sm text-gray-500 mb-1">
            Confirmation sent to <span className="text-gray-300">{details.email}</span>
          </p>
        )}
        {details?.amount && details?.currency && (
          <p className="text-sm text-gray-500 mb-8">
            {details.currency} {details.amount.toFixed(2)}/month
          </p>
        )}

        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black font-bold text-base hover:shadow-lg hover:shadow-[#3dd45c]/20 hover:scale-[1.01] transition-all duration-200"
        >
          Go to Dashboard →
        </button>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span>🔒 Secure payment by Stripe</span>
          <span>•</span>
          <span>Cancel anytime in Settings</span>
        </div>
      </div>
    </div>
  );
}
