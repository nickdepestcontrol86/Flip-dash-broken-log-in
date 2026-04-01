import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useStore, fmtCurrency, vehicleLabel, type MechCondition, type Appraisal } from "@/lib/store";
import { decodeVin, isValidVinFormat, formatVin, estimateMarketValues, getValuation, hasCarsXEApiKey, type VinDecodeResult, type ValuationResult } from "@/lib/valuation";

const YEARS = Array.from({ length: 30 }, (_, i) => String(2025 - i));
const MAKES = ["Acura","Audi","BMW","Buick","Cadillac","Chevrolet","Chrysler","Dodge","Ford","Genesis","GMC","Honda","Hyundai","Infiniti","Jaguar","Jeep","Kia","Land Rover","Lexus","Lincoln","Mazda","Mercedes-Benz","Mini","Mitsubishi","Nissan","Porsche","Ram","Subaru","Tesla","Toyota","Volkswagen","Volvo"];
const CONDITIONS: MechCondition[] = ["Excellent", "Good", "Fair", "Poor"];

type InputMode = "manual" | "vin";

interface FormState {
  vehicle_id: string;
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  miles: string;
  mechanical_condition: MechCondition;
  appearance: MechCondition;
}

const INITIAL_FORM: FormState = {
  vehicle_id: "",
  vin: "",
  year: "2022",
  make: "",
  model: "",
  trim: "",
  miles: "",
  mechanical_condition: "Good",
  appearance: "Good",
};

interface FieldError {
  vin?: string;
  make?: string;
  model?: string;
  miles?: string;
}

