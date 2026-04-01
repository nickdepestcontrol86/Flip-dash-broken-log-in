import { useState } from "react";
import { fmtCurrency } from "@/lib/store";
import type { ValuationResult } from "@/lib/valuation";

interface ValuationDashboardProps {
  result: ValuationResult;
  vehicleLabel?: string;
  purchasePrice?: number;
}

const VALUE_TIERS = [
  {
    key: "retail" as const,
    label: "Retail",
    emoji: "🏷️",
    description: "Dealer asking price",
    color: "from-red-500 to-rose-600",
    textColor: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    ringColor: "ring-red-500/30",
  },
  {
    key: "privateParty" as const,
    label: "Private Party",
    emoji: "🤝",
    description: "Person-to-person sale",
    color: "from-purple-500 to-violet-600",
    textColor: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    ringColor: "ring-purple-500/30",
  },
  {
    key: "tradeIn" as const,
    label: "Trade-In",
    emoji: "🔄",
    description: "Dealer trade-in offer",
    color: "from-orange-500 to-amber-600",
    textColor: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    ringColor: "ring-orange-500/30",
  },
  {
    key: "auction" as const,
    label: "Auction",
    emoji: "🔨",
    description: "Dealer auction price",
    color: "from-blue-500 to-cyan-600",
    textColor: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    ringColor: "ring-blue-500/30",
  },
  {
    key: "wholesale" as const,
    label: "Wholesale",
    emoji: "📦",
    description: "Bulk dealer purchase",
    color: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    ringColor: "ring-emerald-500/30",
  },
];

