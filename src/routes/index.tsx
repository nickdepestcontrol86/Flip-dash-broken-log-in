import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { FlipScore } from "@/components/FlipScore";
import { DashboardPreview, InventoryPreview, ReportsPreview } from "@/components/DashboardPreview";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/* ─── Fade-in on scroll ─── */
function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Section wrapper ─── */
function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-20 sm:py-28 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">{children}</div>
    </section>
  );
}

/* ─── Badge ─── */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3dd45c]/10 border border-[#3dd45c]/20 text-[#3dd45c] text-xs font-semibold tracking-wide">
      {children}
    </span>
  );
}

/* ─── Auth state hook (non-blocking) ─── */
function useAuthState() {
  const hasConvex = !!import.meta.env.VITE_CONVEX_URL;
  const currentUser = useQuery(api.auth.getCurrentUser, hasConvex ? undefined : "skip");

  // undefined = still loading, null = not logged in, object = logged in
  return {
    isLoading: hasConvex && currentUser === undefined,
    isLoggedIn: hasConvex && currentUser !== undefined && currentUser !== null,
    hasConvex,
  };
}

/* ─── Auth-aware CTA button ─── */
function HeroCTA() {
  const { isLoading, isLoggedIn } = useAuthState();

  if (isLoading) {
    return (
      <span className="px-8 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black opacity-70">
        Loading...
      </span>
    );
  }

  if (isLoggedIn) {
    return (
      <Link
        to="/dashboard"
        className="px-8 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:shadow-lg hover:shadow-[#3dd45c]/20 hover:scale-[1.02] transition-all duration-200"
      >
        Go to Dashboard
      </Link>
    );
  }

  return (
    <Link
      to="/pricing"
      className="px-8 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:shadow-lg hover:shadow-[#3dd45c]/20 hover:scale-[1.02] transition-all duration-200"
    >
      Start Flipping Smarter
    </Link>
  );
}

function FinalCTAButton() {
  const { isLoading, isLoggedIn } = useAuthState();

  if (isLoading) {
    return (
      <span className="px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black opacity-70">
        Loading...
      </span>
    );
  }

  if (isLoggedIn) {
    return (
      <Link
        to="/dashboard"
        className="px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:shadow-lg hover:shadow-[#3dd45c]/25 hover:scale-[1.02] transition-all duration-200"
      >
        Go to Dashboard
      </Link>
    );
  }

  return (
    <Link
      to="/pricing"
      className="px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:shadow-lg hover:shadow-[#3dd45c]/25 hover:scale-[1.02] transition-all duration-200"
    >
      Start Flipping Smarter
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AUTH REDIRECT HOOK — non-blocking, only redirects once resolved
   ═══════════════════════════════════════════════════════════════ */
function useAuthRedirect() {
  const { isLoggedIn } = useAuthState();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isLoggedIn && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate({ to: "/inventory" });
    }
  }, [isLoggedIn, navigate]);
}

/* ═══════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#3dd45c]/[0.07] via-[#00c9a7]/[0.04] to-transparent rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-[#3dd45c]/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <FadeIn>
            <Badge>{"🚀"} The #1 Platform for Car Flippers</Badge>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Stop Guessing.{" "}
              <span className="bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] bg-clip-text text-transparent">
                Start Profiting
              </span>{" "}
              on Every Car.
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="mt-6 text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Know what to pay, what it{"'"}s worth, and how much you{"'"}ll make — before you buy.
            </p>
          </FadeIn>
          <FadeIn delay={300}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <HeroCTA />
              <a
                href="#how-it-works"
                className="px-6 py-3.5 rounded-xl text-base font-medium text-gray-300 border border-white/[0.1] hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-200"
              >
                See How It Works →
              </a>
            </div>
          </FadeIn>

        </div>

        {/* Dashboard Preview */}
        <FadeIn delay={500}>
          <DashboardPreview />
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAIN POINTS
   ═══════════════════════════════════════════════════════════════ */
