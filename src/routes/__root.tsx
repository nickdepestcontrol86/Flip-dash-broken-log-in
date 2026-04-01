import { createRootRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { StoreProvider } from "@/components/StoreProvider";
import { useState } from "react";
import { ConvexErrorBoundary } from "@/components/ConvexErrorBoundary";
import { SubscriptionGate } from "@/components/SubscriptionGate";

function SafeUserMenu() {
  const hasConvex = !!import.meta.env.VITE_CONVEX_URL;
  if (!hasConvex) return <GuestUserMenu />;
  return (
    <ConvexErrorBoundary fallback={<GuestUserMenu />}>
      <AuthenticatedUserMenu />
    </ConvexErrorBoundary>
  );
}

function AuthenticatedUserMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Lazy import to avoid module-level crash if convex/_generated is missing
  let currentUser: any = undefined;
  try {
    const { useQuery } = require("convex/react");
    const { api } = require("../../convex/_generated/api");
    currentUser = useQuery(api.auth.getCurrentUser, {});
  } catch {
    currentUser = null;
  }

  if (currentUser === undefined) {
    return <div className="w-8 h-8 rounded-full bg-white/[0.06] animate-pulse" />;
  }

  if (!currentUser) {
    return <GuestUserMenu />;
  }

  const initials = (currentUser.name || currentUser.email || "U").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold hover:ring-2 hover:ring-white/20 transition-all">{initials}</button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a2236] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-sm font-medium truncate">{currentUser.name || "User"}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
            </div>
            <div className="py-1">
              <Link to="/settings" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.04] hover:text-white transition-colors">⚙️ Settings</Link>
              <button onClick={async () => { setOpen(false); const { signOutUser } = await import("@/lib/auth-client"); await signOutUser(); navigate({ to: "/" }); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">🚪 Sign Out</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function GuestUserMenu() {
  return (
    <div className="flex items-center gap-2">
      <Link to="/signin" className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all">Sign In</Link>
      <Link to="/pricing" className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-[13px] font-semibold text-black hover:opacity-90 transition-opacity">Get Started</Link>
    </div>
  );
}

function FlipDashLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 28C6 16.954 14.954 8 26 8" stroke="url(#logo-grad)" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
      <path d="M8 28C8 18.059 16.059 10 26 10" stroke="url(#logo-grad)" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="18" y1="28" x2="30" y2="12" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <circle cx="18" cy="28" r="3" fill="url(#logo-grad)" />
      <line x1="10" y1="16" x2="12" y2="18" stroke="#3dd45c" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="8" y1="22" x2="11" y2="23" stroke="#3dd45c" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <defs>
        <linearGradient id="logo-grad" x1="6" y1="8" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3dd45c" />
          <stop offset="1" stopColor="#00c9a7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const PROTECTED_ROUTES = ["/dashboard", "/inventory", "/appraisals", "/marketplace", "/safety-specs", "/reports", "/settings", "/leads"];

function RootLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/inventory", label: "Inventory", icon: "🚗" },
    { to: "/appraisals", label: "Appraisals", icon: "🔥" },
    { to: "/marketplace", label: "Marketplace", icon: "🏪" },
    { to: "/safety-specs", label: "Vehicle Insights", icon: "🔍" },
    { to: "/reports", label: "Reports", icon: "📈" },
  ] as const;

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  const isAuthPage = location.pathname === "/signin" || location.pathname === "/signup";
  const isLandingPage = location.pathname === "/";
  const isPricingPage = location.pathname === "/pricing";
  const isCheckoutPage = location.pathname.startsWith("/checkout");
  const showAppNav = !isAuthPage && !isLandingPage && !isPricingPage && !isCheckoutPage;
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => location.pathname.startsWith(r));

  return (
    <StoreProvider>
      <div className="min-h-screen bg-[#0a0e17] text-white font-sans">
        <nav className="sticky top-0 z-50 bg-[#0d1220]/95 backdrop-blur-md border-b border-white/[0.06]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <FlipDashLogo />
              <span className="text-[20px] font-bold tracking-tight leading-none">
                <span className="text-white">Flip</span><span className="text-[#3dd45c]">Dash</span>
              </span>
            </Link>

            {showAppNav && (
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link key={item.to} to={item.to} className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${isActive(item.to) ? "bg-white/[0.08] text-white" : "text-gray-400 hover:text-white hover:bg-white/[0.04]"}`}>
                    <span className="mr-1.5">{item.icon}</span>{item.label}
                  </Link>
                ))}
              </div>
            )}

            {isLandingPage && (
              <div className="hidden md:flex items-center gap-6">
                <a href="#how-it-works" className="text-[13px] font-medium text-gray-400 hover:text-white transition-colors">How It Works</a>
                <a href="#features" className="text-[13px] font-medium text-gray-400 hover:text-white transition-colors">Features</a>
                <a href="#testimonials" className="text-[13px] font-medium text-gray-400 hover:text-white transition-colors">Testimonials</a>
              </div>
            )}

            <div className="flex items-center gap-3">
              <SafeUserMenu />
              {showAppNav && (
                <button className="md:hidden p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
                  </svg>
                </button>
              )}
            </div>
          </div>

          {mobileOpen && showAppNav && (
            <div className="md:hidden border-t border-white/[0.06] bg-[#0d1220] px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className={`block px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all ${isActive(item.to) ? "bg-white/[0.08] text-white" : "text-gray-400 hover:text-white hover:bg-white/[0.04]"}`}>
                  <span className="mr-2">{item.icon}</span>{item.label}
                </Link>
              ))}
              <Link to="/settings" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-[14px] font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all">
                <span className="mr-2">⚙️</span>Settings
              </Link>
            </div>
          )}
        </nav>

        <main className={isLandingPage ? "" : "max-w-[1400px] mx-auto px-4 sm:px-6 py-6"}>
          {isProtectedRoute ? (
            <ConvexErrorBoundary fallback={
              <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-[#131a2b] border border-white/[0.08] flex items-center justify-center mx-auto mb-5">
                    <span className="text-3xl">🔒</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
                  <p className="text-gray-400 mb-6">Please sign in to access this page.</p>
                  <Link to="/signin" className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black font-semibold text-sm hover:opacity-90 transition-opacity">Sign In</Link>
                </div>
              </div>
            }>
              <SubscriptionGate>
                <Outlet />
              </SubscriptionGate>
            </ConvexErrorBoundary>
          ) : (
            <ConvexErrorBoundary>
              <Outlet />
            </ConvexErrorBoundary>
          )}
        </main>
      </div>
    </StoreProvider>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