export function ValuationDashboard({ result, vehicleLabel, purchasePrice }: ValuationDashboardProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const maxValue = Math.max(result.retail, result.privateParty, result.tradeIn, result.auction, result.wholesale);

  function getBarWidth(value: number): number {
    if (maxValue === 0) return 0;
    return Math.max((value / maxValue) * 100, 8);
  }

  function getProfitMargin(value: number): number | null {
    if (!purchasePrice || purchasePrice === 0) return null;
    return value - purchasePrice;
  }

  const avgValue = Math.round((result.retail + result.privateParty + result.tradeIn + result.auction + result.wholesale) / 5);
  const spread = result.retail - result.wholesale;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            💰 Market Valuation
            {result.source === "carsxe" ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
                Live Data
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 text-[10px] font-semibold uppercase tracking-wider">
                Estimated
              </span>
            )}
          </h3>
          {vehicleLabel && (
            <p className="text-sm text-gray-400 mt-0.5">{vehicleLabel}</p>
          )}
        </div>
        {result.marketData && result.marketData.sampleSize > 0 && (
          <div className="text-right">
            <p className="text-[11px] text-gray-500">
              Based on <span className="text-white font-medium">{result.marketData.sampleSize.toLocaleString()}</span> comparable sales
            </p>
            {result.marketData.publishDate && (
              <p className="text-[10px] text-gray-600">Updated {result.marketData.publishDate}</p>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Average Value</p>
          <p className="text-xl font-bold text-white">{fmtCurrency(avgValue)}</p>
        </div>
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Value Spread</p>
          <p className="text-xl font-bold text-gray-300">{fmtCurrency(spread)}</p>
        </div>
        {purchasePrice !== undefined && purchasePrice > 0 && (
          <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4 col-span-2 sm:col-span-1">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Your Cost</p>
            <p className="text-xl font-bold text-white">{fmtCurrency(purchasePrice)}</p>
          </div>
        )}
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {VALUE_TIERS.map((tier) => {
          const value = result[tier.key];
          const margin = getProfitMargin(value);
          const isSelected = selectedTier === tier.key;

          return (
            <button
              key={tier.key}
              onClick={() => setSelectedTier(isSelected ? null : tier.key)}
              className={`relative bg-[#131a2b] border rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.02] ${
                isSelected
                  ? `${tier.borderColor} ring-1 ${tier.ringColor} ${tier.bgColor}`
                  : "border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              {/* Tier Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{tier.emoji}</span>
                <div>
                  <p className={`text-xs font-semibold ${tier.textColor}`}>{tier.label}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">{tier.description}</p>
                </div>
              </div>

              {/* Value */}
              <p className="text-2xl font-bold text-white mb-2">{fmtCurrency(value)}</p>

              {/* Bar Indicator */}
              <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${tier.color} transition-all duration-500`}
                  style={{ width: `${getBarWidth(value)}%` }}
                />
              </div>

              {/* Profit/Loss Indicator */}
              {margin !== null && (
                <div className={`text-[11px] font-medium ${margin >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {margin >= 0 ? "+" : ""}{fmtCurrency(margin)} {margin >= 0 ? "profit" : "loss"}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded Detail Panel */}
      {selectedTier && (
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {(() => {
            const tier = VALUE_TIERS.find((t) => t.key === selectedTier);
            if (!tier) return null;
            const value = result[tier.key];
            const margin = getProfitMargin(value);

            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tier.emoji}</span>
                  <div>
                    <h4 className={`text-base font-bold ${tier.textColor}`}>{tier.label} Value</h4>
                    <p className="text-sm text-gray-400">{tier.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Value</p>
                    <p className="text-lg font-bold text-white">{fmtCurrency(value)}</p>
                  </div>
                  {margin !== null && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Margin</p>
                      <p className={`text-lg font-bold ${margin >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {margin >= 0 ? "+" : ""}{fmtCurrency(margin)}
                      </p>
                    </div>
                  )}
                  {margin !== null && purchasePrice && purchasePrice > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">ROI</p>
                      <p className={`text-lg font-bold ${margin >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {((margin / purchasePrice) * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">vs Average</p>
                    <p className={`text-lg font-bold ${value >= avgValue ? "text-emerald-400" : "text-red-400"}`}>
                      {value >= avgValue ? "+" : ""}{fmtCurrency(value - avgValue)}
                    </p>
                  </div>
                </div>

                {/* Context Tips */}
                <div className={`${tier.bgColor} rounded-lg p-3`}>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {tier.key === "retail" && "This is what a dealer would list this vehicle for on their lot. Includes dealer markup, reconditioning, and warranty costs."}
                    {tier.key === "privateParty" && "Expected price in a direct sale between individuals. No dealer overhead, but buyer assumes all risk."}
                    {tier.key === "tradeIn" && "What a dealer would offer if you traded this vehicle in. Lower because the dealer needs room for reconditioning and profit."}
                    {tier.key === "auction" && "Price at a dealer-only auction. Typically 10-15% below trade-in due to auction fees and buyer uncertainty."}
                    {tier.key === "wholesale" && "Bulk purchase price for dealers buying in volume. The lowest tier, but fastest way to move a vehicle."}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Visual Bar Chart */}
      <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-300 mb-4">📊 Value Comparison</h4>
        <div className="space-y-3">
          {VALUE_TIERS.map((tier) => {
            const value = result[tier.key];
            return (
              <div key={tier.key} className="flex items-center gap-3">
                <div className="w-24 shrink-0">
                  <p className={`text-xs font-medium ${tier.textColor}`}>{tier.label}</p>
                </div>
                <div className="flex-1 h-7 bg-white/[0.04] rounded-lg overflow-hidden relative">
                  <div
                    className={`h-full rounded-lg bg-gradient-to-r ${tier.color} transition-all duration-700 flex items-center justify-end pr-2`}
                    style={{ width: `${getBarWidth(value)}%` }}
                  >
                    <span className="text-[11px] font-bold text-white drop-shadow-sm">
                      {fmtCurrency(value)}
                    </span>
                  </div>
                  {/* Purchase price marker */}
                  {purchasePrice && purchasePrice > 0 && maxValue > 0 && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white/40 z-10"
                      style={{ left: `${Math.min((purchasePrice / maxValue) * 100, 100)}%` }}
                      title={`Your cost: ${fmtCurrency(purchasePrice)}`}
                    />
                  )}
                </div>
              </div>
            );
          })}
          {purchasePrice && purchasePrice > 0 && (
            <div className="flex items-center gap-2 mt-2 pl-24">
              <div className="w-3 h-0.5 bg-white/40" />
              <span className="text-[10px] text-gray-500">Your cost: {fmtCurrency(purchasePrice)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Source Attribution */}
      <div className="flex items-center justify-between text-[10px] text-gray-600 px-1">
        <span>
          Source: {result.source === "carsxe" ? "CarsXE Market Data" : "List Effect Estimation Engine"}
        </span>
        <span>Values are estimates and may vary by region</span>
      </div>
    </div>
  );
}

// ─── Compact Valuation Cards (for dashboard/inventory views) ─────────

interface CompactValuationProps {
  retail: number;
  tradeIn: number;
  privateParty: number;
  auction: number;
  wholesale: number;
  purchasePrice?: number;
}

export function CompactValuationCards({ retail, tradeIn, privateParty, auction, wholesale, purchasePrice }: CompactValuationProps) {
  const tiers = [
    { label: "Retail", value: retail, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Trade-In", value: tradeIn, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Private", value: privateParty, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Auction", value: auction, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Wholesale", value: wholesale, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {tiers.map((t) => {
        const margin = purchasePrice ? t.value - purchasePrice : null;
        return (
          <div key={t.label} className={`${t.bg} rounded-lg p-2.5 text-center`}>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">{t.label}</p>
            <p className={`text-sm font-bold ${t.color}`}>{fmtCurrency(t.value)}</p>
            {margin !== null && (
              <p className={`text-[9px] font-medium mt-0.5 ${margin >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {margin >= 0 ? "+" : ""}{fmtCurrency(margin)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Inline Mini Valuation (for table rows) ──────────────────────────

interface MiniValuationProps {
  retail: number;
  wholesale: number;
}

export function MiniValuationRange({ retail, wholesale }: MiniValuationProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-emerald-400 text-xs font-medium">{fmtCurrency(wholesale)}</span>
      <div className="w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-red-500 rounded-full" />
      <span className="text-red-400 text-xs font-medium">{fmtCurrency(retail)}</span>
    </div>
  );
}
