import { useState, useRef } from "react";
import { useStore, type VehicleStatus, type PaymentMethod, type TitleType, type DamageType, type Drivability, type Vehicle, IMAGE_VIEW_TYPES, type VehicleImage, type ImageViewType, uid, DAMAGE_TYPES, DRIVABILITY_OPTIONS } from "@/lib/store";

interface Props {
  open: boolean;
  onClose: () => void;
}

const YEARS = Array.from({ length: 30 }, (_, i) => String(2025 - i));
const MAKES = ["Acura","Audi","BMW","Buick","Cadillac","Chevrolet","Chrysler","Dodge","Ford","Genesis","GMC","Honda","Hyundai","Infiniti","Jaguar","Jeep","Kia","Land Rover","Lexus","Lincoln","Mazda","Mercedes-Benz","Mini","Mitsubishi","Nissan","Porsche","Ram","Subaru","Tesla","Toyota","Volkswagen","Volvo"];

const VIEW_ICONS: Record<ImageViewType, string> = {
  "Driver Side": "🚗", "Passenger Side": "🚙", "Front": "🔲", "Rear": "🔳",
  "VIN Plate": "🔢", "Interior": "💺", "Undercarriage": "🔧", "Mileage": "🛣️",
};

type EntryMode = "choose" | "vin" | "manual";

