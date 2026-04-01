// ─── Vehicle Valuation Engine ────────────────────────────────────────
// Uses NHTSA vPIC API (free, no key) for VIN decoding
// Uses CarsXE API for live market values (when API key available)
// Falls back to local algorithm for market value estimation

import type { MechCondition } from "./store";

// ─── NHTSA VIN Decoder (Free, No API Key) ────────────────────────────

export interface VinDecodeResult {
  success: boolean;
  year: string;
  make: string;
  model: string;
  trim: string;
  bodyClass: string;
  driveType: string;
  engineCylinders: string;
  engineDisplacement: string;
  fuelType: string;
  transmissionStyle: string;
  errorText?: string;
}

export async function decodeVin(vin: string): Promise<VinDecodeResult> {
  const cleanVin = vin.trim().toUpperCase();
  if (cleanVin.length !== 17) {
    return {
      success: false,
      year: "", make: "", model: "", trim: "",
      bodyClass: "", driveType: "", engineCylinders: "",
      engineDisplacement: "", fuelType: "", transmissionStyle: "",
      errorText: "VIN must be exactly 17 characters",
    };
  }

  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${cleanVin}?format=json`
    );
    if (!res.ok) throw new Error("NHTSA API request failed");

    const data = await res.json();
    const result = data.Results?.[0];
    if (!result) throw new Error("No results returned");

    const errorCode = result.ErrorCode;
    const hasErrors = errorCode && !errorCode.startsWith("0");

    return {
      success: !hasErrors,
      year: result.ModelYear || "",
      make: result.Make || "",
      model: result.Model || "",
      trim: result.Trim || "",
      bodyClass: result.BodyClass || "",
      driveType: result.DriveType || "",
      engineCylinders: result.EngineCylinders || "",
      engineDisplacement: result.DisplacementL || "",
      fuelType: result.FuelTypePrimary || "",
      transmissionStyle: result.TransmissionStyle || "",
      errorText: hasErrors ? (result.ErrorText || "VIN decode returned errors") : undefined,
    };
  } catch (err) {
    return {
      success: false,
      year: "", make: "", model: "", trim: "",
      bodyClass: "", driveType: "", engineCylinders: "",
      engineDisplacement: "", fuelType: "", transmissionStyle: "",
      errorText: err instanceof Error ? err.message : "Failed to decode VIN",
    };
  }
}

// ─── CarsXE API Integration ─────────────────────────────────────────
// Live market value data from CarsXE (requires API key)
// Endpoint: https://api.carsxe.com/marketvalue?key=KEY&vin=VIN

export interface CarsXEMarketValue {
  mean: number;
  belowMarket: number;
  aboveMarket: number;
  standardDeviation: number;
  sampleSize: number;
}

export interface CarsXEResponse {
  success: boolean;
  source: "carsxe" | "local";
  vehicleInfo?: {
    year: string;
    make: string;
    model: string;
    style: string;
    mileageCategory: string;
  };
  prices: {
    retail: number;
    tradeIn: number;
    privateParty: number;
    auction: number;
    wholesale: number;
  };
  marketData?: {
    mean: number;
    belowMarket: number;
    aboveMarket: number;
    sampleSize: number;
    publishDate: string;
  };
  error?: string;
}

// Map our condition scale to CarsXE condition values
function mapConditionToCarsXE(mech: MechCondition, appearance: MechCondition): string {
  const condMap: Record<MechCondition, number> = {
    "Excellent": 4, "Good": 3, "Fair": 2, "Poor": 1,
  };
  const avg = (condMap[mech] + condMap[appearance]) / 2;
  if (avg >= 3.5) return "excellent";
  if (avg >= 2.5) return "clean";
  if (avg >= 1.5) return "average";
  return "rough";
}

export async function fetchCarsXEMarketValue(
  vin: string,
  mileage?: number,
  mechanicalCondition?: MechCondition,
  appearance?: MechCondition,
  state?: string,
  apiKey?: string,
): Promise<CarsXEResponse> {
  const key = apiKey || getCarsXEApiKey();

  if (!key) {
    return {
      success: false,
      source: "local",
      prices: { retail: 0, tradeIn: 0, privateParty: 0, auction: 0, wholesale: 0 },
      error: "No CarsXE API key configured. Using local estimation.",
    };
  }

  const cleanVin = vin.trim().toUpperCase();
  if (cleanVin.length !== 17) {
    return {
      success: false,
      source: "local",
      prices: { retail: 0, tradeIn: 0, privateParty: 0, auction: 0, wholesale: 0 },
      error: "Invalid VIN format",
    };
  }

  try {
    const params = new URLSearchParams({ key, vin: cleanVin });
    if (state) params.set("state", state);
    if (mileage && mileage > 0) params.set("mileage", String(mileage));
    if (mechanicalCondition && appearance) {
      params.set("condition", mapConditionToCarsXE(mechanicalCondition, appearance));
    }

    const res = await fetch(`https://api.carsxe.com/marketvalue?${params.toString()}`);

    if (!res.ok) {
      throw new Error(`CarsXE API returned ${res.status}`);
    }

    const data = await res.json();

    // CarsXE returns pricing data in the response
    if (data.error || (!data.mean_price && !data.prices)) {
      throw new Error(data.error || "No pricing data returned");
    }

    // Parse CarsXE response format
    const meanPrice = parseFloat(data.mean_price) || 0;
    const belowMarket = parseFloat(data.below_market_price) || 0;
    const aboveMarket = parseFloat(data.above_market_price) || 0;
    const sampleSize = parseInt(data.sample_size) || 0;

    // Derive 5 value categories from CarsXE market data
    // Retail = above market (dealer asking price)
    // Private Party = mean price
    // Trade-In = below market
    // Auction = ~85% of below market
    // Wholesale = ~78% of below market
    const retail = Math.round((aboveMarket || meanPrice * 1.15) / 100) * 100;
    const privateParty = Math.round(meanPrice / 100) * 100;
    const tradeIn = Math.round((belowMarket || meanPrice * 0.82) / 100) * 100;
    const auction = Math.round((belowMarket || meanPrice * 0.82) * 0.88 / 100) * 100;
    const wholesale = Math.round((belowMarket || meanPrice * 0.82) * 0.81 / 100) * 100;

    return {
      success: true,
      source: "carsxe",
      vehicleInfo: {
        year: data.model_year || "",
        make: data.make || "",
        model: data.model || "",
        style: data.style || "",
        mileageCategory: data.mileage_cat || "",
      },
      prices: { retail, tradeIn, privateParty, auction, wholesale },
      marketData: {
        mean: meanPrice,
        belowMarket,
        aboveMarket,
        sampleSize,
        publishDate: data.publish_date || "",
      },
    };
  } catch (err) {
    return {
      success: false,
      source: "local",
      prices: { retail: 0, tradeIn: 0, privateParty: 0, auction: 0, wholesale: 0 },
      error: err instanceof Error ? err.message : "CarsXE API request failed",
    };
  }
}

