import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SafetySpecsTab } from "@/components/SafetySpecsTab";

function SafetySpecsPage() {
  const [vinInput, setVinInput] = useState("");
  const [activeVin, setActiveVin] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<{ vin: string; label: string; time: number }[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = vinInput.trim().toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
    if (cleaned.length !== 17) {
      setError("VIN must be exactly 17 characters (letters A-H, J-N, P, R-Z and digits 0-9)");
      return;
    }
    setError(null);
    setActiveVin(cleaned);
    setVinInput(cleaned);
    // Add to search history (avoid duplicates)
    setSearchHistory((prev) => {
      const filtered = prev.filter((h) => h.vin !== cleaned);
      return [{ vin: cleaned, label: cleaned, time: Date.now() }, ...filtered].slice(0, 10);
    });
  };

  const handleClear = () => {
    setActiveVin(null);
    setVinInput("");
    setError(null);
  };

  const handleHistoryClick = (vin: string) => {
    setVinInput(vin);
    setActiveVin(vin);
    setError(null);
  };

  const exampleVins = [
    { vin: "1HGBH41JXMN109186", label: "Honda Civic" },
    { vin: "5YJSA1DG9DFP14705", label: "Tesla Model S" },
    { vin: "1FA6P8CF5L5171234", label: "Ford Mustang" },
    { vin: "WBA3A5C55CF256789", label: "BMW 3 Series" },
    { vin: "1G1YY22G965109876", label: "Chevrolet Corvette" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3dd45c] to-[#00c9a7] flex items-center justify-center text-xl">
            🛡️
          </div>
          <div>
            <h1 className="text-2xl font-bold">Vehicle Insights</h1>
            <p className="text-sm text-gray-400">Look up any vehicle by VIN — recalls, safety ratings, complaints & decoded specs</p>
          </div>
        </div>
      </div>

      {/* VIN Search Bar */}
      <div className="bg-[#131a2b] border border-white/[0.06] rounded-2xl p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter a 17-character VIN (Vehicle Identification Number)
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={vinInput}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "").slice(0, 17);
                    setVinInput(val);
                    setError(null);
                  }}
                  placeholder="e.g. 1HGBH41JXMN109186"
                  className="w-full px-4 py-3 bg-[#0a0e17] border border-white/[0.08] rounded-xl text-white font-mono text-lg tracking-widest placeholder:text-gray-600 placeholder:tracking-normal placeholder:font-sans placeholder:text-base focus:outline-none focus:border-[#3dd45c]/50 focus:ring-1 focus:ring-[#3dd45c]/20 transition-all"
                  maxLength={17}
                  spellCheck={false}
                  autoComplete="off"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className={`text-xs font-mono ${vinInput.length === 17 ? "text-emerald-400" : "text-gray-600"}`}>
                    {vinInput.length}/17
                  </span>
                  {vinInput && (
                    <button
                      type="button"
                      onClick={() => { setVinInput(""); setError(null); }}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={vinInput.length !== 17}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
              >
                🔍 Look Up
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-1.5">
                <span>⚠️</span> {error}
              </p>
            )}
          </div>

          {/* Quick Examples */}
          {!activeVin && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Try an example VIN:</p>
              <div className="flex flex-wrap gap-2">
                {exampleVins.map((ex) => (
                  <button
                    key={ex.vin}
                    type="button"
                    onClick={() => {
                      setVinInput(ex.vin);
                      setActiveVin(ex.vin);
                      setError(null);
                      setSearchHistory((prev) => {
                        const filtered = prev.filter((h) => h.vin !== ex.vin);
                        return [{ vin: ex.vin, label: ex.label, time: Date.now() }, ...filtered].slice(0, 10);
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-gray-400 hover:text-white transition-all"
                  >
                    <span className="font-mono text-[#3dd45c]">{ex.vin.slice(0, 6)}...</span>
                    <span className="ml-1.5 text-gray-500">{ex.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search History */}
          {!activeVin && searchHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">Recent searches:</p>
                <button
                  type="button"
                  onClick={() => setSearchHistory([])}
                  className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
                >
                  Clear history
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((h) => (
                  <button
                    key={h.vin}
                    type="button"
                    onClick={() => handleHistoryClick(h.vin)}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs text-blue-400 hover:text-blue-300 transition-all font-mono"
                  >
                    {h.vin}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Active VIN Header + Clear */}
      {activeVin && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Showing results for:</span>
            <span className="font-mono text-sm text-[#3dd45c] bg-[#3dd45c]/10 px-3 py-1 rounded-lg border border-[#3dd45c]/20">
              {activeVin}
            </span>
          </div>
          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-all"
          >
            ← New Search
          </button>
        </div>
      )}

      {/* Results */}
      {activeVin && (
        <SafetySpecsTab vin={activeVin} />
      )}

      {/* Empty State */}
      {!activeVin && (
        <div className="space-y-6">
          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: "💥",
                title: "Crash Test Ratings",
                desc: "NHTSA star ratings for front, side, and rollover crash tests",
                color: "from-orange-500/20 to-red-500/20",
                border: "border-orange-500/10",
              },
              {
                icon: "⚠️",
                title: "Safety Recalls",
                desc: "Active recall notices with detailed remedy information",
                color: "from-yellow-500/20 to-orange-500/20",
                border: "border-yellow-500/10",
              },
              {
                icon: "📋",
                title: "Owner Complaints",
                desc: "Real complaints filed with NHTSA including crash and injury data",
                color: "from-blue-500/20 to-purple-500/20",
                border: "border-blue-500/10",
              },
              {
                icon: "🔧",
                title: "VIN Decoded Specs",
                desc: "Full vehicle specifications decoded from the VIN number",
                color: "from-emerald-500/20 to-teal-500/20",
                border: "border-emerald-500/10",
              },
            ].map((card) => (
              <div key={card.title} className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-xl p-5`}>
                <span className="text-3xl mb-3 block">{card.icon}</span>
                <h3 className="text-sm font-bold text-white mb-1">{card.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* External Links */}
          <div className="bg-[#131a2b] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span>🔗</span> Quick External Lookups
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: "NICB Theft Check", desc: "Free stolen vehicle lookup", icon: "🚨", url: "https://www.nicb.org/vincheck", badge: "Free" },
                { name: "NHTSA Recalls", desc: "Official recall database", icon: "⚠️", url: "https://www.nhtsa.gov/recalls", badge: "Free" },
                { name: "CARFAX", desc: "Full vehicle history report", icon: "📋", url: "https://www.carfax.com", badge: "Paid" },
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all group"
                >
                  <span className="text-2xl">{link.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white group-hover:text-[#3dd45c] transition-colors">{link.name}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${link.badge === "Free" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}>
                        {link.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{link.desc}</p>
                  </div>
                  <span className="text-gray-600 group-hover:text-gray-300 text-sm">↗</span>
                </a>
              ))}
            </div>
          </div>

          {/* Data Sources Info */}
          <div className="bg-[#0d1220] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-xl">📡</span>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Powered by NHTSA Open Data</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  All safety data is sourced in real-time from the National Highway Traffic Safety Administration (NHTSA) public APIs.
                  This includes the vPIC VIN Decoder, Safety Ratings, Recalls, and Complaints databases.
                  Data is free, official, and updated regularly by the U.S. Department of Transportation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/safety-specs")({
  component: SafetySpecsPage,
});