function ConditionPicker({ label, value, onChange }: { label: string; value: MechCondition; onChange: (v: MechCondition) => void }) {
  const conditionInfo: Record<MechCondition, { emoji: string; color: string; activeBg: string; desc: string }> = {
    Excellent: { emoji: "✨", color: "text-emerald-400", activeBg: "bg-emerald-500/20 border-emerald-500/40", desc: "Like new" },
    Good: { emoji: "👍", color: "text-blue-400", activeBg: "bg-blue-500/20 border-blue-500/40", desc: "Minor wear" },
    Fair: { emoji: "⚠️", color: "text-yellow-400", activeBg: "bg-yellow-500/20 border-yellow-500/40", desc: "Visible wear" },
    Poor: { emoji: "🔧", color: "text-red-400", activeBg: "bg-red-500/20 border-red-500/40", desc: "Needs work" },
  };

  return (
    <div>
      <label className="block text-xs text-gray-400 mb-2">{label}</label>
      <div className="grid grid-cols-4 gap-2">
        {CONDITIONS.map((c) => {
          const info = conditionInfo[c];
          const isActive = value === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg border text-center transition-all ${
                isActive
                  ? `${info.activeBg} ${info.color}`
                  : "border-white/[0.06] text-gray-500 hover:border-white/[0.12] hover:text-gray-300"
              }`}
            >
              <span className="text-lg">{info.emoji}</span>
              <span className="text-[11px] font-medium">{c}</span>
              <span className="text-[9px] opacity-70">{info.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VinInput({ value, onChange, onDecode, isDecoding, error }: {
  value: string;
  onChange: (v: string) => void;
  onDecode: () => void;
  isDecoding: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">VIN (Vehicle Identification Number)</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={value}
            onChange={(e) => onChange(formatVin(e.target.value))}
            placeholder="Enter 17-character VIN"
            maxLength={17}
            className={`w-full bg-[#0a0e17] border rounded-lg px-3 py-2.5 text-sm text-white font-mono tracking-wider placeholder:text-gray-600 focus:outline-none transition-colors ${
              error ? "border-red-500/50 focus:border-red-500" : "border-white/[0.08] focus:border-[#3dd45c]/50"
            }`}
          />
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium ${
            value.length === 17 ? "text-emerald-400" : "text-gray-600"
          }`}>
            {value.length}/17
          </span>
        </div>
        <button
          type="button"
          onClick={onDecode}
          disabled={value.length !== 17 || isDecoding}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isDecoding ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Decoding...
            </span>
          ) : (
            "🔍 Decode"
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
}

function NewAppraisalPage() {
  const { vehicles, addAppraisal } = useStore();
  const [mode, setMode] = useState<InputMode>("vin");
  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM });
  const [errors, setErrors] = useState<FieldError>({});
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [vinDecoding, setVinDecoding] = useState(false);
  const [vinDecoded, setVinDecoded] = useState<VinDecodeResult | null>(null);
  const [vinSuccess, setVinSuccess] = useState(false);

  const set = useCallback((k: keyof FormState, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  }, []);

  const fillFromVehicle = (id: string) => {
    const v = vehicles.find((x) => x.id === id);
    if (!v) return;
    setForm({
      vehicle_id: id,
      vin: v.vin || "",
      year: v.year,
      make: v.make,
      model: v.model,
      trim: v.trim,
      miles: String(v.miles),
      mechanical_condition: v.mechanical_condition,
      appearance: v.appearance,
    });
    setResult(null);
    setErrors({});
    setVinDecoded(null);
    setVinSuccess(false);
  };

  const handleVinDecode = async () => {
    if (!isValidVinFormat(form.vin)) {
      setErrors((p) => ({ ...p, vin: "Invalid VIN format. Must be 17 alphanumeric characters (no I, O, or Q)." }));
      return;
    }

    setVinDecoding(true);
    setErrors((p) => ({ ...p, vin: undefined }));
    setVinSuccess(false);

    try {
      const decoded = await decodeVin(form.vin);
      setVinDecoded(decoded);

      if (decoded.success) {
        setForm((p) => ({
          ...p,
          year: decoded.year || p.year,
          make: decoded.make || p.make,
          model: decoded.model || p.model,
          trim: decoded.trim || p.trim,
        }));
        setVinSuccess(true);
        setTimeout(() => setVinSuccess(false), 3000);
      } else {
        setErrors((p) => ({ ...p, vin: decoded.errorText || "Could not decode VIN" }));
      }
    } catch {
      setErrors((p) => ({ ...p, vin: "Failed to connect to VIN decoder. Please try again." }));
    } finally {
      setVinDecoding(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: FieldError = {};
    if (!form.make) newErrors.make = "Make is required";
    if (!form.model) newErrors.model = "Model is required";
    if (form.miles && isNaN(Number(form.miles))) newErrors.miles = "Miles must be a number";
    if (mode === "vin" && form.vin && form.vin.length > 0 && form.vin.length !== 17) {
      newErrors.vin = "VIN must be exactly 17 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAppraise = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const valuation = await getValuation({
        vin: form.vin || undefined,
        year: form.year,
        make: form.make,
        model: form.model,
        miles: Number(form.miles) || 0,
        mechanicalCondition: form.mechanical_condition,
        appearance: form.appearance,
        bodyClass: vinDecoded?.bodyClass,
      });
      setResult(valuation);
      addAppraisal({
        vehicle_id: form.vehicle_id,
        year: form.year,
        make: form.make,
        model: form.model,
        trim: form.trim,
        miles: Number(form.miles) || 0,
        mechanical_condition: form.mechanical_condition,
        appearance: form.appearance,
        retail: valuation.retail,
        trade_in: valuation.tradeIn,
        private_party: valuation.privateParty,
        auction: valuation.auction,
        wholesale: valuation.wholesale,
        source: valuation.source,
      } as Omit<Appraisal, "id" | "created_at">);
    } catch {
      const values = estimateMarketValues(
        form.year, form.make, form.model,
        Number(form.miles) || 0,
        form.mechanical_condition, form.appearance,
        vinDecoded?.bodyClass,
      );
      const fallbackResult: ValuationResult = {
        source: "local",
        retail: values.retail,
        tradeIn: values.trade_in,
        privateParty: values.private_party,
        auction: values.auction,
        wholesale: values.wholesale,
      };
      setResult(fallbackResult);
      addAppraisal({
        vehicle_id: form.vehicle_id,
        year: form.year,
        make: form.make,
        model: form.model,
        trim: form.trim,
        miles: Number(form.miles) || 0,
        mechanical_condition: form.mechanical_condition,
        appearance: form.appearance,
        retail: values.retail,
        trade_in: values.trade_in,
        private_party: values.private_party,
        auction: values.auction,
        wholesale: values.wholesale,
        source: "local",
      } as Omit<Appraisal, "id" | "created_at">);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ ...INITIAL_FORM });
    setResult(null);
    setErrors({});
    setVinDecoded(null);
    setVinSuccess(false);
  };

  const valueBlocks = [
    { key: "retail" as const, label: "RETAIL", emoji: "🏷️", bg: "from-red-600 to-red-700", desc: "Dealer lot price" },
    { key: "tradeIn" as const, label: "TRADE-IN", emoji: "🔄", bg: "from-orange-500 to-orange-600", desc: "Dealer trade value" },
    { key: "privateParty" as const, label: "PRIVATE PARTY", emoji: "🤝", bg: "from-purple-500 to-purple-600", desc: "Person-to-person" },
    { key: "auction" as const, label: "AUCTION", emoji: "🔨", bg: "from-blue-500 to-blue-600", desc: "Auction block price" },
    { key: "wholesale" as const, label: "WHOLESALE", emoji: "📦", bg: "from-emerald-500 to-emerald-600", desc: "Dealer-to-dealer" },
  ];

  const isFormValid = form.make && form.model;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/appraisals" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          ← Back to Appraisals
        </Link>
        {(form.make || form.model || form.vin) && (
          <button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            🔄 Reset Form
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">🔥 New Market Appraisal</h1>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">Live</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Form */}
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-semibold">Vehicle Details</h3>
            <div className="flex bg-[#0a0e17] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setMode("vin")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  mode === "vin" ? "bg-[#3dd45c]/20 text-[#3dd45c]" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                🔍 VIN Lookup
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  mode === "manual" ? "bg-[#3dd45c]/20 text-[#3dd45c]" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                ✏️ Manual
              </button>
            </div>
          </div>
          <div className="p-5 space-y-5">
            {/* Quick-fill from inventory */}
            {vehicles.length > 0 && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Quick-fill from Inventory</label>
                <select
                  value={form.vehicle_id}
                  onChange={(e) => fillFromVehicle(e.target.value)}
                  className="w-full bg-[#0a0e17] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#3dd45c]/50"
                >
                  <option value="">Select a vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{vehicleLabel(v)} — {v.stock_number}</option>
                  ))}
                </select>
              </div>
            )}

            {/* VIN Input (shown in VIN mode) */}
            {mode === "vin" && (
              <>
                <VinInput
                  value={form.vin}
                  onChange={(v) => set("vin", v)}
                  onDecode={handleVinDecode}
                  isDecoding={vinDecoding}
                  error={errors.vin}
                />

                {/* VIN Decode Success */}
                {vinSuccess && vinDecoded?.success && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 animate-in fade-in">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-400 text-sm font-medium">✅ VIN Decoded Successfully</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Year:</span>
                        <span className="text-white font-medium">{vinDecoded.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Make:</span>
                        <span className="text-white font-medium">{vinDecoded.make}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Model:</span>
                        <span className="text-white font-medium">{vinDecoded.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trim:</span>
                        <span className="text-white font-medium">{vinDecoded.trim || "—"}</span>
                      </div>
                      {vinDecoded.bodyClass && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Body:</span>
                          <span className="text-white font-medium">{vinDecoded.bodyClass}</span>
                        </div>
                      )}
                      {vinDecoded.engineCylinders && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Engine:</span>
                          <span className="text-white font-medium">{vinDecoded.engineCylinders}cyl {vinDecoded.engineDisplacement ? `${vinDecoded.engineDisplacement}L` : ""}</span>
                        </div>
                      )}
                      {vinDecoded.driveType && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Drive:</span>
                          <span className="text-white font-medium">{vinDecoded.driveType}</span>
                        </div>
                      )}
                      {vinDecoded.fuelType && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fuel:</span>
                          <span className="text-white font-medium">{vinDecoded.fuelType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.06]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#131a2b] px-3 text-[10px] text-gray-500 uppercase tracking-wider">Vehicle Info {vinDecoded?.success ? "(auto-filled)" : "(or enter manually)"}</span>
                  </div>
                </div>
              </>
            )}

            {/* Year & Make */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Year</label>
                <select
                  value={form.year}
                  onChange={(e) => set("year", e.target.value)}
                  className="w-full bg-[#0a0e17] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#3dd45c]/50"
                >
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Make <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.make}
                  onChange={(e) => set("make", e.target.value)}
                  className={`w-full bg-[#0a0e17] border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                    errors.make ? "border-red-500/50 focus:border-red-500" : "border-white/[0.08] focus:border-[#3dd45c]/50"
                  }`}
                >
                  <option value="">Select Make</option>
                  {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                {errors.make && <p className="mt-1 text-[11px] text-red-400">{errors.make}</p>}
              </div>
            </div>

            {/* Model & Trim */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Model <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.model}
                  onChange={(e) => set("model", e.target.value)}
                  placeholder="e.g. Civic"
                  className={`w-full bg-[#0a0e17] border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors ${
                    errors.model ? "border-red-500/50 focus:border-red-500" : "border-white/[0.08] focus:border-[#3dd45c]/50"
                  }`}
                />
                {errors.model && <p className="mt-1 text-[11px] text-red-400">{errors.model}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Trim</label>
                <input
                  value={form.trim}
                  onChange={(e) => set("trim", e.target.value)}
                  placeholder="e.g. EX, LT, XLT"
                  className="w-full bg-[#0a0e17] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#3dd45c]/50"
                />
              </div>
            </div>

            {/* Mileage */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Mileage</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.miles}
                  onChange={(e) => set("miles", e.target.value)}
                  placeholder="Enter odometer reading"
                  min={0}
                  className={`w-full bg-[#0a0e17] border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors pr-16 ${
                    errors.miles ? "border-red-500/50 focus:border-red-500" : "border-white/[0.08] focus:border-[#3dd45c]/50"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-500">miles</span>
              </div>
              {errors.miles && <p className="mt-1 text-[11px] text-red-400">{errors.miles}</p>}
              {form.miles && Number(form.miles) > 0 && (
                <p className="mt-1 text-[10px] text-gray-500">
                  {Number(form.miles).toLocaleString()} miles
                  {form.year && ` · ~${Math.round(Number(form.miles) / Math.max(1, 2025 - parseInt(form.year))).toLocaleString()} mi/year`}
                </p>
              )}
            </div>

            {/* Condition Pickers */}
            <ConditionPicker
              label="Mechanical Condition"
              value={form.mechanical_condition}
              onChange={(v) => set("mechanical_condition", v)}
            />
            <ConditionPicker
              label="Appearance / Cosmetic"
              value={form.appearance}
              onChange={(v) => set("appearance", v)}
            />

            {/* Submit */}
            <button
              onClick={handleAppraise}
              disabled={loading || !isFormValid}
              className="w-full py-3.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Analyzing Market Data...
                </span>
              ) : (
                "🔥 Get Live Market Appraisal"
              )}
            </button>

            <p className="text-[10px] text-gray-500 text-center">
              {hasCarsXEApiKey()
                ? "CarsXE Live Market Data · NHTSA VIN Decoder · Real-time pricing"
                : "Local Market Engine · NHTSA VIN Decoder · Add CarsXE API key in Settings for live data"}
            </p>
          </div>
        </div>

        {/* Right - Results */}
        <div className="space-y-6">
          <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-sm font-semibold">Market Values</h3>
              {result && (
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    result.source === "carsxe"
                      ? "bg-blue-500/15 text-blue-400"
                      : "bg-yellow-500/15 text-yellow-400"
                  }`}>
                    {result.source === "carsxe" ? "📡 CarsXE Live" : "🧮 Local Est."}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
                    5 Values
                  </span>
                </div>
              )}
            </div>
            {!result ? (
              <div className="p-5 flex flex-col items-center justify-center min-h-[360px] text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-4">
                  <span className="text-4xl">🔥</span>
                </div>
                <h4 className="text-lg font-semibold mb-2">Market Value Engine</h4>
                <p className="text-sm text-gray-400 max-w-xs mb-6">
                  Enter vehicle details and click &quot;Get Live Market Appraisal&quot; to see 5 market value estimates.
                </p>
                <div className="grid grid-cols-5 gap-2 w-full max-w-sm">
                  {valueBlocks.map((vb) => (
                    <div key={vb.key} className="flex flex-col items-center gap-1 opacity-30">
                      <span className="text-lg">{vb.emoji}</span>
                      <span className="text-[8px] text-gray-500 uppercase">{vb.label.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="text-center mb-2">
                  <p className="text-base font-semibold">
                    {form.year} {form.make} {form.model} {form.trim}
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-1">
                    {form.miles && (
                      <span className="text-xs text-gray-400">
                        📏 {Number(form.miles).toLocaleString()} mi
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      🔧 {form.mechanical_condition}
                    </span>
                    <span className="text-xs text-gray-400">
                      ✨ {form.appearance}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {valueBlocks.map((vb) => (
                    <div
                      key={vb.key}
                      className={`bg-gradient-to-r ${vb.bg} rounded-xl p-4 flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{vb.emoji}</span>
                        <div>
                          <p className="text-xs text-white/70 uppercase tracking-wider font-medium">{vb.label}</p>
                          <p className="text-[10px] text-white/50">{vb.desc}</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-white">{fmtCurrency(result[vb.key])}</p>
                    </div>
                  ))}
                </div>

                {/* Market Data from CarsXE */}
                {result.source === "carsxe" && result.marketData && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-400 text-xs font-medium">📡 CarsXE Market Intelligence</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mean Price:</span>
                        <span className="text-white font-medium">{fmtCurrency(result.marketData.mean)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sample Size:</span>
                        <span className="text-white font-medium">{result.marketData.sampleSize.toLocaleString()} sales</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Below Market:</span>
                        <span className="text-emerald-400 font-medium">{fmtCurrency(result.marketData.belowMarket)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Above Market:</span>
                        <span className="text-red-400 font-medium">{fmtCurrency(result.marketData.aboveMarket)}</span>
                      </div>
                      {result.marketData.publishDate && (
                        <div className="col-span-2 flex justify-between">
                          <span className="text-gray-400">Data Updated:</span>
                          <span className="text-white font-medium">{result.marketData.publishDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Spread indicator */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-400">Value Spread</span>
                    <span className="text-white font-medium">
                      {fmtCurrency(result.wholesale)} — {fmtCurrency(result.retail)}
                    </span>
                  </div>
                  <div className="h-2 bg-[#0a0e17] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 via-purple-500 via-orange-500 to-red-500 rounded-full"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-gray-500">Wholesale</span>
                    <span className="text-[9px] text-gray-500">Retail</span>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs text-emerald-400 text-center">
                  ✅ Appraisal saved to your records
                </div>

                <button
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-lg text-sm font-medium border border-white/[0.08] text-gray-300 hover:bg-white/[0.04] hover:text-white transition-all"
                >
                  🔄 New Appraisal
                </button>
              </div>
            )}
          </div>

          {/* Tips Card */}
          {!result && (
            <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5">
              <h4 className="text-sm font-semibold mb-3">💡 Tips for Accurate Values</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-[#3dd45c] mt-0.5">●</span>
                  <span>Use <strong className="text-gray-300">VIN Lookup</strong> for the most accurate year/make/model/trim data from NHTSA</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-[#3dd45c] mt-0.5">●</span>
                  <span>Enter <strong className="text-gray-300">exact mileage</strong> — every 10k miles can shift value by $1,000+</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-[#3dd45c] mt-0.5">●</span>
                  <span>Be honest about <strong className="text-gray-300">condition</strong> — overrating leads to overpricing and slower sales</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-[#3dd45c] mt-0.5">●</span>
                  <span><strong className="text-gray-300">Wholesale</strong> is your buy target, <strong className="text-gray-300">Retail</strong> is your sell ceiling</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/appraisals/new")({
  component: NewAppraisalPage,
});
