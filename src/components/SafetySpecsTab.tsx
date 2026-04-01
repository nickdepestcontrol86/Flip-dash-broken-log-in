import { useState, useEffect, useCallback } from "react";
import type { Vehicle } from "@/lib/store";

// ─── NHTSA API Types ─────────────────────────────────────────────────

interface NHTSARecall {
  NHTSAActionNumber: string;
  Manufacturer: string;
  Subject: string;
  Component: string;
  Summary: string;
  Consequence: string;
  Remedy: string;
  ReportReceivedDate: string;
  PotentialNumberOfUnitsAffected: number;
}

interface NHTSASafetyRating {
  VehicleId: number;
  VehicleDescription: string;
  OverallRating: string;
  OverallFrontCrashRating: string;
  OverallSideCrashRating: string;
  RolloverRating: string;
  RolloverPossibility: string;
  NHTSAElectronicStabilityControl: string;
  NHTSAForwardCollisionWarning: string;
  NHTSALaneDepartureWarning: string;
}

interface NHTSAComplaint {
  odiNumber: number;
  manufacturer: string;
  crash: boolean;
  fire: boolean;
  numberOfInjuries: number;
  numberOfDeaths: number;
  dateOfIncident: string;
  dateComplaintFiled: string;
  summary: string;
  components: string;
}

interface VehicleSpecs {
  make: string;
  model: string;
  year: string;
  bodyClass: string;
  driveType: string;
  engineCylinders: string;
  engineDisplacement: string;
  fuelType: string;
  transmissionStyle: string;
  trim: string;
  gvwr: string;
  doors: string;
  series: string;
  plantCountry: string;
  vehicleType: string;
}

// ─── Resolved vehicle info (from Vehicle object or VIN decode) ───────

interface ResolvedVehicleInfo {
  vin: string;
  make: string;
  model: string;
  year: string;
  title_type?: string;
}

// ─── Star Rating Component ────────────────────────────────────────────

function StarRating({ rating, max = 5 }: { rating: string | number; max?: number }) {
  const num = typeof rating === "string" ? parseFloat(rating) : rating;
  if (!num || isNaN(num)) return <span className="text-gray-500 text-sm">N/A</span>;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-lg ${i < Math.round(num) ? "text-yellow-400" : "text-gray-600"}`}>★</span>
      ))}
      <span className="text-sm text-gray-400 ml-1">{num}/{max}</span>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────

function SectionCard({ title, icon, children, badge, badgeColor }: {
  title: string; icon: string; children: React.ReactNode;
  badge?: string; badgeColor?: string;
}) {
  return (
    <div className="bg-[#0d1220] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{icon}</span>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        {badge && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor || "bg-gray-500/20 text-gray-400"}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded ${className}`} />;
}

// ─── Props ────────────────────────────────────────────────────────────

interface SafetySpecsTabProps {
  /** Pass a full vehicle object (from inventory) */
  vehicle?: Vehicle;
  /** OR pass just a VIN string (standalone lookup) */
  vin?: string;
}

// Legacy support: also export with required vehicle prop signature
export type SafetySpecsTabVehicleProps = { vehicle: Vehicle };

// ─── Main Component ───────────────────────────────────────────────────