export function AddVehicleModal({ open, onClose }: Props) {
  const { addVehicle, categories, toast } = useStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [entryMode, setEntryMode] = useState<EntryMode>("choose");
  const [images, setImages] = useState<VehicleImage[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingView, setUploadingView] = useState<ImageViewType | null>(null);
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState("");

  const [form, setForm] = useState({
    year: "2024", make: "", model: "", trim: "", miles: "", purchase_price: "",
    vin: "", status: "Prospect" as VehicleStatus, purchase_location: "",
    payment_method: "Cash" as PaymentMethod, title_type: "Clean" as TitleType,
    primary_damage: "NONE" as DamageType, secondary_damage: "NONE" as DamageType,
    drivability: "Runs and Drives" as Drivability, date_purchased: "",
    notes: "", categoryId: "",
  });

  if (!open) return null;

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleVinDecode = async () => {
    if (!form.vin || form.vin.length !== 17) {
      setVinError("VIN must be exactly 17 characters");
      return;
    }
    setVinLoading(true);
    setVinError("");
    try {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${form.vin}?format=json`);
      const data = await res.json();
      const r = data.Results?.[0];
      if (r) {
        const decoded: Record<string, string> = {};
        if (r.ModelYear && r.ModelYear !== "0") decoded.year = r.ModelYear;
        if (r.Make) decoded.make = r.Make;
        if (r.Model) decoded.model = r.Model;
        if (r.Trim) decoded.trim = r.Trim;
        setForm((p) => ({ ...p, ...decoded }));
        toast("VIN decoded successfully!");
      } else {
        setVinError("Could not decode VIN. Please check and try again.");
      }
    } catch {
      setVinError("Failed to decode VIN. Please try again or enter manually.");
    } finally {
      setVinLoading(false);
    }
  };

  const handleImageUpload = (viewType: ImageViewType, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImages((prev) => {
        const filtered = prev.filter((img) => img.viewType !== viewType);
        return [...filtered, { id: uid(), viewType, dataUrl, fileName: file.name }];
      });
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = (viewType: ImageViewType) => {
    setUploadingView(viewType);
    fileRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingView) {
      handleImageUpload(uploadingView, file);
    }
    e.target.value = "";
    setUploadingView(null);
  };

  const handleSubmit = () => {
    if (!form.make || !form.model) return;
    const stockNum = "INV-" + String(Date.now()).slice(-4);
    addVehicle({
      year: form.year, make: form.make, model: form.model, trim: form.trim,
      vin: form.vin, miles: Number(form.miles) || 0,
      purchase_price: Number(form.purchase_price) || 0,
      mechanical_condition: "Good", appearance: "Good",
      exterior_color: "", interior_color: "",
      status: form.status, stock_number: stockNum,
      purchase_location: form.purchase_location,
      payment_method: form.payment_method, title_type: form.title_type,
      primary_damage: form.primary_damage, secondary_damage: form.secondary_damage,
      drivability: form.drivability, date_purchased: form.date_purchased,
      seller_name: "", seller_phone: "", seller_email: "",
      seller_location: "", seller_description: "",
      buyer_name: "", sale_price: 0, sale_date: "", commission: 0,
      notes: form.notes, images, categoryId: form.categoryId || undefined,
    } as Omit<Vehicle, "id" | "created_at">);
    toast("Vehicle added successfully!");
    resetAndClose();
  };

  const resetAndClose = () => {
    onClose();
    setForm({ year: "2024", make: "", model: "", trim: "", miles: "", purchase_price: "", vin: "", status: "Prospect", purchase_location: "", payment_method: "Cash", title_type: "Clean", primary_damage: "NONE", secondary_damage: "NONE", drivability: "Runs and Drives", date_purchased: "", notes: "", categoryId: "" });
    setImages([]);
    setStep(1);
    setEntryMode("choose");
    setVinError("");
  };

  const inputCls = "w-full bg-[#0a0e17] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#3dd45c]/50";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetAndClose} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      <div className="relative w-full max-w-lg bg-[#131a2b] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-lg font-semibold">🗃️ Add a Vehicle</h2>
          <div className="flex items-center gap-3">
            {entryMode !== "choose" && (
              <div className="flex gap-1">
                <span className={`w-2 h-2 rounded-full ${step === 1 ? "bg-[#3dd45c]" : "bg-white/20"}`} />
                <span className={`w-2 h-2 rounded-full ${step === 2 ? "bg-[#3dd45c]" : "bg-white/20"}`} />
              </div>
            )}
            <button onClick={resetAndClose} className="text-gray-400 hover:text-white transition-colors text-xl">&times;</button>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Entry Mode Selection */}
          {entryMode === "choose" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400 text-center">How would you like to add this vehicle?</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setEntryMode("vin")}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-white/[0.08] hover:border-[#3dd45c]/50 bg-[#0a0e17] transition-all group"
                >
                  <span className="text-3xl">🔢</span>
                  <span className="text-sm font-semibold text-white group-hover:text-[#3dd45c] transition-colors">VIN Lookup</span>
                  <span className="text-[11px] text-gray-500 text-center">Auto-fill vehicle info from VIN</span>
                </button>
                <button
                  onClick={() => setEntryMode("manual")}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-white/[0.08] hover:border-[#3dd45c]/50 bg-[#0a0e17] transition-all group"
                >
                  <span className="text-3xl">✏️</span>
                  <span className="text-sm font-semibold text-white group-hover:text-[#3dd45c] transition-colors">Manual Entry</span>
                  <span className="text-[11px] text-gray-500 text-center">Enter all details yourself</span>
                </button>
              </div>
            </div>
          )}

          {/* VIN Entry Mode */}
          {entryMode === "vin" && step === 1 && (
            <>
              <div className="bg-[#0a0e17] border border-white/[0.08] rounded-xl p-4 space-y-3">
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Enter VIN to Auto-Fill</label>
                <div className="flex gap-2">
                  <input
                    value={form.vin}
                    onChange={(e) => { set("vin", e.target.value.toUpperCase()); setVinError(""); }}
                    placeholder="17-character VIN"
                    maxLength={17}
                    className={inputCls + " font-mono tracking-wider"}
                  />
                  <button
                    onClick={handleVinDecode}
                    disabled={vinLoading || form.vin.length !== 17}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity disabled:opacity-40 whitespace-nowrap"
                  >
                    {vinLoading ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Decoding...
                      </span>
                    ) : "Decode"}
                  </button>
                </div>
                {vinError && <p className="text-xs text-red-400">{vinError}</p>}
                <p className="text-[10px] text-gray-600">VIN will be decoded using NHTSA database</p>
              </div>

              {/* Show decoded/editable fields */}
              <VehicleFormFields form={form} set={set} inputCls={inputCls} categories={categories} />
            </>
          )}

          {/* Manual Entry Mode */}
          {entryMode === "manual" && step === 1 && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">VIN (Optional)</label>
                <input value={form.vin} onChange={(e) => set("vin", e.target.value.toUpperCase())} placeholder="17-character VIN" maxLength={17} className={inputCls + " font-mono"} />
              </div>
              <VehicleFormFields form={form} set={set} inputCls={inputCls} categories={categories} />
            </>
          )}

          {/* Step 2: Photos */}
          {entryMode !== "choose" && step === 2 && (
            <>
              <p className="text-xs text-gray-400 mb-2">Upload photos for each view (optional). Tap a slot to add a photo.</p>
              <div className="grid grid-cols-2 gap-3">
                {IMAGE_VIEW_TYPES.map((viewType) => {
                  const img = images.find((i) => i.viewType === viewType);
                  return (
                    <button
                      key={viewType}
                      onClick={() => triggerUpload(viewType)}
                      className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-white/[0.1] hover:border-[#3dd45c]/40 bg-[#0a0e17] flex flex-col items-center justify-center gap-1.5 transition-all overflow-hidden group"
                    >
                      {img ? (
                        <>
                          <img src={img.dataUrl} alt={viewType} className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-xs font-medium text-white">Replace</span>
                          </div>
                          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-medium text-white">{viewType}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl opacity-40">{VIEW_ICONS[viewType]}</span>
                          <span className="text-[10px] text-gray-500 font-medium">{viewType}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {entryMode !== "choose" && (
          <div className="px-6 py-4 border-t border-white/[0.06] flex justify-between">
            {step === 2 ? (
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all">← Back</button>
            ) : (
              <button onClick={() => setEntryMode("choose")} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all">← Back</button>
            )}
            <div className="flex gap-3">
              {step === 1 && (
                <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-white/[0.08] hover:bg-white/[0.12] transition-all">
                  📷 Add Photos →
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!form.make || !form.model}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {step === 1 ? "Add Vehicle" : "Save with Photos"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Shared form fields used by both VIN and Manual modes */
function VehicleFormFields({ form, set, inputCls, categories }: {
  form: Record<string, any>;
  set: (k: string, v: string) => void;
  inputCls: string;
  categories: { id: string; name: string }[];
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Year *</label>
          <select value={form.year} onChange={(e) => set("year", e.target.value)} className={inputCls}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Make *</label>
          <select value={form.make} onChange={(e) => set("make", e.target.value)} className={inputCls}>
            <option value="">Select Make</option>
            {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Model *</label>
          <input value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="e.g. Civic" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Trim</label>
          <input value={form.trim} onChange={(e) => set("trim", e.target.value)} placeholder="e.g. EX" className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Miles</label>
          <input type="number" value={form.miles} onChange={(e) => set("miles", e.target.value)} placeholder="0" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Purchase Price</label>
          <input type="number" value={form.purchase_price} onChange={(e) => set("purchase_price", e.target.value)} placeholder="0" className={inputCls} />
        </div>
      </div>

      {/* New Fields: Damage, Drivability, Date Purchased */}
      <div className="border-t border-white/[0.06] pt-4">
        <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Condition & Damage</h4>
        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Date Purchased</label>
            <input type="date" value={form.date_purchased} onChange={(e) => set("date_purchased", e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06] pt-4">
        <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Purchase Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-gray-400 mb-1.5">Purchase Location</label>
            <input value={form.purchase_location} onChange={(e) => set("purchase_location", e.target.value)} placeholder="e.g. Dallas, TX" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Payment Method</label>
            <select value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)} className={inputCls}>
              <option value="Cash">Cash</option><option value="Card">Card</option>
              <option value="Credit-line">Credit-line</option><option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Title Type</label>
            <select value={form.title_type} onChange={(e) => set("title_type", e.target.value)} className={inputCls}>
              <option value="Clean">Clean</option><option value="Salvage">Salvage</option>
              <option value="Certificate of Destruction">Certificate of Destruction</option>
            </select>
          </div>
        </div>
      </div>
      {categories.length > 0 && (
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Category</label>
          <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls}>
            <option value="">No Category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Status</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
            <option value="Prospect">Prospect</option><option value="Active">Active</option><option value="Sold">Sold</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Notes</label>
        <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="Any notes..." className={inputCls + " resize-none"} />
      </div>
    </>
  );
}
