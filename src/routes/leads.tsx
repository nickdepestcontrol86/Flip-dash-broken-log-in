import { createFileRoute } from "@tanstack/react-router";

function LeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">🎯 Leads</h1>
        <p className="text-sm text-gray-400 mt-0.5">Premium filtered vehicle leads</p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-5 py-4 flex items-start gap-3">
        <span className="text-xl mt-0.5">🚀</span>
        <div>
          <p className="text-sm font-medium text-blue-300">Connect a Vehicle Listing Data API</p>
          <p className="text-xs text-blue-400/70 mt-1 leading-relaxed">
            Connect a vehicle listing data API (MarketCheck, AutoDev) to enable live leads with real-time market data. 
            Set your criteria and get matched vehicles delivered to your dashboard automatically.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sample lead cards (placeholder) */}
        {[
          { title: "Under-Market Deals", desc: "Vehicles priced 15%+ below market value", icon: "💰", color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20" },
          { title: "Low Mileage Finds", desc: "Vehicles with below-average mileage for year", icon: "🏎️", color: "from-blue-500/20 to-blue-500/5 border-blue-500/20" },
          { title: "Motivated Sellers", desc: "Listings with price drops in the last 7 days", icon: "📉", color: "from-orange-500/20 to-orange-500/5 border-orange-500/20" },
          { title: "High-Profit Potential", desc: "Vehicles with estimated 20%+ flip margin", icon: "🔥", color: "from-purple-500/20 to-purple-500/5 border-purple-500/20" },
        ].map((card) => (
          <div key={card.title} className={`bg-gradient-to-br ${card.color} border rounded-xl p-5`}>
            <span className="text-2xl">{card.icon}</span>
            <h3 className="text-sm font-semibold mt-3">{card.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />
              <span className="text-[11px] text-gray-500">Awaiting API connection</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-8 text-center">
        <span className="text-4xl block mb-3">🔌</span>
        <h3 className="text-lg font-semibold mb-2">No Leads Available Yet</h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto mb-4">
          Once you connect a data provider, leads matching your criteria will appear here in real-time.
        </p>
        <button className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity">
          Configure API Integration
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/leads")({
  component: LeadsPage,
});