function PainPoints() {
  const pains = [
    { icon: "💸", title: "Overpaying at Auction", desc: "Without real-time market data, you're bidding blind and leaving profit on the table." },
    { icon: "🎲", title: "Guessing Vehicle Values", desc: "KBB and gut feelings aren't enough. One bad estimate can wipe out a month of profit." },
    { icon: "🕳️", title: "Hidden Repair Costs", desc: "Unexpected repairs eat into margins. You need to know total cost before you commit." },
    { icon: "🐌", title: "Slow Inventory Turns", desc: "Cars sitting too long drain cash flow. Speed is everything in the flip game." },
  ];

  return (
    <Section className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/[0.02] to-transparent pointer-events-none" />
      <div className="relative">
        <FadeIn>
          <div className="text-center mb-14">
            <Badge>{"⚠️"} The Problem</Badge>
            <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
              Most Car Flippers{" "}
              <span className="text-red-400">Lose Money</span> Here
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pains.map((p, i) => (
            <FadeIn key={p.title} delay={i * 100}>
              <div className="bg-[#131a2b]/80 border border-white/[0.06] rounded-xl p-6 hover:border-red-500/20 hover:bg-red-500/[0.02] transition-all duration-300 group">
                <span className="text-2xl">{p.icon}</span>
                <h3 className="mt-3 text-base font-semibold group-hover:text-red-400 transition-colors">{p.title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={500}>
          <div className="mt-12 text-center">
            <p className="text-lg font-semibold">
              <span className="text-white">FlipDash</span>{" "}
              <span className="bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] bg-clip-text text-transparent">fixes this instantly.</span>
            </p>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    { num: "01", icon: "🔑", title: "Enter VIN or Search", desc: "Paste any VIN or search by year, make, and model to pull complete vehicle data instantly." },
    { num: "02", icon: "📊", title: "See Market Values", desc: "Get real-time retail, wholesale, and trade-in values from live market data sources." },
    { num: "03", icon: "📋", title: "Track Your Deal", desc: "Log purchase price, repairs, and expenses. FlipDash calculates your true all-in cost." },
    { num: "04", icon: "💰", title: "Maximize Profit", desc: "Know your exact margin, get a Flip Score, and sell at the perfect price point." },
  ];

  return (
    <Section id="how-it-works">
      <FadeIn>
        <div className="text-center mb-14">
          <Badge>{"⚡"} Simple Process</Badge>
          <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
            Four Steps to{" "}
            <span className="bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] bg-clip-text text-transparent">Smarter Flips</span>
          </h2>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((s, i) => (
          <FadeIn key={s.num} delay={i * 120}>
            <div className="relative bg-[#131a2b]/80 border border-white/[0.06] rounded-xl p-6 hover:border-[#3dd45c]/20 hover:bg-[#3dd45c]/[0.02] transition-all duration-300 group h-full">
              <span className="text-[11px] font-bold text-[#3dd45c]/40 uppercase tracking-widest">{s.num}</span>
              <span className="text-3xl block mt-3">{s.icon}</span>
              <h3 className="mt-4 text-base font-semibold group-hover:text-[#3dd45c] transition-colors">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              {i < 3 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 text-[#3dd45c]/30 text-lg">→</div>
              )}
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURES
   ═══════════════════════════════════════════════════════════════ */
function Features() {
  const features = [
    {
      icon: "📡",
      title: "Live Market Data",
      desc: "Real-time pricing from thousands of listings. Know the exact market value before you bid.",
      highlight: "Updated every hour",
    },
    {
      icon: "🧮",
      title: "Profit Calculator",
      desc: "Factor in purchase price, repairs, fees, and holding costs. See your true margin instantly.",
      highlight: "All-in cost tracking",
    },
    {
      icon: "🗂️",
      title: "Inventory Tracking",
      desc: "Manage prospects, active inventory, and sold vehicles. Track every dollar in and out.",
      highlight: "Full lifecycle view",
    },
    {
      icon: "🔍",
      title: "VIN Insights",
      desc: "Decode any VIN for specs, safety ratings, recalls, and market comparisons in seconds.",
      highlight: "Instant vehicle intel",
    },
  ];

  return (
    <Section id="features">
      <FadeIn>
        <div className="text-center mb-14">
          <Badge>{"🛠️"} Features</Badge>
          <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] bg-clip-text text-transparent">Flip Profitably</span>
          </h2>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {features.map((f, i) => (
          <FadeIn key={f.title} delay={i * 100}>
            <div className="bg-[#131a2b]/80 border border-white/[0.06] rounded-xl p-6 hover:border-[#3dd45c]/15 hover:shadow-lg hover:shadow-[#3dd45c]/[0.03] transition-all duration-300 group h-full">
              <div className="flex items-start gap-4">
                <span className="text-3xl shrink-0">{f.icon}</span>
                <div>
                  <h3 className="text-base font-semibold group-hover:text-[#3dd45c] transition-colors">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                  <span className="inline-block mt-3 px-2.5 py-1 rounded-md bg-[#3dd45c]/10 text-[#3dd45c] text-[11px] font-semibold">
                    {f.highlight}
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLIP SCORE (WOW FACTOR)
   ═══════════════════════════════════════════════════════════════ */
function FlipScoreSection() {
  return (
    <Section className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#3dd45c]/[0.03] to-transparent pointer-events-none" />
      <div className="relative">
        <FadeIn>
          <div className="text-center mb-6">
            <Badge>{"✨"} Exclusive</Badge>
            <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
              Introducing{" "}
              <span className="bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] bg-clip-text text-transparent">Flip Score™</span>
            </h2>
            <p className="mt-4 text-gray-400 max-w-xl mx-auto leading-relaxed">
              One powerful number that tells you if a deal is worth your time and money. Combines profit potential, market risk, and estimated sell speed.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 mt-12">
            {/* Score visual */}
            <div className="bg-[#131a2b]/80 border border-white/[0.08] rounded-2xl p-8 sm:p-10">
              <FlipScore score={8.6} profit={3200} risk="Low" speed="Fast" size="lg" animated />
            </div>

            {/* Explanation */}
            <div className="max-w-md space-y-5">
              {[
                { label: "Profit Potential", desc: "Estimated margin based on market data, your costs, and comparable sales.", icon: "💰" },
                { label: "Risk Assessment", desc: "Market volatility, days-on-market trends, and depreciation risk analysis.", icon: "🛡️" },
                { label: "Sell Speed", desc: "How fast similar vehicles are moving in your area right now.", icon: "⚡" },
              ].map((item, i) => (
                <FadeIn key={item.label} delay={300 + i * 100}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.label}</h4>
                      <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT PREVIEW
   ═══════════════════════════════════════════════════════════════ */
function ProductPreview() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: "Dashboard", desc: "See your entire portfolio at a glance — profit, costs, and performance trends.", component: <DashboardPreview /> },
    { label: "Inventory", desc: "Track every vehicle from prospect to sold with full cost breakdowns.", component: <InventoryPreview /> },
    { label: "Reports", desc: "Analyze your flip performance with detailed monthly and per-vehicle reports.", component: <ReportsPreview /> },
  ];

  return (
    <Section>
      <FadeIn>
        <div className="text-center mb-10">
          <Badge>{"👀"} Product Preview</Badge>
          <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
            Built for{" "}
            <span className="bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] bg-clip-text text-transparent">Serious Flippers</span>
          </h2>
        </div>
      </FadeIn>

      <FadeIn delay={150}>
        <div className="flex justify-center gap-2 mb-8">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === i
                  ? "bg-[#3dd45c]/15 text-[#3dd45c] border border-[#3dd45c]/25"
                  : "text-gray-400 border border-transparent hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={250}>
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-gray-400 text-sm mb-6">{tabs[activeTab].desc}</p>
          <div className="transition-all duration-500">
            {tabs[activeTab].component}
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SOCIAL PROOF
   ═══════════════════════════════════════════════════════════════ */
function SocialProof() {
  const testimonials = [
    {
      quote: "I replaced my entire spreadsheet system with FlipDash. Now I know my exact profit on every car before I even buy it.",
      name: "Marcus T.",
      role: "Full-time Flipper, Atlanta",
      avatar: "MT",
      metric: "$4,200 avg profit per flip",
    },
    {
      quote: "The Flip Score saved me from a bad Copart deal last week. That one feature alone paid for itself 10x over.",
      name: "Sarah K.",
      role: "Side Hustle Flipper, Dallas",
      avatar: "SK",
      metric: "Avoided $6K loss",
    },
    {
      quote: "I went from 3 flips a month to 8 because I can evaluate deals in seconds instead of hours. Game changer.",
      name: "James R.",
      role: "Dealer, Phoenix",
      avatar: "JR",
      metric: "2.5x more flips per month",
    },
  ];

  return (
    <Section id="testimonials">
      <FadeIn>
        <div className="text-center mb-14">
          <Badge>{"💬"} Trusted by Flippers</Badge>
          <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
            Real Results from{" "}
            <span className="bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] bg-clip-text text-transparent">Real Flippers</span>
          </h2>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((t, i) => (
          <FadeIn key={t.name} delay={i * 120}>
            <div className="bg-[#131a2b]/80 border border-white/[0.06] rounded-xl p-6 hover:border-[#3dd45c]/15 transition-all duration-300 h-full flex flex-col">
              <div className="flex-1">
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed italic">{`"${t.quote}"`}</p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3dd45c] to-[#00c9a7] flex items-center justify-center text-xs font-bold text-black">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-[11px] text-gray-500">{t.role}</p>
                </div>
              </div>
              <div className="mt-3 px-3 py-1.5 rounded-lg bg-[#3dd45c]/10 text-center">
                <span className="text-[11px] font-semibold text-[#3dd45c]">{t.metric}</span>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Stats bar */}
      <FadeIn delay={400}>
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: "2,400+", label: "Active Flippers" },
            { value: "$18M+", label: "Deals Analyzed" },
            { value: "94%", label: "Profitable Flips" },
            { value: "4.9/5", label: "User Rating" },
          ].map((s) => (
            <div key={s.label} className="text-center py-4 bg-[#131a2b]/50 border border-white/[0.04] rounded-xl">
              <p className="text-2xl font-bold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] bg-clip-text text-transparent">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <Section className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#3dd45c]/[0.04] to-transparent pointer-events-none" />
      <div className="relative">
        <FadeIn>
          <div className="bg-[#131a2b]/80 border border-white/[0.08] rounded-2xl p-10 sm:p-14 text-center max-w-3xl mx-auto">
            <span className="text-4xl">{"🚨"}</span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
              Every Bad Deal Costs You{" "}
              <span className="text-red-400">Thousands</span>
            </h2>
            <p className="mt-4 text-gray-400 max-w-lg mx-auto leading-relaxed">
              Stop relying on gut feelings and outdated data. FlipDash gives you the edge to profit on every single flip.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <FinalCTAButton />
            </div>

          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */
function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              <span className="text-white">Flip</span>
              <span className="text-[#3dd45c]">Dash</span>
            </span>
            <span className="text-xs text-gray-500">{`© ${new Date().getFullYear()}`}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
function LandingPage() {
  useAuthRedirect();

  return (
    <div>
      <Hero />
      <PainPoints />
      <HowItWorks />
      <Features />
      <FlipScoreSection />
      <ProductPreview />
      <SocialProof />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: LandingPage,
});