// ─── API Key Management ──────────────────────────────────────────────

let _carsxeApiKey: string | null = null;

export function setCarsXEApiKey(key: string): void {
  _carsxeApiKey = key;
  try {
    localStorage.setItem("carsxe_api_key", key);
  } catch {
    // localStorage not available
  }
}

export function getCarsXEApiKey(): string | null {
  if (_carsxeApiKey) return _carsxeApiKey;
  try {
    const stored = localStorage.getItem("carsxe_api_key");
    if (stored) {
      _carsxeApiKey = stored;
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return null;
}

export function clearCarsXEApiKey(): void {
  _carsxeApiKey = null;
  try {
    localStorage.removeItem("carsxe_api_key");
  } catch {
    // localStorage not available
  }
}

export function hasCarsXEApiKey(): boolean {
  return !!getCarsXEApiKey();
}

// ─── Unified Valuation Function ──────────────────────────────────────
// Tries CarsXE first, falls back to local estimation

export interface ValuationResult {
  source: "carsxe" | "local";
  retail: number;
  tradeIn: number;
  privateParty: number;
  auction: number;
  wholesale: number;
  marketData?: {
    mean: number;
    belowMarket: number;
    aboveMarket: number;
    sampleSize: number;
    publishDate: string;
  };
  vehicleInfo?: {
    year: string;
    make: string;
    model: string;
    style: string;
    mileageCategory: string;
  };
}

export async function getValuation(params: {
  vin?: string;
  year: string;
  make: string;
  model: string;
  miles: number;
  mechanicalCondition: MechCondition;
  appearance: MechCondition;
  bodyClass?: string;
  state?: string;
}): Promise<ValuationResult> {
  // Try CarsXE first if VIN is available and API key is set
  if (params.vin && hasCarsXEApiKey()) {
    const carsxeResult = await fetchCarsXEMarketValue(
      params.vin,
      params.miles,
      params.mechanicalCondition,
      params.appearance,
      params.state,
    );

    if (carsxeResult.success && carsxeResult.prices.retail > 0) {
      return {
        source: "carsxe",
        retail: carsxeResult.prices.retail,
        tradeIn: carsxeResult.prices.tradeIn,
        privateParty: carsxeResult.prices.privateParty,
        auction: carsxeResult.prices.auction,
        wholesale: carsxeResult.prices.wholesale,
        marketData: carsxeResult.marketData,
        vehicleInfo: carsxeResult.vehicleInfo,
      };
    }
  }

  // Fall back to local estimation
  const localValues = estimateMarketValues(
    params.year,
    params.make,
    params.model,
    params.miles,
    params.mechanicalCondition,
    params.appearance,
    params.bodyClass,
  );

  return {
    source: "local",
    retail: localValues.retail,
    tradeIn: localValues.trade_in,
    privateParty: localValues.private_party,
    auction: localValues.auction,
    wholesale: localValues.wholesale,
  };
}

// ─── Market Value Estimation Engine ──────────────────────────────────
// Enhanced local algorithm based on real market data patterns

export interface MarketValues {
  retail: number;
  trade_in: number;
  private_party: number;
  auction: number;
  wholesale: number;
}

// Base MSRP estimates by make (rough averages for common models)
const MAKE_BASE_MSRP: Record<string, number> = {
  "Acura": 38000, "Audi": 45000, "BMW": 48000, "Buick": 32000,
  "Cadillac": 45000, "Chevrolet": 30000, "Chrysler": 32000, "Dodge": 33000,
  "Ford": 34000, "Genesis": 42000, "GMC": 40000, "Honda": 28000,
  "Hyundai": 26000, "Infiniti": 42000, "Jaguar": 52000, "Jeep": 36000,
  "Kia": 26000, "Land Rover": 55000, "Lexus": 44000, "Lincoln": 48000,
  "Mazda": 28000, "Mercedes-Benz": 50000, "Mini": 30000, "Mitsubishi": 25000,
  "Nissan": 28000, "Porsche": 65000, "Ram": 38000, "Subaru": 30000,
  "Tesla": 45000, "Toyota": 30000, "Volkswagen": 30000, "Volvo": 42000,
};

// Retention rates by make (how well they hold value)
const MAKE_RETENTION: Record<string, number> = {
  "Toyota": 0.92, "Honda": 0.90, "Subaru": 0.89, "Porsche": 0.91,
  "Lexus": 0.90, "Tesla": 0.85, "Jeep": 0.86, "Ford": 0.84,
  "Chevrolet": 0.82, "Ram": 0.85, "GMC": 0.85, "Mazda": 0.86,
  "Hyundai": 0.83, "Kia": 0.83, "Nissan": 0.81, "Volkswagen": 0.80,
  "BMW": 0.78, "Mercedes-Benz": 0.77, "Audi": 0.79, "Acura": 0.84,
  "Infiniti": 0.76, "Cadillac": 0.77, "Volvo": 0.79, "Genesis": 0.78,
  "Land Rover": 0.75, "Jaguar": 0.72, "Lincoln": 0.76, "Buick": 0.78,
  "Chrysler": 0.76, "Dodge": 0.79, "Mini": 0.77, "Mitsubishi": 0.78,
};

// Body class adjustments
const BODY_ADJUSTMENTS: Record<string, number> = {
  "Truck": 1.15, "Pickup": 1.15, "SUV": 1.10,
  "Sedan": 1.0, "Coupe": 1.02, "Convertible": 1.05,
  "Wagon": 0.98, "Van": 0.95, "Minivan": 0.92,
};

export function estimateMarketValues(
  year: string,
  make: string,
  model: string,
  miles: number,
  mechanicalCondition: MechCondition,
  appearance: MechCondition,
  bodyClass?: string,
): MarketValues {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - parseInt(year);

  // 1. Start with base MSRP for the make
  const baseMsrp = MAKE_BASE_MSRP[make] || 30000;

  // 2. Apply annual depreciation with retention curve
  const retention = MAKE_RETENTION[make] || 0.82;
  let depreciatedValue = baseMsrp;
  if (vehicleAge >= 1) {
    depreciatedValue *= 0.80; // first year hit
    for (let i = 1; i < vehicleAge; i++) {
      depreciatedValue *= retention;
    }
  }

  // 3. Mileage adjustment (average 12k miles/year)
  const expectedMiles = vehicleAge * 12000;
  const milesDiff = miles - expectedMiles;
  const mileageAdjustment = -(milesDiff / 1000) * 150;
  depreciatedValue += mileageAdjustment;

  // 4. Condition multipliers
  const mechMultiplier: Record<MechCondition, number> = {
    "Excellent": 1.08, "Good": 1.0, "Fair": 0.88, "Poor": 0.72,
  };
  const appMultiplier: Record<MechCondition, number> = {
    "Excellent": 1.04, "Good": 1.0, "Fair": 0.93, "Poor": 0.84,
  };
  depreciatedValue *= mechMultiplier[mechanicalCondition];
  depreciatedValue *= appMultiplier[appearance];

  // 5. Body class adjustment
  if (bodyClass) {
    const bodyKey = Object.keys(BODY_ADJUSTMENTS).find(
      (k) => bodyClass.toLowerCase().includes(k.toLowerCase())
    );
    if (bodyKey) {
      depreciatedValue *= BODY_ADJUSTMENTS[bodyKey];
    }
  }

  // 6. Floor value (no vehicle worth less than $1,500)
  depreciatedValue = Math.max(depreciatedValue, 1500);

  // 7. Calculate all 5 market value tiers
  const retail = Math.round(depreciatedValue * 1.15 / 100) * 100;
  const privateParty = Math.round(depreciatedValue / 100) * 100;
  const tradeIn = Math.round(depreciatedValue * 0.82 / 100) * 100;
  const auction = Math.round(depreciatedValue * 0.73 / 100) * 100;
  const wholesale = Math.round(depreciatedValue * 0.67 / 100) * 100;

  return {
    retail,
    trade_in: tradeIn,
    private_party: privateParty,
    auction,
    wholesale,
  };
}

// ─── VIN Validation ──────────────────────────────────────────────────

export function isValidVinFormat(vin: string): boolean {
  if (vin.length !== 17) return false;
  if (/[IOQ]/i.test(vin)) return false;
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return false;
  return true;
}

export function formatVin(vin: string): string {
  return vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/gi, "").slice(0, 17);
}
