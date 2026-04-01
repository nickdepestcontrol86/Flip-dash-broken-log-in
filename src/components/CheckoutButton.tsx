/**
 * Stripe Checkout Button Component
 * Opens Stripe's hosted checkout page in a new tab
 * 
 * Usage:
 *   <CheckoutButton priceId="price_xxx" />
 *   <CheckoutButton priceId="price_xxx" label="Subscribe Now" />
 */

interface CheckoutButtonProps {
  priceId: string;
  label?: string;
  className?: string;
}

export function CheckoutButton({ priceId, label = "Buy Now", className }: CheckoutButtonProps) {
  // Pass origin so Stripe knows where to redirect back to
  const checkoutUrl = `${import.meta.env.VITE_CONVEX_SITE_URL}/stripe/checkout?priceId=${priceId}&origin=${encodeURIComponent(window.location.origin)}`;

  return (
    <a
      href={checkoutUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className || "inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"}
    >
      {label}
    </a>
  );
}
