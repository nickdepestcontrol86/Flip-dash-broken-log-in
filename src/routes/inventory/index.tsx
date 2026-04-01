import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, fmtCurrency, vehicleLabel, getVehicleCosts, getVehicleIncome, getVehicleProfit, type VehicleStatus } from "@/lib/store";
import { AddVehicleModal } from "@/components/AddVehicleModal";
import { MiniValuationRange } from "@/components/ValuationDashboard";

type Filter = "All" | VehicleStatus;

function InventoryPage() {
  const { vehicles, expenses, getLatestAppraisal } = useStore();
  const [filter, setFilter] = useState<Filter>("All");
  const [showAdd, setShowAdd] = useState(false);

  const counts = {
    All: vehicles.length,
    Prospect: vehicles.filter((v) => v.status === "Prospect").length,
    Active: vehicles.filter((v) => v.status === "Active").length,
    Sold: vehicles.filter((v) => v.status === "Sold").length,
  };

  const filtered = filter === "All" ? vehicles : vehicles.filter((v) => v.status === filter);

  const statusBadge = (s: VehicleStatus) => {
    const map = {
      Prospect: "bg-purple-500/20 text-purple-400",
      Active: "bg-emerald-500/20 text-emerald-400",
      Sold: "bg-gray-500/20 text-gray-400",
    };
    return map[s];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">🚗 Inventory</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your vehicle inventory</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity"
        >
          + Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["All", "Prospect", "Active", "Sold"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? "bg-white/[0.1] text-white"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {f} <span className="ml-1 text-xs opacity-60">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-gray-500 text-sm mb-3">No vehicles found</p>
            <button onClick={() => setShowAdd(true)} className="text-[#3dd45c] text-sm font-medium hover:underline">+ Add your first vehicle</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium">Vehicle</th>
                  <th className="text-left px-4 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium hidden sm:table-cell">Stock #</th>
                  <th className="text-left px-4 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium hidden md:table-cell">Purchase</th>
                  <th className="text-right px-4 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium hidden md:table-cell">Expenses</th>
                  <th className="text-right px-4 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium hidden lg:table-cell">Income</th>
                  <th className="text-right px-4 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium">Net Profit</th>
                  <th className="text-center px-4 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium hidden xl:table-cell">Market Range</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((v) => {
                  const costs = getVehicleCosts(expenses, v.id);
                  const income = getVehicleIncome(expenses, v.id);
                  const profit = getVehicleProfit(expenses, v.id);
                  const appraisal = getLatestAppraisal(v.id);
                  return (
                    <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-3.5">
                        <Link to="/inventory/$vehicleId" params={{ vehicleId: v.id }} className="hover:text-[#3dd45c] transition-colors">
                          <p className="font-medium">{v.year} {v.make} {v.model}</p>
                          <p className="text-[11px] text-gray-500">{v.trim}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 hidden sm:table-cell">{v.stock_number}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${statusBadge(v.status)}`}>{v.status}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-300 hidden md:table-cell">{fmtCurrency(v.purchase_price)}</td>
                      <td className="px-4 py-3.5 text-right text-red-400 hidden md:table-cell">{costs > 0 ? `(${fmtCurrency(costs)})` : "—"}</td>
                      <td className="px-4 py-3.5 text-right text-emerald-400 hidden lg:table-cell">{income > 0 ? fmtCurrency(income) : "—"}</td>
                      <td className={`px-4 py-3.5 text-right font-medium ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {profit !== 0 ? fmtCurrency(profit) : "—"}
                      </td>
                      <td className="px-4 py-3.5 hidden xl:table-cell">
                        {appraisal ? (
                          <MiniValuationRange retail={appraisal.retail} wholesale={appraisal.wholesale} />
                        ) : (
                          <Link to="/appraisals/new" className="text-[10px] text-gray-500 hover:text-[#3dd45c] transition-colors">
                            Get Appraisal →
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link to="/inventory/$vehicleId" params={{ vehicleId: v.id }} className="text-[#3dd45c] text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddVehicleModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

export const Route = createFileRoute("/inventory/")({
  component: InventoryPage,
});
