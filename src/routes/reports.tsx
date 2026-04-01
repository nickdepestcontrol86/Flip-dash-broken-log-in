import { createFileRoute } from "@tanstack/react-router";
import { useStore, fmtCurrency, vehicleLabel, getVehicleCosts, getVehicleIncome, getVehicleProfit, getDaysInInventory } from "@/lib/store";

function ReportsPage() {
  const { vehicles, expenses } = useStore();

  const totalInvested = expenses.filter((e) => !e.is_income).reduce((s, e) => s + e.amount, 0);
  const totalIncome = expenses.filter((e) => e.is_income).reduce((s, e) => s + e.amount, 0);
  const netProfit = totalIncome - totalInvested;
  const soldCount = vehicles.filter((v) => v.status === "Sold").length;

  const vehicleAnalysis = vehicles.map((v) => {
    const costs = getVehicleCosts(expenses, v.id);
    const income = getVehicleIncome(expenses, v.id);
    const profit = getVehicleProfit(expenses, v.id);
    const days = getDaysInInventory(v.created_at, v.sale_date || undefined);
    const expenseBreakdown = expenses
      .filter((e) => e.vehicle_id === v.id && !e.is_income)
      .reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + e.amount; return acc; }, {} as Record<string, number>);
    return { vehicle: v, costs, income, profit, days, expenseBreakdown };
  }).sort((a, b) => b.profit - a.profit);

  // Averages
  const vCount = vehicles.length || 1;
  const avgPurchasePrice = vehicles.reduce((s, v) => s + v.purchase_price, 0) / vCount;
  const avgMiles = vehicles.reduce((s, v) => s + v.miles, 0) / vCount;
  const avgCostPerVehicle = totalInvested / vCount;
  const avgProfitPerVehicle = vehicleAnalysis.reduce((s, v) => s + v.profit, 0) / vCount;
  const avgDaysInInventory = vehicleAnalysis.reduce((s, v) => s + v.days, 0) / vCount;
  const soldVehicles = vehicleAnalysis.filter((v) => v.vehicle.status === "Sold");
  const avgDaysToSell = soldVehicles.length > 0 ? soldVehicles.reduce((s, v) => s + v.days, 0) / soldVehicles.length : 0;
  const avgSalePrice = soldVehicles.length > 0 ? soldVehicles.reduce((s, v) => s + v.income, 0) / soldVehicles.length : 0;
  const avgProfitPerSold = soldVehicles.length > 0 ? soldVehicles.reduce((s, v) => s + v.profit, 0) / soldVehicles.length : 0;

  const stats = [
    { label: "Total Vehicles", value: String(vehicles.length), color: "text-white" },
    { label: "Total Invested", value: fmtCurrency(totalInvested), color: "text-red-400" },
    { label: "Total Income", value: fmtCurrency(totalIncome), color: "text-emerald-400" },
    { label: "Vehicles Sold", value: String(soldCount), color: "text-blue-400" },
  ];

  const averages = [
    { label: "Avg Purchase Price", value: fmtCurrency(avgPurchasePrice), color: "text-white" },
    { label: "Avg Miles", value: Math.round(avgMiles).toLocaleString(), color: "text-white" },
    { label: "Avg Cost / Vehicle", value: fmtCurrency(avgCostPerVehicle), color: "text-red-400" },
    { label: "Avg Profit / Vehicle", value: fmtCurrency(avgProfitPerVehicle), color: avgProfitPerVehicle >= 0 ? "text-emerald-400" : "text-red-400" },
    { label: "Avg Days in Inventory", value: String(Math.round(avgDaysInInventory)), color: avgDaysInInventory > 45 ? "text-yellow-400" : "text-blue-400" },
    { label: "Avg Days to Sell", value: soldVehicles.length > 0 ? String(Math.round(avgDaysToSell)) : "N/A", color: "text-blue-400" },
    { label: "Avg Sale Price", value: soldVehicles.length > 0 ? fmtCurrency(avgSalePrice) : "N/A", color: "text-emerald-400" },
    { label: "Avg Profit / Sold", value: soldVehicles.length > 0 ? fmtCurrency(avgProfitPerSold) : "N/A", color: avgProfitPerSold >= 0 ? "text-emerald-400" : "text-red-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">📈 Reports & Analytics</h1>
        <p className="text-sm text-gray-400 mt-0.5">Performance tracking and profit analysis</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Averages Section */}
      <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold">📊 Averages Overview</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Key performance averages across your inventory</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.04]">
          {averages.map((a) => (
            <div key={a.label} className="px-5 py-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{a.label}</p>
              <p className={`text-lg font-bold ${a.color}`}>{a.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Analysis */}
      <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Vehicle Expense Analysis</h3>
          <div className="text-right">
            <p className={`text-xl font-bold ${netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtCurrency(netProfit)}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Profit</p>
          </div>
        </div>

        {vehicleAnalysis.length === 0 ? (
          <div className="px-6 py-16 text-center"><p className="text-gray-500 text-sm">Add vehicles and expenses to see your analysis</p></div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {vehicleAnalysis.map(({ vehicle, costs, income, profit, days, expenseBreakdown }) => (
              <div key={vehicle.id} className="px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                      vehicle.status === "Prospect" ? "bg-purple-500/20 text-purple-400" :
                      vehicle.status === "Active" ? "bg-emerald-500/20 text-emerald-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>{vehicle.status}</span>
                    <p className="text-sm font-medium">{vehicleLabel(vehicle)}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${days > 60 ? "bg-red-500/15 text-red-400" : days > 30 ? "bg-yellow-500/15 text-yellow-400" : "bg-blue-500/15 text-blue-400"}`}>
                      {days}d
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                      vehicle.title_type === "Clean" ? "bg-emerald-500/15 text-emerald-400" : "bg-orange-500/15 text-orange-400"
                    }`}>{vehicle.title_type}</span>
                  </div>
                  <p className={`text-sm font-bold ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>{profit >= 0 ? "+" : ""}{fmtCurrency(profit)}</p>
                </div>
                <div className="flex gap-3 text-[11px] mb-2">
                  <span className="text-red-400">Costs: {fmtCurrency(costs)}</span>
                  <span className="text-emerald-400">Income: {fmtCurrency(income)}</span>
                  <span className="text-gray-500">Paid: {vehicle.payment_method}</span>
                </div>
                {costs > 0 && (
                  <div className="flex h-2 rounded-full overflow-hidden bg-white/[0.04]">
                    {Object.entries(expenseBreakdown).map(([cat, amt]) => {
                      const pct = (amt / costs) * 100;
                      const colors: Record<string, string> = {
                        "Vehicle Purchase": "bg-blue-500", "Repair": "bg-orange-500", "Parts": "bg-yellow-500",
                        "Cleaning/Detail": "bg-cyan-500", "License/Title": "bg-purple-500", "Fuel": "bg-red-500",
                        "Advertising": "bg-pink-500", "Commission": "bg-indigo-500", "Insurance": "bg-teal-500", "Lien Payment": "bg-amber-500",
                      };
                      return <div key={cat} className={`${colors[cat] || "bg-gray-500"} transition-all`} style={{ width: `${pct}%` }} title={`${cat}: ${fmtCurrency(amt)}`} />;
                    })}
                  </div>
                )}
                {Object.keys(expenseBreakdown).length > 0 && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    {Object.entries(expenseBreakdown).map(([cat, amt]) => <span key={cat} className="text-[10px] text-gray-500">{cat}: {fmtCurrency(amt)}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});
