import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { signOutUser } from "@/lib/auth-client";

function SettingsPageInner() {
  const currentUser = useQuery(api.auth.getCurrentUser, {});
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"account" | "billing" | "preferences">("account");

  if (currentUser === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold mb-2">Sign in required</h2>
          <p className="text-gray-400 text-sm mb-4">You need to be signed in to access settings.</p>
          <button
            onClick={() => navigate({ to: "/signin" })}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (currentUser === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading settings...
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "account" as const, label: "Account", icon: "👤" },
    { id: "billing" as const, label: "Billing", icon: "💳" },
    { id: "preferences" as const, label: "Preferences", icon: "⚙️" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account, billing, and preferences</p>
      </div>

      <div className="flex gap-1 bg-[#131a2b] border border-white/[0.06] rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white/[0.08] text-white"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "account" && (
        <div className="space-y-6">
          <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold">Profile Information</h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl font-bold shrink-0">
                  {(currentUser?.name || currentUser?.email || "U")
                    .split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-lg font-semibold">{currentUser?.name || "User"}</p>
                  <p className="text-sm text-gray-400">{currentUser?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="px-4 py-3 rounded-xl bg-[#0a0e17] border border-white/[0.06] text-sm text-gray-300">
                    {currentUser?.name || "—"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="px-4 py-3 rounded-xl bg-[#0a0e17] border border-white/[0.06] text-sm text-gray-300">
                    {currentUser?.email || "—"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Member Since</label>
                <div className="px-4 py-3 rounded-xl bg-[#0a0e17] border border-white/[0.06] text-sm text-gray-300">
                  {currentUser?.createdAt
                    ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#131a2b] border border-red-500/20 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-red-500/10">
              <h3 className="text-sm font-semibold text-red-400">Danger Zone</h3>
            </div>
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Sign out of your account</p>
                <p className="text-xs text-gray-400 mt-0.5">You will need to sign in again to access your data.</p>
              </div>
              <button
                onClick={async () => {
                  await signOutUser();
                  navigate({ to: "/" });
                }}
                className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors shrink-0"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "billing" && (
        <div className="space-y-6">
          <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold">Current Plan</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold">Free Plan</h4>
                    <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-[11px] font-semibold">
                      CURRENT
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Basic vehicle tracking and appraisals</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">$0</p>
                  <p className="text-xs text-gray-500">/ month</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="px-4 py-3 rounded-xl bg-[#0a0e17] border border-white/[0.06]">
                  <p className="text-xs text-gray-400 mb-1">Vehicles</p>
                  <p className="text-sm font-semibold">Up to 10</p>
                </div>
                <div className="px-4 py-3 rounded-xl bg-[#0a0e17] border border-white/[0.06]">
                  <p className="text-xs text-gray-400 mb-1">Appraisals</p>
                  <p className="text-sm font-semibold">5 / month</p>
                </div>
                <div className="px-4 py-3 rounded-xl bg-[#0a0e17] border border-white/[0.06]">
                  <p className="text-xs text-gray-400 mb-1">Reports</p>
                  <p className="text-sm font-semibold">Basic</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#131a2b] to-[#0d1a2b] border border-[#3dd45c]/20 rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold">Pro Plan</h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#3dd45c]/20 text-[#3dd45c] text-[11px] font-semibold">
                      RECOMMENDED
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Everything you need to scale your business</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#3dd45c]">$29</p>
                  <p className="text-xs text-gray-500">/ month</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {[
                  "Unlimited vehicles",
                  "Unlimited appraisals",
                  "Advanced reports & analytics",
                  "CarsXE live market data",
                  "Lead management tools",
                  "Priority support",
                  "Export to CSV/PDF",
                  "Multi-user access",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-[#3dd45c]">✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black font-semibold text-sm hover:opacity-90 transition-opacity">
                ✨ Upgrade to Pro
              </button>
            </div>
          </div>

          <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold">Payment History</h3>
            </div>
            <div className="p-6 text-center py-10">
              <p className="text-gray-500 text-sm">No payment history yet</p>
              <p className="text-gray-600 text-xs mt-1">Your invoices will appear here after upgrading</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "preferences" && (
        <div className="space-y-6">
          <PreferenceCard
            title="Notifications"
            description="Manage how you receive notifications"
            items={[
              { label: "Email notifications for new leads", defaultOn: true },
              { label: "Weekly inventory summary", defaultOn: true },
              { label: "Appraisal value alerts", defaultOn: false },
            ]}
          />
          <PreferenceCard
            title="Display"
            description="Customize your dashboard experience"
            items={[
              { label: "Show portfolio value on dashboard", defaultOn: true },
              { label: "Show announcements panel", defaultOn: true },
              { label: "Compact vehicle cards", defaultOn: false },
            ]}
          />
          <PreferenceCard
            title="Data & Privacy"
            description="Control your data and privacy settings"
            items={[
              { label: "Share anonymous usage analytics", defaultOn: true },
              { label: "Allow CarsXE data enrichment", defaultOn: true },
            ]}
          />
        </div>
      )}
    </div>
  );
}

function SettingsPage() {
  const hasConvex = !!import.meta.env.VITE_CONVEX_URL;
  const navigate = useNavigate();

  if (!hasConvex) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold mb-2">Sign in required</h2>
          <p className="text-gray-400 text-sm mb-4">You need to be signed in to access settings.</p>
          <button
            onClick={() => navigate({ to: "/signin" })}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return <SettingsPageInner />;
}

function PreferenceCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: { label: string; defaultOn: boolean }[];
}) {
  return (
    <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {items.map((item) => (
          <ToggleRow key={item.label} label={item.label} defaultOn={item.defaultOn} />
        ))}
      </div>
    </div>
  );
}

function ToggleRow({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="px-6 py-4 flex items-center justify-between">
      <span className="text-sm text-gray-300">{label}</span>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          on ? "bg-[#3dd45c]" : "bg-gray-600"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});
