export function DashboardPreview() {
  return (
    <div className="relative w-full max-w-[680px] mx-auto">
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-b from-[#3dd45c]/10 via-[#00c9a7]/5 to-transparent rounded-3xl blur-2xl" />
      
      <div className="relative bg-[#0d1220] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-[#0a0e17]/80">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md bg-white/[0.04] text-[10px] text-gray-500 font-mono">flipdash.app/dashboard</div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-4 space-y-3">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Vehicles", value: "12", color: "text-white" },
              { label: "Invested", value: "$47.2K", color: "text-red-400" },
              { label: "Revenue", value: "$68.9K", color: "text-[#3dd45c]" },
              { label: "Net Profit", value: "$21.7K", color: "text-[#3dd45c]" },
            ].map((s) => (
              <div key={s.label} className="bg-[#131a2b] border border-white/[0.04] rounded-lg p-2.5">
                <p className="text-[8px] text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className={`text-sm font-bold ${s.color} mt-0.5`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="bg-[#131a2b] border border-white/[0.04] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Profit Trend</p>
              <span className="text-[9px] text-[#3dd45c] font-semibold">+34% this month</span>
            </div>
            {/* Mini chart bars */}
            <div className="flex items-end gap-1 h-16">
              {[35, 42, 28, 55, 48, 62, 45, 70, 58, 75, 68, 82].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${h}%`,
                    background: i >= 10 ? "linear-gradient(to top, #3dd45c, #00c9a7)" : "rgba(61,212,92,0.2)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Inventory rows */}
          <div className="bg-[#131a2b] border border-white/[0.04] rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-white/[0.04] flex items-center justify-between">
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Active Inventory</p>
              <span className="px-1.5 py-0.5 rounded-full bg-[#3dd45c]/15 text-[#3dd45c] text-[8px] font-bold">5 Active</span>
            </div>
            {[
              { name: "2021 BMW M3", profit: "+$4,200", score: "9.1", color: "text-[#3dd45c]" },
              { name: "2019 Audi RS5", profit: "+$2,800", score: "8.4", color: "text-[#3dd45c]" },
              { name: "2020 Mercedes C63", profit: "+$1,950", score: "7.6", color: "text-amber-400" },
            ].map((v) => (
              <div key={v.name} className="px-3 py-2 flex items-center justify-between border-b border-white/[0.02] last:border-0">
                <div>
                  <p className="text-[10px] font-medium text-white">{v.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold ${v.color}`}>{v.profit}</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#3dd45c]/10 text-[#3dd45c] text-[9px] font-bold">{v.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InventoryPreview() {
  return (
    <div className="bg-[#0d1220] border border-white/[0.08] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <p className="text-xs font-semibold text-white">Inventory Tracker</p>
        <span className="text-[10px] text-gray-500">6 vehicles</span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {[
          { name: "2022 Porsche Macan", status: "Active", days: "12d", cost: "$38,500", value: "$44,200" },
          { name: "2021 Tesla Model 3", status: "Prospect", days: "3d", cost: "$28,000", value: "$33,100" },
          { name: "2020 Lexus IS 350", status: "Sold", days: "21d", cost: "$24,800", value: "$29,500" },
        ].map((v) => (
          <div key={v.name} className="px-4 py-2.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-white">{v.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                  v.status === "Active" ? "bg-[#3dd45c]/15 text-[#3dd45c]" :
                  v.status === "Prospect" ? "bg-purple-500/15 text-purple-400" :
                  "bg-blue-500/15 text-blue-400"
                }`}>{v.status}</span>
                <span className="text-[9px] text-gray-500">{v.days} held</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Cost: {v.cost}</p>
              <p className="text-[10px] text-[#3dd45c] font-semibold">Value: {v.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsPreview() {
  return (
    <div className="bg-[#0d1220] border border-white/[0.08] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <p className="text-xs font-semibold text-white">Monthly Performance</p>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Flips", value: "8", sub: "+3 vs last mo" },
            { label: "Avg Profit", value: "$2,712", sub: "+18%" },
            { label: "ROI", value: "23.4%", sub: "Above target" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-sm font-bold text-white mt-0.5">{s.value}</p>
              <p className="text-[8px] text-[#3dd45c]">{s.sub}</p>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-0.5 h-12">
          {[40, 55, 35, 65, 50, 72, 60, 80, 68, 85, 75, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${h}%`,
                background: `linear-gradient(to top, rgba(61,212,92,${0.15 + i * 0.06}), rgba(0,201,167,${0.1 + i * 0.05}))`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