export function SafetySpecsTab(props: SafetySpecsTabProps | { vehicle: Vehicle }) {
  const vehicle = 'vehicle' in props ? props.vehicle : props.vehicle;
  const vinProp = 'vin' in props ? (props as SafetySpecsTabProps).vin : undefined;
  const [recalls, setRecalls] = useState<NHTSARecall[]>([]);
  const [safetyRatings, setSafetyRatings] = useState<NHTSASafetyRating[]>([]);
  const [complaints, setComplaints] = useState<NHTSAComplaint[]>([]);
  const [specs, setSpecs] = useState<VehicleSpecs | null>(null);
  const [loadingRecalls, setLoadingRecalls] = useState(false);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [loadingVinDecode, setLoadingVinDecode] = useState(false);
  const [expandedRecall, setExpandedRecall] = useState<string | null>(null);
  const [expandedComplaint, setExpandedComplaint] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<"overview" | "recalls" | "complaints" | "specs">("overview");
  const [resolvedInfo, setResolvedInfo] = useState<ResolvedVehicleInfo | null>(null);
  const [vinError, setVinError] = useState<string | null>(null);

  // Determine the VIN and vehicle info to use
  const effectiveVin = vehicle?.vin || vinProp || "";
  const hasVin = effectiveVin.length === 17;

  // If we have a vehicle object, use it directly. Otherwise, we need to decode the VIN first.
  const vehicleInfo: ResolvedVehicleInfo | null = vehicle
    ? { vin: vehicle.vin || "", make: vehicle.make, model: vehicle.model, year: String(vehicle.year), title_type: vehicle.title_type }
    : resolvedInfo;

  // ── Decode VIN to get make/model/year (standalone mode) ──────────
  const decodeVin = useCallback(async () => {
    if (vehicle || !hasVin) return; // Skip if we already have vehicle data
    setLoadingVinDecode(true);
    setVinError(null);
    try {
      const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${effectiveVin}?format=json`;
      const res = await fetch(url);
      const data = await res.json();
      const r = data.Results?.[0];
      if (r && r.Make && r.Model && r.ModelYear) {
        setResolvedInfo({
          vin: effectiveVin,
          make: r.Make,
          model: r.Model,
          year: r.ModelYear,
        });
        // Also set specs from the same decode
        setSpecs({
          make: r.Make || "",
          model: r.Model || "",
          year: r.ModelYear || "",
          bodyClass: r.BodyClass || "",
          driveType: r.DriveType || "",
          engineCylinders: r.EngineCylinders || "",
          engineDisplacement: r.DisplacementL ? `${parseFloat(r.DisplacementL).toFixed(1)}L` : "",
          fuelType: r.FuelTypePrimary || "",
          transmissionStyle: r.TransmissionStyle || "",
          trim: r.Trim || "",
          gvwr: r.GVWR || "",
          doors: r.Doors || "",
          series: r.Series || "",
          plantCountry: r.PlantCountry || "",
          vehicleType: r.VehicleType || "",
        });
        setLoadingSpecs(false);
      } else {
        setVinError("Could not decode VIN. Please check and try again.");
      }
    } catch {
      setVinError("Failed to decode VIN. Network error.");
    } finally {
      setLoadingVinDecode(false);
    }
  }, [effectiveVin, hasVin, vehicle]);

  // ── Fetch NHTSA Recalls ──────────────────────────────────────────
  const fetchRecalls = useCallback(async () => {
    if (!vehicleInfo) return;
    setLoadingRecalls(true);
    try {
      const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(vehicleInfo.make)}&model=${encodeURIComponent(vehicleInfo.model)}&modelYear=${encodeURIComponent(vehicleInfo.year)}`;
      const res = await fetch(url);
      const data = await res.json();
      setRecalls(data.results || []);
    } catch {
      setRecalls([]);
    } finally {
      setLoadingRecalls(false);
    }
  }, [vehicleInfo?.make, vehicleInfo?.model, vehicleInfo?.year]);

  // ── Fetch NHTSA Safety Ratings ───────────────────────────────────
  const fetchSafetyRatings = useCallback(async () => {
    if (!vehicleInfo) return;
    setLoadingRatings(true);
    try {
      const idUrl = `https://api.nhtsa.gov/SafetyRatings/modelyear/${vehicleInfo.year}/make/${encodeURIComponent(vehicleInfo.make)}/model/${encodeURIComponent(vehicleInfo.model)}`;
      const idRes = await fetch(idUrl);
      const idData = await idRes.json();
      const vehicleIds: number[] = (idData.Results || []).slice(0, 3).map((r: any) => r.VehicleId);

      if (vehicleIds.length === 0) {
        setSafetyRatings([]);
        return;
      }

      const ratingRes = await fetch(`https://api.nhtsa.gov/SafetyRatings/VehicleId/${vehicleIds[0]}`);
      const ratingData = await ratingRes.json();
      setSafetyRatings(ratingData.Results || []);
    } catch {
      setSafetyRatings([]);
    } finally {
      setLoadingRatings(false);
    }
  }, [vehicleInfo?.make, vehicleInfo?.model, vehicleInfo?.year]);

  // ── Fetch NHTSA Complaints ───────────────────────────────────────
  const fetchComplaints = useCallback(async () => {
    if (!vehicleInfo) return;
    setLoadingComplaints(true);
    try {
      const url = `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=${encodeURIComponent(vehicleInfo.make)}&model=${encodeURIComponent(vehicleInfo.model)}&modelYear=${encodeURIComponent(vehicleInfo.year)}`;
      const res = await fetch(url);
      const data = await res.json();
      setComplaints((data.results || []).slice(0, 20));
    } catch {
      setComplaints([]);
    } finally {
      setLoadingComplaints(false);
    }
  }, [vehicleInfo?.make, vehicleInfo?.model, vehicleInfo?.year]);

  // ── Fetch VIN Specs (only when we have a vehicle object — standalone already decoded above) ──
  const fetchSpecs = useCallback(async () => {
    if (!vehicle || !hasVin) return;
    setLoadingSpecs(true);
    try {
      const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${effectiveVin}?format=json`;
      const res = await fetch(url);
      const data = await res.json();
      const r = data.Results?.[0];
      if (r) {
        setSpecs({
          make: r.Make || "",
          model: r.Model || "",
          year: r.ModelYear || "",
          bodyClass: r.BodyClass || "",
          driveType: r.DriveType || "",
          engineCylinders: r.EngineCylinders || "",
          engineDisplacement: r.DisplacementL ? `${parseFloat(r.DisplacementL).toFixed(1)}L` : "",
          fuelType: r.FuelTypePrimary || "",
          transmissionStyle: r.TransmissionStyle || "",
          trim: r.Trim || "",
          gvwr: r.GVWR || "",
          doors: r.Doors || "",
          series: r.Series || "",
          plantCountry: r.PlantCountry || "",
          vehicleType: r.VehicleType || "",
        });
      }
    } catch {
      setSpecs(null);
    } finally {
      setLoadingSpecs(false);
    }
  }, [effectiveVin, hasVin, vehicle]);

  // Step 1: Decode VIN if standalone mode
  useEffect(() => {
    if (!vehicle && hasVin) {
      decodeVin();
    }
  }, [decodeVin, vehicle, hasVin]);

  // Step 2: Fetch NHTSA data once we have vehicle info
  useEffect(() => {
    if (vehicleInfo) {
      fetchRecalls();
      fetchSafetyRatings();
      fetchComplaints();
      if (vehicle && hasVin) fetchSpecs();
    }
  }, [vehicleInfo?.make, vehicleInfo?.model, vehicleInfo?.year, fetchRecalls, fetchSafetyRatings, fetchComplaints, fetchSpecs, vehicle, hasVin]);

  // ── Loading state for standalone VIN decode ──────────────────────
  if (!vehicle && loadingVinDecode) {
    return (
      <div className="space-y-5">
        <div className="bg-[#0d1220] border border-white/[0.06] rounded-xl p-8 text-center">
          <div className="w-12 h-12 border-3 border-[#3dd45c]/30 border-t-[#3dd45c] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-semibold mb-1">Decoding VIN...</p>
          <p className="text-gray-400 text-sm font-mono">{effectiveVin}</p>
        </div>
      </div>
    );
  }

  // ── VIN decode error ─────────────────────────────────────────────
  if (!vehicle && vinError) {
    return (
      <div className="space-y-5">
        <div className="bg-[#0d1220] border border-red-500/20 rounded-xl p-8 text-center">
          <p className="text-4xl mb-3">❌</p>
          <p className="text-white font-semibold mb-2">VIN Decode Failed</p>
          <p className="text-gray-400 text-sm mb-2">{vinError}</p>
          <p className="text-gray-500 text-xs font-mono">{effectiveVin}</p>
        </div>
      </div>
    );
  }

  // ── No vehicle info yet (shouldn't happen but safety check) ─────
  if (!vehicleInfo) {
    return (
      <div className="bg-[#0d1220] border border-white/[0.06] rounded-xl p-8 text-center">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-white font-semibold mb-2">No Vehicle Data</p>
        <p className="text-gray-400 text-sm">Enter a valid 17-character VIN to look up safety and specs data.</p>
      </div>
    );
  }

  const rating = safetyRatings[0];
  const recallCount = recalls.length;
  const complaintCount = complaints.length;
  const injuryCount = complaints.reduce((s, c) => s + (c.numberOfInjuries || 0), 0);
  const crashCount = complaints.filter((c) => c.crash).length;

  const overallRating = rating?.OverallRating;
  const ratingNum = overallRating ? parseFloat(overallRating) : null;
  const ratingColor = ratingNum
    ? ratingNum >= 4 ? "text-emerald-400" : ratingNum >= 3 ? "text-yellow-400" : "text-red-400"
    : "text-gray-400";

  const sections = [
    { key: "overview" as const, label: "Overview", icon: "🛡️" },
    { key: "recalls" as const, label: "Recalls", icon: "⚠️", count: recallCount },
    { key: "complaints" as const, label: "Complaints", icon: "📋", count: complaintCount },
    { key: "specs" as const, label: "Tech Specs", icon: "🔧" },
  ];

  const titleType = vehicleInfo.title_type;

  return (
    <div className="space-y-5">
      {/* Vehicle Identity Banner (standalone mode) */}
      {!vehicle && vehicleInfo && (
        <div className="bg-gradient-to-r from-[#3dd45c]/10 to-[#00c9a7]/10 border border-[#3dd45c]/20 rounded-xl p-5">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3dd45c] to-[#00c9a7] flex items-center justify-center text-2xl">
              🚗
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white">
                {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                {specs?.trim ? ` ${specs.trim}` : ""}
              </h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs text-gray-400 font-mono">{vehicleInfo.vin}</span>
                {specs?.bodyClass && <span className="text-xs text-gray-500">• {specs.bodyClass}</span>}
                {specs?.fuelType && <span className="text-xs text-gray-500">• {specs.fuelType}</span>}
                {specs?.driveType && <span className="text-xs text-gray-500">• {specs.driveType}</span>}
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 uppercase tracking-wider">
              VIN Decoded
            </span>
          </div>
        </div>
      )}

      {/* Sub-nav */}
      <div className="flex gap-1 overflow-x-auto">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeSection === s.key
                ? "bg-[#3dd45c]/15 text-[#3dd45c] border border-[#3dd45c]/30"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
            {s.count !== undefined && s.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                s.key === "recalls" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"
              }`}>{s.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeSection === "overview" && (
        <div className="space-y-4">
          {/* Safety Score Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0d1220] border border-white/[0.06] rounded-xl p-4 text-center">
              {loadingRatings ? <Skeleton className="h-10 w-16 mx-auto mb-2" /> : (
                <p className={`text-3xl font-black mb-1 ${ratingColor}`}>
                  {ratingNum ? `${ratingNum}/5` : "—"}
                </p>
              )}
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">NHTSA Overall</p>
            </div>
            <div className="bg-[#0d1220] border border-white/[0.06] rounded-xl p-4 text-center">
              {loadingRecalls ? <Skeleton className="h-10 w-10 mx-auto mb-2" /> : (
                <p className={`text-3xl font-black mb-1 ${recallCount > 0 ? "text-orange-400" : "text-emerald-400"}`}>
                  {recallCount}
                </p>
              )}
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">Open Recalls</p>
            </div>
            <div className="bg-[#0d1220] border border-white/[0.06] rounded-xl p-4 text-center">
              {loadingComplaints ? <Skeleton className="h-10 w-10 mx-auto mb-2" /> : (
                <p className={`text-3xl font-black mb-1 ${complaintCount > 50 ? "text-red-400" : complaintCount > 20 ? "text-yellow-400" : "text-emerald-400"}`}>
                  {complaintCount}
                </p>
              )}
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">Complaints</p>
            </div>
            <div className="bg-[#0d1220] border border-white/[0.06] rounded-xl p-4 text-center">
              {loadingComplaints ? <Skeleton className="h-10 w-10 mx-auto mb-2" /> : (
                <p className={`text-3xl font-black mb-1 ${crashCount > 0 ? "text-red-400" : "text-emerald-400"}`}>
                  {crashCount}
                </p>
              )}
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">Crash Reports</p>
            </div>
          </div>

          {/* NHTSA Safety Ratings */}
          <SectionCard
            title="NHTSA Crash Test Ratings"
            icon="💥"
            badge={loadingRatings ? "Loading..." : rating ? "Live Data" : "No Data"}
            badgeColor={rating ? "bg-emerald-500/15 text-emerald-400" : "bg-gray-500/15 text-gray-400"}
          >
            {loadingRatings ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : rating ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Overall Safety", value: rating.OverallRating },
                    { label: "Front Crash", value: rating.OverallFrontCrashRating },
                    { label: "Side Crash", value: rating.OverallSideCrashRating },
                    { label: "Rollover", value: rating.RolloverRating },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                      <span className="text-sm text-gray-400">{label}</span>
                      <StarRating rating={value} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { label: "Electronic Stability Control", value: rating.NHTSAElectronicStabilityControl },
                    { label: "Forward Collision Warning", value: rating.NHTSAForwardCollisionWarning },
                    { label: "Lane Departure Warning", value: rating.NHTSALaneDepartureWarning },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/[0.03] rounded-lg p-3">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                      <p className={`text-sm font-semibold ${
                        value === "Standard" ? "text-emerald-400" :
                        value === "Optional" ? "text-yellow-400" :
                        value === "Not Available" ? "text-red-400" : "text-gray-400"
                      }`}>{value || "N/A"}</p>
                    </div>
                  ))}
                </div>
                {rating.RolloverPossibility && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                    <p className="text-[11px] text-orange-400 font-semibold uppercase tracking-wider mb-1">Rollover Possibility</p>
                    <p className="text-sm text-gray-300">{rating.RolloverPossibility}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-4xl mb-2">🔍</p>
                <p className="text-gray-400 text-sm">No NHTSA safety ratings found for this vehicle</p>
                <p className="text-gray-600 text-xs mt-1">{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</p>
              </div>
            )}
          </SectionCard>

          {/* External Lookup Buttons */}
          <SectionCard title="External Vehicle History Lookups" icon="🔗">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  name: "CARFAX Report",
                  desc: "Full vehicle history, accidents, service records",
                  icon: "📋",
                  color: "from-blue-600 to-blue-700",
                  url: hasVin
                    ? `https://www.carfax.com/VehicleHistory/p/Report_.cfx?partner=DEA_0&vin=${effectiveVin}`
                    : "https://www.carfax.com",
                  badge: "Paid",
                  badgeColor: "bg-blue-500/20 text-blue-400",
                },
                {
                  name: "AutoCheck by Experian",
                  desc: "Auction history, title events, odometer checks",
                  icon: "🏷️",
                  color: "from-purple-600 to-purple-700",
                  url: hasVin
                    ? `https://www.autocheck.com/vehiclehistory/autocheck/en/vehiclehistory?vin=${effectiveVin}`
                    : "https://www.autocheck.com",
                  badge: "Paid",
                  badgeColor: "bg-purple-500/20 text-purple-400",
                },
                {
                  name: "NICB Theft Check",
                  desc: "Free stolen vehicle & salvage title check",
                  icon: "🚨",
                  color: "from-red-600 to-red-700",
                  url: hasVin
                    ? `https://www.nicb.org/vincheck?vin=${effectiveVin}`
                    : "https://www.nicb.org/vincheck",
                  badge: "Free",
                  badgeColor: "bg-emerald-500/20 text-emerald-400",
                },
                {
                  name: "NHTSA Recall Lookup",
                  desc: "Official government recall database",
                  icon: "⚠️",
                  color: "from-orange-600 to-orange-700",
                  url: hasVin
                    ? `https://www.nhtsa.gov/vehicle/${effectiveVin}/results`
                    : `https://www.nhtsa.gov/recalls`,
                  badge: "Free",
                  badgeColor: "bg-emerald-500/20 text-emerald-400",
                },
                {
                  name: "Copart Auction History",
                  desc: "Salvage & insurance auction records",
                  icon: "🔨",
                  color: "from-yellow-600 to-yellow-700",
                  url: hasVin
                    ? `https://www.copart.com/lotSearchResults/?free=true&query=${effectiveVin}`
                    : "https://www.copart.com",
                  badge: "Free",
                  badgeColor: "bg-emerald-500/20 text-emerald-400",
                },
                {
                  name: "IAAI Auction History",
                  desc: "Insurance Auto Auctions vehicle records",
                  icon: "🏛️",
                  color: "from-teal-600 to-teal-700",
                  url: hasVin
                    ? `https://www.iaai.com/Search?SearchText=${effectiveVin}`
                    : "https://www.iaai.com",
                  badge: "Free",
                  badgeColor: "bg-emerald-500/20 text-emerald-400",
                },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-lg flex-shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-white group-hover:text-[#3dd45c] transition-colors">{item.name}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${item.badgeColor}`}>{item.badge}</span>
                    </div>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                    {!hasVin && <p className="text-[10px] text-orange-400 mt-1">⚠️ Add VIN for direct lookup</p>}
                  </div>
                  <span className="text-gray-600 group-hover:text-gray-300 transition-colors text-sm">↗</span>
                </a>
              ))}
            </div>
          </SectionCard>

          {/* Vehicle Protection Summary */}
          <SectionCard title="Vehicle Protection Summary" icon="🛡️">
            <div className={`grid grid-cols-1 ${titleType ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-4`}>
              <div className={`rounded-xl p-4 border ${recallCount === 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-orange-500/10 border-orange-500/20"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{recallCount === 0 ? "✅" : "⚠️"}</span>
                  <p className="text-sm font-semibold">{recallCount === 0 ? "No Active Recalls" : `${recallCount} Recall${recallCount > 1 ? "s" : ""} Found`}</p>
                </div>
                <p className="text-xs text-gray-400">
                  {recallCount === 0
                    ? "No open safety recalls found for this vehicle"
                    : "Check the Recalls tab for details and remedy information"}
                </p>
              </div>
              <div className={`rounded-xl p-4 border ${injuryCount === 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{injuryCount === 0 ? "✅" : "🚑"}</span>
                  <p className="text-sm font-semibold">{injuryCount === 0 ? "No Injuries Reported" : `${injuryCount} Injuries Reported`}</p>
                </div>
                <p className="text-xs text-gray-400">
                  {injuryCount === 0
                    ? "No injury reports found in NHTSA complaints database"
                    : "Injuries reported in owner complaints — review before purchase"}
                </p>
              </div>
              {titleType && (
                <div className={`rounded-xl p-4 border ${titleType === "Clean" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{titleType === "Clean" ? "✅" : "🔴"}</span>
                    <p className="text-sm font-semibold">{titleType} Title</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {titleType === "Clean"
                      ? "Clean title on record — no major damage history reported"
                      : "Non-clean title — verify damage history before purchase"}
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── RECALLS ── */}
      {activeSection === "recalls" && (
        <SectionCard
          title={`NHTSA Safety Recalls — ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`}
          icon="⚠️"
          badge={loadingRecalls ? "Loading..." : `${recallCount} found`}
          badgeColor={recallCount > 0 ? "bg-orange-500/15 text-orange-400" : "bg-emerald-500/15 text-emerald-400"}
        >
          {loadingRecalls ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : recalls.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-5xl mb-3">✅</p>
              <p className="text-white font-semibold mb-1">No Open Recalls Found</p>
              <p className="text-gray-400 text-sm">The NHTSA database shows no active safety recalls for this vehicle</p>
              <a
                href={`https://www.nhtsa.gov/recalls`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-[#3dd45c] text-sm hover:underline"
              >
                Verify on NHTSA.gov ↗
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {recalls.map((recall, i) => (
                <div key={recall.NHTSAActionNumber || i} className="border border-orange-500/20 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedRecall(expandedRecall === recall.NHTSAActionNumber ? null : recall.NHTSAActionNumber)}
                    className="w-full px-4 py-3.5 flex items-start justify-between hover:bg-white/[0.02] transition-colors text-left gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 uppercase">
                          #{recall.NHTSAActionNumber}
                        </span>
                        <span className="text-[10px] text-gray-500">{recall.ReportReceivedDate?.split("T")[0]}</span>
                        {recall.PotentialNumberOfUnitsAffected > 0 && (
                          <span className="text-[10px] text-gray-500">{recall.PotentialNumberOfUnitsAffected.toLocaleString()} units affected</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-white">{recall.Subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{recall.Component}</p>
                    </div>
                    <span className="text-gray-500 text-xs mt-1">{expandedRecall === recall.NHTSAActionNumber ? "▲" : "▼"}</span>
                  </button>
                  {expandedRecall === recall.NHTSAActionNumber && (
                    <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06]">
                      {recall.Summary && (
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 mt-3">Summary</p>
                          <p className="text-sm text-gray-300">{recall.Summary}</p>
                        </div>
                      )}
                      {recall.Consequence && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                          <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1 font-semibold">⚠️ Consequence</p>
                          <p className="text-sm text-gray-300">{recall.Consequence}</p>
                        </div>
                      )}
                      {recall.Remedy && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                          <p className="text-[10px] text-emerald-400 uppercase tracking-wider mb-1 font-semibold">✅ Remedy</p>
                          <p className="text-sm text-gray-300">{recall.Remedy}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* ── COMPLAINTS ── */}
      {activeSection === "complaints" && (
        <SectionCard
          title={`Owner Complaints — ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`}
          icon="📋"
          badge={loadingComplaints ? "Loading..." : `${complaintCount} found`}
          badgeColor={complaintCount > 0 ? "bg-blue-500/15 text-blue-400" : "bg-emerald-500/15 text-emerald-400"}
        >
          {loadingComplaints ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-5xl mb-3">👍</p>
              <p className="text-white font-semibold mb-1">No Complaints Found</p>
              <p className="text-gray-400 text-sm">No owner complaints on record for this vehicle</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-blue-400">{complaintCount}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Total</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                  <p className={`text-xl font-bold ${injuryCount > 0 ? "text-red-400" : "text-emerald-400"}`}>{injuryCount}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Injuries</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                  <p className={`text-xl font-bold ${crashCount > 0 ? "text-orange-400" : "text-emerald-400"}`}>{crashCount}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Crashes</p>
                </div>
              </div>
              {complaints.map((c) => (
                <div key={c.odiNumber} className="border border-white/[0.06] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedComplaint(expandedComplaint === c.odiNumber ? null : c.odiNumber)}
                    className="w-full px-4 py-3 flex items-start justify-between hover:bg-white/[0.02] transition-colors text-left gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] text-gray-500">ODI #{c.odiNumber}</span>
                        {c.crash && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/20 text-orange-400">CRASH</span>}
                        {c.fire && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400">FIRE</span>}
                        {c.numberOfInjuries > 0 && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400">{c.numberOfInjuries} INJURED</span>}
                      </div>
                      <p className="text-xs text-gray-400">{c.components}</p>
                    </div>
                    <span className="text-gray-500 text-xs">{expandedComplaint === c.odiNumber ? "▲" : "▼"}</span>
                  </button>
                  {expandedComplaint === c.odiNumber && c.summary && (
                    <div className="px-4 pb-4 border-t border-white/[0.06]">
                      <p className="text-sm text-gray-300 mt-3">{c.summary}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* ── TECH SPECS ── */}
      {activeSection === "specs" && (
        <div className="space-y-4">
          {!hasVin ? (
            <div className="bg-[#0d1220] border border-orange-500/20 rounded-xl p-8 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-white font-semibold mb-2">VIN Required for Full Specs</p>
              <p className="text-gray-400 text-sm mb-4">Add a 17-character VIN to unlock decoded vehicle specifications from NHTSA</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <span className="text-orange-400 text-sm">Current VIN: {effectiveVin || "Not set"}</span>
              </div>
            </div>
          ) : loadingSpecs ? (
            <SectionCard title="Decoding VIN..." icon="🔧">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            </SectionCard>
          ) : specs ? (
            <>
              <SectionCard title="NHTSA VIN Decoded Specifications" icon="🔧" badge="Live Data" badgeColor="bg-emerald-500/15 text-emerald-400">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
                  {[
                    { label: "Make", value: specs.make },
                    { label: "Model", value: specs.model },
                    { label: "Year", value: specs.year },
                    { label: "Trim", value: specs.trim },
                    { label: "Series", value: specs.series },
                    { label: "Body Class", value: specs.bodyClass },
                    { label: "Vehicle Type", value: specs.vehicleType },
                    { label: "Drive Type", value: specs.driveType },
                    { label: "Engine Cylinders", value: specs.engineCylinders ? `${specs.engineCylinders} cylinders` : "" },
                    { label: "Engine Displacement", value: specs.engineDisplacement },
                    { label: "Fuel Type", value: specs.fuelType },
                    { label: "Transmission", value: specs.transmissionStyle },
                    { label: "Doors", value: specs.doors },
                    { label: "GVWR", value: specs.gvwr },
                    { label: "Plant Country", value: specs.plantCountry },
                  ].filter((r) => r.value).map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
                      <span className="text-sm text-white font-medium text-right max-w-[60%]">{value}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="VIN Breakdown" icon="🔢">
                <div className="font-mono text-center mb-4">
                  <div className="flex justify-center gap-0.5 flex-wrap">
                    {effectiveVin.split("").map((char, i) => {
                      const section =
                        i < 3 ? "WMI" :
                        i < 9 ? "VDS" :
                        i === 9 ? "Check" :
                        i === 10 ? "Year" :
                        i === 11 ? "Plant" : "Seq";
                      const colors: Record<string, string> = {
                        WMI: "bg-blue-500/20 text-blue-300",
                        VDS: "bg-purple-500/20 text-purple-300",
                        Check: "bg-yellow-500/20 text-yellow-300",
                        Year: "bg-emerald-500/20 text-emerald-300",
                        Plant: "bg-orange-500/20 text-orange-300",
                        Seq: "bg-gray-500/20 text-gray-300",
                      };
                      return (
                        <div key={i} className={`w-8 h-10 flex items-center justify-center rounded text-sm font-bold ${colors[section]}`}>
                          {char}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3 text-[10px]">
                  {[
                    { label: "WMI (1-3)", color: "bg-blue-500/20 text-blue-300", desc: "World Manufacturer" },
                    { label: "VDS (4-9)", color: "bg-purple-500/20 text-purple-300", desc: "Vehicle Descriptor" },
                    { label: "Check (9)", color: "bg-yellow-500/20 text-yellow-300", desc: "Check Digit" },
                    { label: "Year (10)", color: "bg-emerald-500/20 text-emerald-300", desc: "Model Year" },
                    { label: "Plant (11)", color: "bg-orange-500/20 text-orange-300", desc: "Assembly Plant" },
                    { label: "Seq (12-17)", color: "bg-gray-500/20 text-gray-300", desc: "Serial Number" },
                  ].map(({ label, color, desc }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${color}`}>{label}</span>
                      <span className="text-gray-500">{desc}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </>
          ) : (
            <div className="bg-[#0d1220] border border-white/[0.06] rounded-xl p-8 text-center">
              <p className="text-4xl mb-3">❌</p>
              <p className="text-white font-semibold mb-2">Could Not Decode VIN</p>
              <p className="text-gray-400 text-sm">NHTSA returned no data for VIN: {effectiveVin}</p>
            </div>
          )}

          {/* Free Data Sources Info */}
          <SectionCard title="Free Vehicle Data Sources" icon="📡">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: "NHTSA vPIC API", desc: "VIN decoding, manufacturer data, vehicle specs", status: "Active", url: "https://vpic.nhtsa.dot.gov/api/" },
                { name: "NHTSA Recalls API", desc: "Real-time safety recall database", status: "Active", url: "https://api.nhtsa.gov/recalls/" },
                { name: "NHTSA Safety Ratings", desc: "Crash test ratings & safety scores", status: "Active", url: "https://api.nhtsa.gov/SafetyRatings/" },
                { name: "NHTSA Complaints API", desc: "Owner complaint database", status: "Active", url: "https://api.nhtsa.gov/complaints/" },
                { name: "NICB VINCheck", desc: "Stolen vehicle & salvage title lookup", status: "External", url: "https://www.nicb.org/vincheck" },
                { name: "Copart / IAAI", desc: "Auction history records", status: "External", url: "https://www.copart.com" },
              ].map((src) => (
                <a
                  key={src.name}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg border border-white/[0.06] transition-all group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white group-hover:text-[#3dd45c] transition-colors">{src.name}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${src.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}>
                        {src.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{src.desc}</p>
                  </div>
                  <span className="text-gray-600 group-hover:text-gray-300 text-sm">↗</span>
                </a>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
