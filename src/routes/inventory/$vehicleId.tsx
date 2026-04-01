import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  useStore,
  fmtCurrency,
  fmtDate,
  vehicleLabel,
  getVehicleCosts,
  getVehicleIncome,
  getVehicleProfit,
  getDaysInInventory,
  getDaysColor,
  DAMAGE_TYPES,
  DRIVABILITY_OPTIONS,
  type Vehicle,
  type DamageType,
  type Drivability,
  type VehicleStatus,
  type MechCondition,
  type PaymentMethod,
  type TitleType,
} from "@/lib/store";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { SafetySpecsTab } from "@/components/SafetySpecsTab";
import { CompactValuationCards } from "@/components/ValuationDashboard";
import { estimateMarketValues, getValuation } from "@/lib/valuation";

type Tab = "details" | "investment" | "expenses" | "appraisals" | "seller" | "buyer" | "notes" | "safety";

function VehicleDetailPage() {
  const { vehicleId } = Route.useParams();
  const navigate = useNavigate();
  const { vehicles, expenses, appraisals, updateVehicle, deleteVehicle, deleteExpense, addAppraisal, getLatestAppraisal, toast } = useStore();
  const [tab, setTab] = useState<Tab>("details");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expandedAppraisal, setExpandedAppraisal] = useState<string | null>(null);
  const [appraising, setAppraising] = useState(false);

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  if (!vehicle) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg mb-4">Vehicle not found</p>
        <Link to="/inventory" className="text-[#3dd45c] font-medium hover:underline">← Back to Inventory</Link>
      </div>
    );
  }

  const vExpenses = expenses
    .filter((e) => e.vehicle_id === vehicleId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const vAppraisals = appraisals.filter((a) => a.vehicle_id === vehicleId);
  const latestAppraisal = getLatestAppraisal(vehicleId);
  const costs = getVehicleCosts(expenses, vehicleId);
  const income = getVehicleIncome(expenses, vehicleId);

  // Calculate total investment: purchase price + all expense costs (non-income)
  const totalInvestment = vehicle.purchase_price + costs;

  // Calculate profit: include sale_price from buyer tab + any income expenses - total investment
  const saleRevenue = vehicle.sale_price || 0;
  const totalRevenue = saleRevenue + income;
  const profit = totalRevenue - totalInvestment;

  const daysStartDate = vehicle.date_purchased || vehicle.created_at;
  const daysInInventory = getDaysInInventory(daysStartDate, vehicle.sale_date || undefined);

  const statusBadge = (s: VehicleStatus) => {
    const map = { Prospect: "bg-purple-500/20 text-purple-400", Active: "bg-emerald-500/20 text-emerald-400", Sold: "bg-gray-500/20 text-gray-400" };
    return map[s];
  };

  const handleDelete = () => {
    if (confirm("Delete this vehicle and all associated data?")) {
      deleteVehicle(vehicleId);
      toast("Vehicle deleted");
      navigate({ to: "/inventory" });
    }
  };

  const handleSave = (data: Partial<Vehicle>, label: string) => {
    updateVehicle(vehicleId, data);
    toast(`${label} saved successfully!`);
  };

  const handleQuickAppraise = async () => {
    setAppraising(true);
    try {
      const result = await getValuation({
        vin: vehicle.vin || undefined,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        miles: vehicle.miles,
        mechanicalCondition: vehicle.mechanical_condition,
        appearance: vehicle.appearance,
      });
      addAppraisal({
        vehicle_id: vehicleId,
        year: vehicle.year, make: vehicle.make, model: vehicle.model, trim: vehicle.trim,
        miles: vehicle.miles, mechanical_condition: vehicle.mechanical_condition, appearance: vehicle.appearance,
        retail: result.retail, trade_in: result.tradeIn, private_party: result.privateParty,
        auction: result.auction, wholesale: result.wholesale, source: result.source,
      });
      toast("Appraisal completed!");
      setTab("appraisals");
    } catch {
      const values = estimateMarketValues(vehicle.year, vehicle.make, vehicle.model, vehicle.miles, vehicle.mechanical_condition, vehicle.appearance);
      addAppraisal({
        vehicle_id: vehicleId,
        year: vehicle.year, make: vehicle.make, model: vehicle.model, trim: vehicle.trim,
        miles: vehicle.miles, mechanical_condition: vehicle.mechanical_condition, appearance: vehicle.appearance,
        retail: values.retail, trade_in: values.trade_in, private_party: values.private_party,
        auction: values.auction, wholesale: values.wholesale, source: "local",
      });
      toast("Appraisal completed (estimated)!");
      setTab("appraisals");
    } finally {
      setAppraising(false);
    }
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "details", label: "Details" },
    { key: "investment", label: "💰 Investment" },
    { key: "expenses", label: "Expenses", count: vExpenses.length },
    { key: "appraisals", label: "Appraisals", count: vAppraisals.length },
    { key: "seller", label: "Seller" },
    { key: "buyer", label: "Buyer" },
    { key: "notes", label: "Notes" },
    { key: "safety", label: "🔍 Vehicle Insights" },
  ];

  return (
    <div className="space-y-6">
      <Link to="/inventory" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">← Back to Inventory</Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-lg">🚗</div>
          <div>
            <h1 className="text-xl font-bold">{vehicleLabel(vehicle)}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${statusBadge(vehicle.status)}`}>{vehicle.status}</span>
              <span className="text-xs text-gray-500">{vehicle.stock_number}</span>
              {vehicle.vin && <span className="text-xs text-gray-600 font-mono hidden sm:inline">{vehicle.vin}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleQuickAppraise} disabled={appraising} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-opacity disabled:opacity-40">
            {appraising ? <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Appraising...</span> : "🔥 Quick Appraise"}
          </button>
          <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all">🗑️ Delete</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Total Invested</p>
          <p className="text-xl font-bold text-orange-400">{totalInvestment > 0 ? fmtCurrency(totalInvestment) : "$0"}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Purchase + Expenses</p>
        </div>
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Sale Price</p>
          <p className="text-xl font-bold text-blue-400">{saleRevenue > 0 ? fmtCurrency(saleRevenue) : "$0"}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">From Buyer tab</p>
        </div>
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Other Income</p>
          <p className="text-xl font-bold text-emerald-400">{income > 0 ? `+${fmtCurrency(income)}` : "$0"}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Income expenses</p>
        </div>
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Net Profit/Loss</p>
          <p className={`text-xl font-bold ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {profit >= 0 ? "+" : ""}{fmtCurrency(profit)}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">Revenue - Investment</p>
        </div>
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
            {vehicle.status === "Sold" ? "Days to Sell" : "Days in Inventory"}
          </p>
          <div className="flex items-baseline gap-1.5">
            <p className={`text-xl font-bold ${getDaysColor(daysInInventory)}`}>
              {daysInInventory}
            </p>
            <span className="text-[11px] text-gray-500">days</span>
          </div>
        </div>
      </div>

      {/* Purchase Info Banner */}
      <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500 uppercase">Title:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
            vehicle.title_type === "Clean" ? "bg-emerald-500/20 text-emerald-400" :
            vehicle.title_type === "Salvage" ? "bg-orange-500/20 text-orange-400" :
            "bg-red-500/20 text-red-400"
          }`}>{vehicle.title_type}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500 uppercase">Payment:</span>
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/20 text-blue-400">{vehicle.payment_method}</span>
        </div>
        {vehicle.purchase_location && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 uppercase">Purchased at:</span>
            <span className="text-[11px] text-gray-300">{vehicle.purchase_location}</span>
          </div>
        )}
      </div>

      {/* Latest Appraisal */}
      {latestAppraisal && (
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">💰 Latest Market Values</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${latestAppraisal.source === "carsxe" ? "bg-blue-500/15 text-blue-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                {latestAppraisal.source === "carsxe" ? "Live" : "Estimated"}
              </span>
            </div>
            <span className="text-[10px] text-gray-500">{fmtDate(latestAppraisal.created_at)}</span>
          </div>
          <CompactValuationCards retail={latestAppraisal.retail} tradeIn={latestAppraisal.trade_in} privateParty={latestAppraisal.private_party} auction={latestAppraisal.auction} wholesale={latestAppraisal.wholesale} purchasePrice={vehicle.purchase_price} />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-white/[0.06] flex gap-1 overflow-x-auto pb-px">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${tab === t.key ? "border-[#3dd45c] text-white" : "border-transparent text-gray-400 hover:text-white"}`}>
            {t.label}
            {t.count !== undefined && t.count > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.08]">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5 sm:p-6">
        {tab === "details" && <DetailsTab vehicle={vehicle} onUpdate={(d) => handleSave(d, "Vehicle details")} />}
        {tab === "investment" && <InvestmentTab vehicle={vehicle} expenses={vExpenses} costs={costs} income={income} saleRevenue={saleRevenue} totalInvestment={totalInvestment} profit={profit} latestAppraisal={latestAppraisal} />}
        {tab === "expenses" && <ExpensesTab expenses={vExpenses} onAdd={() => setShowExpenseModal(true)} onDelete={deleteExpense} />}
        {tab === "appraisals" && <AppraisalsTab appraisals={vAppraisals} expanded={expandedAppraisal} onToggle={setExpandedAppraisal} vehicleId={vehicleId} purchasePrice={vehicle.purchase_price} onQuickAppraise={handleQuickAppraise} appraising={appraising} />}
        {tab === "seller" && <SellerTab vehicle={vehicle} onUpdate={(d) => handleSave(d, "Seller info")} />}
        {tab === "buyer" && <BuyerTab vehicle={vehicle} onUpdate={(d) => handleSave(d, "Buyer info")} />}
        {tab === "notes" && <NotesTab vehicle={vehicle} onUpdate={(d) => handleSave(d, "Notes")} />}
        {tab === "safety" && <SafetySpecsTab vehicle={vehicle} />}
      </div>

      <AddExpenseModal open={showExpenseModal} onClose={() => setShowExpenseModal(false)} vehicleId={vehicleId} />
    </div>
  );
}

