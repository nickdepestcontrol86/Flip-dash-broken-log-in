import { getMarketCheckApiKey, hasMarketCheckApiKey } from "@/lib/marketcheck";

export function MarketCheckSettings() {
  const isConnected = hasMarketCheckApiKey();
  const maskedKey = getMarketCheckApiKey().replace(/.(?=.{4})/g, "*");

  return (
    <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <h3 className="text-sm font-semibold">MarketCheck API</h3>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
          isConnected
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-gray-500/15 text-gray-400"
        }`}>
          {isConnected ? "✅ Connected" : "Not Connected"}
        </span>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-xs text-gray-400">
          Connect your MarketCheck API key to browse real vehicle listings from dealers and private sellers across the country.
          Without an API key, the Marketplace shows sample data.
        </p>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">API Key</label>
          <div className="bg-[#0a0e17] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-gray-400 font-mono">
            {maskedKey}
          </div>
          <p className="text-[10px] text-gray-600 mt-1">Pre-configured. No setup needed.</p>
        </div>

        {isConnected && (
          <div className="flex items-center bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-sm">{"🔍"}</span>
              <span className="text-xs text-emerald-400">Live marketplace listings enabled</span>
            </div>
          </div>
        )}

        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
          <p className="text-[11px] text-gray-500 mb-2 font-medium">What you get:</p>
          <ul className="space-y-1.5">
            <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Real dealer &amp; private party listings with photos</span>
            </li>
            <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Search by zip code &amp; radius for local inventory</span>
            </li>
            <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Direct links to original listings (AutoTrader, Cars.com, etc.)</span>
            </li>
            <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Flipdash Value Engine analyzes every listing for deal quality</span>
            </li>
          </ul>
        </div>

        <a
          href="https://www.marketcheck.com/automotive"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Get a MarketCheck API key →
        </a>
      </div>
    </div>
  );
}
