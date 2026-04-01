import { useState } from "react";
import { getCarsXEApiKey, setCarsXEApiKey, clearCarsXEApiKey, hasCarsXEApiKey } from "@/lib/valuation";

export function CarsXESettings() {
  const [apiKey, setApiKey] = useState(getCarsXEApiKey() || "");
  const [isConnected, setIsConnected] = useState(hasCarsXEApiKey());
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      setCarsXEApiKey(apiKey.trim());
      setIsConnected(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleDisconnect = () => {
    clearCarsXEApiKey();
    setApiKey("");
    setIsConnected(false);
  };

  return (
    <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📡</span>
          <h3 className="text-sm font-semibold">CarsXE API</h3>
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
          Connect your CarsXE API key to get live market values based on millions of real vehicle sales.
          Without an API key, the app uses a local estimation algorithm.
        </p>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your CarsXE API key"
                className="w-full bg-[#0a0e17] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#3dd45c]/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
              >
                {showKey ? "🙈" : "👁️"}
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saved ? "✅ Saved" : "Save"}
            </button>
          </div>
        </div>

        {isConnected && (
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-sm">📡</span>
              <span className="text-xs text-emerald-400">Live market data enabled for VIN-based appraisals</span>
            </div>
            <button
              onClick={handleDisconnect}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}

        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
          <p className="text-[11px] text-gray-500 mb-2 font-medium">How it works:</p>
          <ul className="space-y-1.5">
            <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
              <span className="text-blue-400 mt-0.5">1.</span>
              <span>Enter a VIN in the appraisal form</span>
            </li>
            <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
              <span className="text-blue-400 mt-0.5">2.</span>
              <span>CarsXE fetches real sale data from millions of transactions</span>
            </li>
            <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
              <span className="text-blue-400 mt-0.5">3.</span>
              <span>5 market values are calculated: Retail, Trade-In, Private Party, Auction, Wholesale</span>
            </li>
            <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
              <span className="text-blue-400 mt-0.5">4.</span>
              <span>Without API key, local algorithm estimates values based on depreciation curves</span>
            </li>
          </ul>
        </div>

        <a
          href="https://api.carsxe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Get a CarsXE API key →
        </a>
      </div>
    </div>
  );
}