const inputCls = "w-full bg-[#0a0e17] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3dd45c]/50";

function DetailsTab({ vehicle, onUpdate }: { vehicle: Vehicle; onUpdate: (d: Partial<Vehicle>) => void }) {
  const [form, setForm] = useState({ ...vehicle });
  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));
  const conditions: MechCondition[] = ["Excellent", "Good", "Fair", "Poor"];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Inventory Tracking</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Stock Number</label>
            <input value={form.stock_number} onChange={(e) => set("stock_number", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
              <option value="Prospect">Prospect</option>
              <option value="Active">Active</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Purchase Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Purchase Location</label>
            <input value={form.purchase_location} onChange={(e) => set("purchase_location", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Payment Method</label>
            <select value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)} className={inputCls}>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Credit-line">Credit-line</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Title Type</label>
            <select value={form.title_type} onChange={(e) => set("title_type", e.target.value)} className={inputCls}>
              <option value="Clean">Clean</option>
              <option value="Salvage">Salvage</option>
              <option value="Certificate of Destruction">Certificate of Destruction</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Purchase Date</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Date Purchased</label>
            <input type="date" value={form.date_purchased} onChange={(e) => set("date_purchased", e.target.value)} className={inputCls} />
            <p className="text-[10px] text-gray-500 mt-1">Used to calculate Days in Inventory</p>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Vehicle Description</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-xs text-gray-400 mb-1.5">Year</label><input value={form.year} onChange={(e) => set("year", e.target.value)} className={inputCls} /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">Make</label><input value={form.make} onChange={(e) => set("make", e.target.value)} className={inputCls} /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">Model</label><input value={form.model} onChange={(e) => set("model", e.target.value)} className={inputCls} /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">Trim</label><input value={form.trim} onChange={(e) => set("trim", e.target.value)} className={inputCls} /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">VIN</label><input value={form.vin} onChange={(e) => set("vin", e.target.value)} maxLength={17} className={inputCls} /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">Miles</label><input type="number" value={form.miles} onChange={(e) => set("miles", Number(e.target.value))} className={inputCls} /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">Purchase Price</label><input type="number" value={form.purchase_price} onChange={(e) => set("purchase_price", Number(e.target.value))} className={inputCls} /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">Mechanical Condition</label><select value={form.mechanical_condition} onChange={(e) => set("mechanical_condition", e.target.value)} className={inputCls}>{conditions.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">Appearance</label><select value={form.appearance} onChange={(e) => set("appearance", e.target.value)} className={inputCls}>{conditions.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">Exterior Color</label><input value={form.exterior_color} onChange={(e) => set("exterior_color", e.target.value)} className={inputCls} /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">Interior Color</label><input value={form.interior_color} onChange={(e) => set("interior_color", e.target.value)} className={inputCls} /></div>
        </div>
      </div>
      <div>
        <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Condition & Damage</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Primary Damage</label>
            <select value={form.primary_damage} onChange={(e) => set("primary_damage", e.target.value)} className={inputCls}>
              {DAMAGE_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Secondary Damage</label>
            <select value={form.secondary_damage} onChange={(e) => set("secondary_damage", e.target.value)} className={inputCls}>
              {DAMAGE_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Drivability</label>
            <select value={form.drivability} onChange={(e) => set("drivability", e.target.value)} className={inputCls}>
              {DRIVABILITY_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>
      <button onClick={() => onUpdate(form)} className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity">Save Changes</button>
    </div>
  );
}

/* ─── Investment Tab ─── */
function InvestmentTab({ vehicle, expenses: vExpenses, costs, income, saleRevenue, totalInvestment, profit, latestAppraisal }: {
  vehicle: Vehicle;
  expenses: import("@/lib/store").Expense[];
  costs: number;
  income: number;
  saleRevenue: number;
  totalInvestment: number;
  profit: number;
  latestAppraisal: import("@/lib/store").Appraisal | null;
}) {
  const costExpenses = vExpenses.filter((e) => !e.is_income);
  const incomeExpenses = vExpenses.filter((e) => e.is_income);

  // Potential profit based on appraisal
  const potentialRetailProfit = latestAppraisal ? latestAppraisal.retail - totalInvestment : null;
  const potentialWholesaleProfit = latestAppraisal ? latestAppraisal.wholesale - totalInvestment : null;

  const roi = totalInvestment > 0 && profit !== 0 ? ((profit / totalInvestment) * 100) : 0;

  return (
    <div className="space-y-6">
      <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
        💰 Investment Breakdown
        <span className="text-[10px] text-gray-500 font-normal">How much you have into this vehicle</span>
      </h4>

      {/* Big P&L Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0a0e17] border border-white/[0.06] rounded-xl p-5 text-center">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">Total Invested</p>
          <p className="text-2xl font-bold text-orange-400">{fmtCurrency(totalInvestment)}</p>
          <div className="mt-2 space-y-1">
            <p className="text-[11px] text-gray-500">Purchase: {fmtCurrency(vehicle.purchase_price)}</p>
            {costs > 0 && <p className="text-[11px] text-gray-500">+ Expenses: {fmtCurrency(costs)}</p>}
          </div>
        </div>
        <div className="bg-[#0a0e17] border border-white/[0.06] rounded-xl p-5 text-center">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-400">{fmtCurrency(saleRevenue + income)}</p>
          <div className="mt-2 space-y-1">
            {saleRevenue > 0 && <p className="text-[11px] text-gray-500">Sale Price: {fmtCurrency(saleRevenue)}</p>}
            {income > 0 && <p className="text-[11px] text-gray-500">Other Income: {fmtCurrency(income)}</p>}
            {saleRevenue === 0 && income === 0 && <p className="text-[11px] text-gray-500">No revenue yet</p>}
          </div>
        </div>
        <div className={`bg-[#0a0e17] border rounded-xl p-5 text-center ${profit >= 0 ? "border-emerald-500/20" : "border-red-500/20"}`}>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">
            {profit >= 0 ? "Net Profit" : "Net Loss"}
          </p>
          <p className={`text-2xl font-bold ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {profit >= 0 ? "+" : ""}{fmtCurrency(profit)}
          </p>
          {totalInvestment > 0 && (
            <p className={`text-[11px] mt-2 ${roi >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {roi >= 0 ? "+" : ""}{roi.toFixed(1)}% ROI
            </p>
          )}
        </div>
      </div>

      {/* Potential Profit from Appraisal */}
      {latestAppraisal && vehicle.status !== "Sold" && (
        <div className="bg-[#0a0e17] border border-yellow-500/10 rounded-xl p-4">
          <h5 className="text-xs text-yellow-400 uppercase tracking-wider mb-3 font-medium">📊 Potential Profit (Based on Latest Appraisal)</h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "If Sold Retail", value: latestAppraisal.retail, profit: potentialRetailProfit! },
              { label: "If Sold Private", value: latestAppraisal.private_party, profit: latestAppraisal.private_party - totalInvestment },
              { label: "If Sold Trade-In", value: latestAppraisal.trade_in, profit: latestAppraisal.trade_in - totalInvestment },
              { label: "If Sold Wholesale", value: latestAppraisal.wholesale, profit: potentialWholesaleProfit! },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-[10px] text-gray-500 mb-1">{s.label}</p>
                <p className="text-sm font-semibold text-gray-300">{fmtCurrency(s.value)}</p>
                <p className={`text-xs font-medium ${s.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {s.profit >= 0 ? "+" : ""}{fmtCurrency(s.profit)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="bg-[#0a0e17] border border-white/[0.06] rounded-xl p-4">
        <h5 className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">📋 Cost Breakdown</h5>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <span className="text-sm text-gray-300">Vehicle Purchase</span>
            <span className="text-sm font-medium text-red-400">-{fmtCurrency(vehicle.purchase_price)}</span>
          </div>
          {costExpenses.map((e) => (
            <div key={e.id} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
              <div>
                <span className="text-sm text-gray-300">{e.type}</span>
                {e.description && <span className="text-[11px] text-gray-500 ml-2">{e.description}</span>}
              </div>
              <span className="text-sm font-medium text-red-400">-{fmtCurrency(e.amount)}</span>
            </div>
          ))}
          {costExpenses.length === 0 && (
            <p className="text-[11px] text-gray-500 py-2">No additional expenses recorded</p>
          )}
          <div className="flex items-center justify-between py-2 border-t border-white/[0.08] mt-2">
            <span className="text-sm font-semibold text-white">Total Invested</span>
            <span className="text-sm font-bold text-orange-400">{fmtCurrency(totalInvestment)}</span>
          </div>
        </div>
      </div>

      {/* Income Breakdown */}
      {(saleRevenue > 0 || incomeExpenses.length > 0) && (
        <div className="bg-[#0a0e17] border border-white/[0.06] rounded-xl p-4">
          <h5 className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">💵 Revenue Breakdown</h5>
          <div className="space-y-2">
            {saleRevenue > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <span className="text-sm text-gray-300">Sale Price</span>
                <span className="text-sm font-medium text-emerald-400">+{fmtCurrency(saleRevenue)}</span>
              </div>
            )}
            {incomeExpenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <div>
                  <span className="text-sm text-gray-300">{e.type}</span>
                  {e.description && <span className="text-[11px] text-gray-500 ml-2">{e.description}</span>}
                </div>
                <span className="text-sm font-medium text-emerald-400">+{fmtCurrency(e.amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2 border-t border-white/[0.08] mt-2">
              <span className="text-sm font-semibold text-white">Total Revenue</span>
              <span className="text-sm font-bold text-blue-400">{fmtCurrency(saleRevenue + income)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpensesTab({ expenses: exps, onAdd, onDelete }: { expenses: import("@/lib/store").Expense[]; onAdd: () => void; onDelete: (id: string) => void }) {
  let running = 0;
  const rows = [...exps].reverse().map((e) => { running += e.is_income ? e.amount : -e.amount; return { ...e, running }; }).reverse();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300">Expense & Income Entries</h4>
        <button onClick={onAdd} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity">+ Add Entry</button>
      </div>
      {rows.length === 0 ? (
        <div className="text-center py-10"><p className="text-gray-500 text-sm mb-3">No expenses or income recorded yet</p><button onClick={onAdd} className="text-[#3dd45c] text-sm font-medium hover:underline">+ Add your first entry</button></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/[0.06]">
              <th className="text-left px-3 py-2 text-[11px] text-gray-400 uppercase font-medium">Date</th>
              <th className="text-left px-3 py-2 text-[11px] text-gray-400 uppercase font-medium">Category</th>
              <th className="text-left px-3 py-2 text-[11px] text-gray-400 uppercase font-medium hidden sm:table-cell">Description</th>
              <th className="text-right px-3 py-2 text-[11px] text-gray-400 uppercase font-medium">Amount</th>
              <th className="text-center px-3 py-2 text-[11px] text-gray-400 uppercase font-medium hidden md:table-cell">Type</th>
              <th className="text-right px-3 py-2 text-[11px] text-gray-400 uppercase font-medium hidden lg:table-cell">Running</th>
              <th className="px-2 py-2"></th>
            </tr></thead>
            <tbody className="divide-y divide-white/[0.04]">
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-2.5 text-gray-300">{fmtDate(e.date)}</td>
                  <td className="px-3 py-2.5 text-gray-300">{e.type}</td>
                  <td className="px-3 py-2.5 text-gray-400 hidden sm:table-cell">{e.description}</td>
                  <td className={`px-3 py-2.5 text-right font-medium ${e.is_income ? "text-emerald-400" : "text-red-400"}`}>{e.is_income ? "+" : "-"}{fmtCurrency(e.amount)}</td>
                  <td className="px-3 py-2.5 text-center hidden md:table-cell"><span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${e.is_income ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>{e.is_income ? "Income" : "Expense"}</span></td>
                  <td className={`px-3 py-2.5 text-right hidden lg:table-cell font-medium ${e.running >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtCurrency(e.running)}</td>
                  <td className="px-2 py-2.5"><button onClick={() => onDelete(e.id)} className="text-gray-500 hover:text-red-400 transition-colors text-xs">✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AppraisalsTab({ appraisals: apps, expanded, onToggle, vehicleId, purchasePrice, onQuickAppraise, appraising }: {
  appraisals: import("@/lib/store").Appraisal[]; expanded: string | null; onToggle: (id: string | null) => void;
  vehicleId: string; purchasePrice?: number; onQuickAppraise: () => void; appraising: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300">Appraisal History</h4>
        <div className="flex items-center gap-2">
          <button onClick={onQuickAppraise} disabled={appraising} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-opacity disabled:opacity-40">{appraising ? "Appraising..." : "🔥 Quick Appraise"}</button>
          <Link to="/appraisals/new" className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity">+ Detailed Appraisal</Link>
        </div>
      </div>
      {apps.length === 0 ? (
        <div className="text-center py-10"><p className="text-gray-500 text-sm mb-3">No appraisals yet</p><button onClick={onQuickAppraise} disabled={appraising} className="text-[#3dd45c] text-sm font-medium hover:underline disabled:opacity-40">🔥 Run Quick Appraisal</button></div>
      ) : (
        <div className="space-y-3">
          {apps.map((a, i) => (
            <div key={a.id} className={`border rounded-xl overflow-hidden ${i === 0 ? "border-[#3dd45c]/20" : "border-white/[0.06]"}`}>
              <button onClick={() => onToggle(expanded === a.id ? null : a.id)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left">
                <div className="flex items-center gap-2">
                  {i === 0 && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#3dd45c]/15 text-[#3dd45c] uppercase">Latest</span>}
                  <div>
                    <p className="text-sm font-medium">{vehicleLabel(a)}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-500">{a.miles?.toLocaleString()} mi · {fmtDate(a.created_at)}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${a.source === "carsxe" ? "bg-blue-500/15 text-blue-400" : "bg-yellow-500/15 text-yellow-400"}`}>{a.source === "carsxe" ? "Live" : "Est."}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 hidden sm:block">{fmtCurrency(a.wholesale)} — {fmtCurrency(a.retail)}</span>
                  <span className="text-gray-400 text-xs">{expanded === a.id ? "▲" : "▼"}</span>
                </div>
              </button>
              {expanded === a.id && <div className="px-4 pb-4"><CompactValuationCards retail={a.retail} tradeIn={a.trade_in} privateParty={a.private_party} auction={a.auction} wholesale={a.wholesale} purchasePrice={purchasePrice} /></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SellerTab({ vehicle, onUpdate }: { vehicle: Vehicle; onUpdate: (d: Partial<Vehicle>) => void }) {
  const [form, setForm] = useState({ seller_name: vehicle.seller_name, seller_phone: vehicle.seller_phone, seller_email: vehicle.seller_email, seller_location: vehicle.seller_location, seller_description: vehicle.seller_description });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-300">Seller Information</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-xs text-gray-400 mb-1.5">Seller Name</label><input value={form.seller_name} onChange={(e) => set("seller_name", e.target.value)} className={inputCls} /></div>
        <div><label className="block text-xs text-gray-400 mb-1.5">Phone</label><input value={form.seller_phone} onChange={(e) => set("seller_phone", e.target.value)} className={inputCls} /></div>
        <div><label className="block text-xs text-gray-400 mb-1.5">Email</label><input value={form.seller_email} onChange={(e) => set("seller_email", e.target.value)} className={inputCls} /></div>
        <div><label className="block text-xs text-gray-400 mb-1.5">Location</label><input value={form.seller_location} onChange={(e) => set("seller_location", e.target.value)} className={inputCls} /></div>
      </div>
      <div><label className="block text-xs text-gray-400 mb-1.5">Original Description</label><textarea value={form.seller_description} onChange={(e) => set("seller_description", e.target.value)} rows={3} className={inputCls + " resize-none"} /></div>
      <button onClick={() => onUpdate(form)} className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity">Save Seller Info</button>
    </div>
  );
}

function BuyerTab({ vehicle, onUpdate }: { vehicle: Vehicle; onUpdate: (d: Partial<Vehicle>) => void }) {
  const [form, setForm] = useState({ buyer_name: vehicle.buyer_name, sale_price: vehicle.sale_price, sale_date: vehicle.sale_date, commission: vehicle.commission });
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-300">Buyer Information</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-xs text-gray-400 mb-1.5">Buyer Name</label><input value={form.buyer_name} onChange={(e) => setForm((p) => ({ ...p, buyer_name: e.target.value }))} className={inputCls} /></div>
        <div><label className="block text-xs text-gray-400 mb-1.5">Sale Price</label><input type="number" value={form.sale_price || ""} onChange={(e) => setForm((p) => ({ ...p, sale_price: Number(e.target.value) }))} className={inputCls} placeholder="Enter sale price to calculate profit" /></div>
        <div><label className="block text-xs text-gray-400 mb-1.5">Sale Date</label><input type="date" value={form.sale_date} onChange={(e) => setForm((p) => ({ ...p, sale_date: e.target.value }))} className={inputCls} /></div>
        <div><label className="block text-xs text-gray-400 mb-1.5">Commission</label><input type="number" value={form.commission || ""} onChange={(e) => setForm((p) => ({ ...p, commission: Number(e.target.value) }))} className={inputCls} /></div>
      </div>
      <p className="text-[11px] text-gray-500">💡 Entering a sale price will automatically update the profit/loss calculation in the summary cards and Investment tab.</p>
      <button onClick={() => onUpdate(form)} className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity">Save Buyer Info</button>
    </div>
  );
}

function NotesTab({ vehicle, onUpdate }: { vehicle: Vehicle; onUpdate: (d: Partial<Vehicle>) => void }) {
  const [notes, setNotes] = useState(vehicle.notes);
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-300">Vehicle Notes</h4>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={8} placeholder="Add notes about this vehicle..." className={inputCls + " resize-none"} />
      <button onClick={() => onUpdate({ notes })} className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity">Save Notes</button>
    </div>
  );
}

export const Route = createFileRoute("/inventory/$vehicleId")({
  component: VehicleDetailPage,
});
