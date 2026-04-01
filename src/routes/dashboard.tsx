import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, fmtCurrency, fmtK, vehicleLabel, getVehicleCosts, getVehicleIncome, getVehicleProfit, getDaysInInventory, getDaysBgColor } from "@/lib/store";

function DashboardPage() {
  const { vehicles, expenses, appraisals } = useStore();

  const activeVehicles = vehicles.filter((v) => v.status === "Active");
  const soldVehicles = vehicles.filter((v) => v.status === "Sold");
  const prospectVehicles = vehicles.filter((v) => v.status === "Prospect");

  const totalInvested = vehicles.reduce((s, v) => s + getVehicleCosts(expenses, v.id), 0);
  const totalRevenue = vehicles.reduce((s, v) => s + getVehicleIncome(expenses, v.id), 0);
  const totalProfit = totalRevenue - totalInvested;
  const avgProfit = soldVehicles.length > 0 ? soldVehicles.reduce((s, v) => s + getVehicleProfit(expenses, v.id), 0) / soldVehicles.length : 0;
  const avgDaysHeld = soldVehicles.length > 0 ? Math.round(soldVehicles.reduce((s, v) => s + getDaysInInventory(v.date_purchased || v.created_at, v.sale_date), 0) / soldVehicles.length) : 0;

  // Recent vehicles (last 5 added)
  const recentVehicles = [...vehicles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  // Top performers (sold vehicles by profit)
  const topPerformers = [...soldVehicles]
    .map((v) => ({ ...v, profit: getVehicleProfit(expenses, v.id) }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  // Vehicles needing attention (active, held > 60 days)
  const needsAttention = activeVehicles
    .map((v) => ({ ...v, days: getDaysInInventory(v.date_purchased || v.created_at) }))
    .filter((v) => v.days > 60)
    .sort((a, b) => b.days - a.days);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">📊 Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Overview of your flipping business</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/inventory"
            className="px-4 py-2 rounded-lg text-sm font-medium border border-white/[0.08] text-gray-300 hover:bg-white/[0.04] transition-all"
          >
            View Inventory
          </Link>
          <Link
            to="/appraisals/new"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity"
          >
            + New Appraisal
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Vehicles</p>
          <p className="text-2xl font-bold text-white">{vehicles.length}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">{activeVehicles.length} Active</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">{prospectVehicles.length} Prospect</span>
          </div>
        </div>
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Invested</p>
          <p className="text-2xl font-bold text-red-400">{fmtK(totalInvested)}</p>
          <p className="text-[10px] text-gray-500 mt-2">Across {vehicles.length} vehicles</p>
        </div>
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-[#3dd45c]">{fmtK(totalRevenue)}</p>
          <p className="text-[10px] text-gray-500 mt-2">{soldVehicles.length} vehicles sold</p>
        </div>
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Net Profit</p>
          <p className={`text-2xl font-bold ${totalProfit >= 0 ? "text-[#3dd45c]" : "text-red-400"}`}>{fmtK(totalProfit)}</p>
          <p className="text-[10px] text-gray-500 mt-2">
            {totalInvested > 0 ? `${((totalProfit / totalInvested) * 100).toFixed(1)}% ROI` : "No data yet"}
          </p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Avg Profit / Flip</p>
          <p className={`text-xl font-bold ${avgProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {soldVehicles.length > 0 ? fmtCurrency(avgProfit) : "—"}
          </p>
        </div>
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Avg Days to Sell</p>
          <p className="text-xl font-bold text-white">
            {soldVehicles.length > 0 ? `${avgDaysHeld}d` : "—"}
          </p>
        </div>
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4 col-span-2 lg:col-span-1">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Appraisals Done</p>
          <p className="text-xl font-bold text-white">{appraisals.length}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Vehicles */}
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-semibold">🚗 Recent Vehicles</h3>
            <Link to="/inventory" className="text-[11px] text-[#3dd45c] font-medium hover:underline">View All →</Link>
          </div>
          {recentVehicles.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-gray-500 text-sm">No vehicles yet</p>
              <Link to="/inventory" className="text-[#3dd45c] text-sm font-medium hover:underline mt-1 inline-block">Add your first vehicle →</Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recentVehicles.map((v) => {
                const profit = getVehicleProfit(expenses, v.id);
                const days = getDaysInInventory(v.date_purchased || v.created_at, v.status === "Sold" ? v.sale_date : undefined);
                const statusColors: Record<string, string> = {
                  Prospect: "bg-purple-500/20 text-purple-400",
                  Active: "bg-emerald-500/20 text-emerald-400",
                  Sold: "bg-gray-500/20 text-gray-400",
                };
                return (
                  <Link key={v.id} to="/inventory/$vehicleId" params={{ vehicleId: v.id }} className="block px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{vehicleLabel(v)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusColors[v.status]}`}>{v.status}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getDaysBgColor(days)}`}>{days}d</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{fmtCurrency(v.purchase_price)}</p>
                        {profit !== 0 && (
                          <p className={`text-xs font-medium ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {profit >= 0 ? "+" : ""}{fmtCurrency(profit)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Performers */}
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-semibold">🏆 Top Performers</h3>
            <Link to="/reports" className="text-[11px] text-[#3dd45c] font-medium hover:underline">Full Reports →</Link>
          </div>
          {topPerformers.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-gray-500 text-sm">No sold vehicles yet</p>
              <p className="text-gray-600 text-xs mt-1">Sell a vehicle to see your top performers</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {topPerformers.map((v, i) => (
                <Link key={v.id} to="/inventory/$vehicleId" params={{ vehicleId: v.id }} className="block px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}</span>
                      <div>
                        <p className="text-sm font-medium">{vehicleLabel(v)}</p>
                        <p className="text-[10px] text-gray-500">Sold for {fmtCurrency(v.sale_price)}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-bold ${v.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {v.profit >= 0 ? "+" : ""}{fmtCurrency(v.profit)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <div className="bg-[#131a2b] border border-yellow-500/20 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
            <span className="text-sm">⚠️</span>
            <h3 className="text-sm font-semibold text-yellow-400">Needs Attention</h3>
            <span className="text-[10px] text-gray-500 ml-auto">{needsAttention.length} vehicle{needsAttention.length > 1 ? "s" : ""} held 60+ days</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {needsAttention.map((v) => (
              <Link key={v.id} to="/inventory/$vehicleId" params={{ vehicleId: v.id }} className="block px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{vehicleLabel(v)}</p>
                    <p className="text-[10px] text-gray-500">Purchased for {fmtCurrency(v.purchase_price)}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${getDaysBgColor(v.days)}`}>{v.days} days</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: "/inventory", icon: "🚗", label: "Inventory", desc: `${vehicles.length} vehicles` },
          { to: "/appraisals", icon: "🔥", label: "Appraisals", desc: `${appraisals.length} completed` },
          { to: "/marketplace", icon: "🏪", label: "Marketplace", desc: "Find deals" },
          { to: "/reports", icon: "📈", label: "Reports", desc: "Full analytics" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] hover:bg-white/[0.02] transition-all group"
          >
            <span className="text-2xl">{item.icon}</span>
            <p className="text-sm font-semibold mt-2 group-hover:text-[#3dd45c] transition-colors">{item.label}</p>
            <p className="text-[10px] text-gray-500">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});
