import { createContext, useContext } from "react";

// ─── Types ───────────────────────────────────────────────────────────
export type VehicleStatus = "Prospect" | "Active" | "Sold";
export type MechCondition = "Excellent" | "Good" | "Fair" | "Poor";
export type PaymentMethod = "Cash" | "Card" | "Credit-line" | "Other";
export type TitleType = "Clean" | "Salvage" | "Certificate of Destruction";

export type DamageType =
  | "ALL OVER" | "BURN" | "BURN ENGINE" | "BURN INTERIOR" | "FRONT END"
  | "HAIL" | "MECHANICAL" | "MINOR DENT/SCRATCHES" | "NORMAL WEAR"
  | "REAR END" | "REJECT REPAIR" | "ROLLOVER" | "SIDE" | "STRIPPED"
  | "TOP/ROOF" | "UNDERCARRIAGE" | "VANDALISM" | "WATER/FLOOD" | "NONE";

export type Drivability = "Runs and Drives" | "Starts" | "Non-Starts";

export const DAMAGE_TYPES: DamageType[] = [
  "NONE", "ALL OVER", "BURN", "BURN ENGINE", "BURN INTERIOR", "FRONT END",
  "HAIL", "MECHANICAL", "MINOR DENT/SCRATCHES", "NORMAL WEAR",
  "REAR END", "REJECT REPAIR", "ROLLOVER", "SIDE", "STRIPPED",
  "TOP/ROOF", "UNDERCARRIAGE", "VANDALISM", "WATER/FLOOD",
];

export const DRIVABILITY_OPTIONS: Drivability[] = ["Runs and Drives", "Starts", "Non-Starts"];

export const IMAGE_VIEW_TYPES = [
  "Driver Side",
  "Passenger Side",
  "Front",
  "Rear",
  "VIN Plate",
  "Interior",
  "Undercarriage",
  "Mileage",
] as const;
export type ImageViewType = (typeof IMAGE_VIEW_TYPES)[number];

export interface VehicleImage {
  id: string;
  viewType: ImageViewType;
  dataUrl: string;
  fileName: string;
}

export interface VehicleCategory {
  id: string;
  name: string;
  color: string;
}

export interface Vehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  vin: string;
  miles: number;
  purchase_price: number;
  mechanical_condition: MechCondition;
  appearance: MechCondition;
  exterior_color: string;
  interior_color: string;
  status: VehicleStatus;
  stock_number: string;
  purchase_location: string;
  payment_method: PaymentMethod;
  title_type: TitleType;
  primary_damage: DamageType;
  secondary_damage: DamageType;
  drivability: Drivability;
  date_purchased: string;
  seller_name: string;
  seller_phone: string;
  seller_email: string;
  seller_location: string;
  seller_description: string;
  buyer_name: string;
  sale_price: number;
  sale_date: string;
  commission: number;
  notes: string;
  created_at: string;
  images?: VehicleImage[];
  categoryId?: string;
}

export type ExpenseCategory =
  | "Vehicle Purchase"
  | "Lien Payment"
  | "Repair"
  | "Parts"
  | "License/Title"
  | "Cleaning/Detail"
  | "Fuel"
  | "Advertising"
  | "Commission"
  | "Vehicle Sale"
  | "Insurance"
  | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Vehicle Purchase",
  "Lien Payment",
  "Repair",
  "Parts",
  "License/Title",
  "Cleaning/Detail",
  "Fuel",
  "Advertising",
  "Commission",
  "Vehicle Sale",
  "Insurance",
  "Other",
];

export interface Expense {
  id: string;
  vehicle_id: string;
  date: string;
  type: ExpenseCategory;
  description: string;
  amount: number;
  is_income: boolean;
  created_at: string;
}

export interface Appraisal {
  id: string;
  vehicle_id: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  miles: number;
  mechanical_condition: MechCondition;
  appearance: MechCondition;
  retail: number;
  trade_in: number;
  private_party: number;
  auction: number;
  wholesale: number;
  source?: "carsxe" | "local";
  created_at: string;
}

// ─── Marketplace Listing (enhanced with vehicle specs) ───────────────
export interface MarketplaceListing {
  id: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  miles: number;
  price: number;
  location: string;
  exteriorColor: string;
  imageUrl: string;
  imageUrls?: string[];
  daysListed: number;
  source: "marketplace" | "user";
  sourceUrl?: string;
  sellerName: string;
  sellerPhone?: string;
  sellerEmail?: string;
  description: string;
  vin?: string;
  postedAt: string;
  drivetrain?: string;
  fuelType?: string;
  engine?: string;
  bodyStyle?: string;
  transmission?: string;
  titleType?: string;
  features?: string[];
  contactPreference?: "phone" | "email" | "chat" | "any";
  interiorColor?: string;
}

// ─── Marketplace Offer ───────────────────────────────────────────────
export interface MarketplaceOffer {
  id: string;
  listingId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  offerAmount: number;
  message: string;
  status: "pending" | "accepted" | "rejected" | "countered";
  rating?: "excellent" | "good" | "fair" | "low";
  ratingLabel?: string;
  createdAt: string;
}

// ─── Deal Score for marketplace listings ─────────────────────────────
export type DealScore = "steal" | "great" | "good" | "fair" | "overpriced";

export interface DealRating {
  score: DealScore;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  pctOfMarket: number;
  description: string;
}

export function getDealRating(askingPrice: number, estimatedRetail: number, estimatedWholesale: number): DealRating {
  if (estimatedRetail <= 0) {
    return { score: "fair", label: "No Data", emoji: "❓", color: "text-gray-400", bgColor: "bg-gray-500/20", pctOfMarket: 0, description: "Not enough data to rate this deal" };
  }
  const midMarket = (estimatedRetail + estimatedWholesale) / 2;
  const pct = (askingPrice / midMarket) * 100;

  if (pct <= 75) return { score: "steal", label: "Steal Deal", emoji: "🔥", color: "text-emerald-400", bgColor: "bg-emerald-500/20", pctOfMarket: Math.round(pct), description: "Way below market value - act fast!" };
  if (pct <= 88) return { score: "great", label: "Great Deal", emoji: "💰", color: "text-green-400", bgColor: "bg-green-500/20", pctOfMarket: Math.round(pct), description: "Priced well below market average" };
  if (pct <= 98) return { score: "good", label: "Good Deal", emoji: "👍", color: "text-blue-400", bgColor: "bg-blue-500/20", pctOfMarket: Math.round(pct), description: "Solid price, slightly under market" };
  if (pct <= 110) return { score: "fair", label: "Fair Price", emoji: "⚖️", color: "text-yellow-400", bgColor: "bg-yellow-500/20", pctOfMarket: Math.round(pct), description: "Right around market value" };
  return { score: "overpriced", label: "Overpriced", emoji: "📈", color: "text-red-400", bgColor: "bg-red-500/20", pctOfMarket: Math.round(pct), description: "Above market value - negotiate down" };
}

// Estimate market values for a listing based on year/miles/make
export function estimateMarketValues(listing: MarketplaceListing): { retail: number; wholesale: number; tradeIn: number; privateParty: number } {
  const currentYear = new Date().getFullYear();
  const age = currentYear - parseInt(listing.year);
  const baseMSRP = getBaseMSRP(listing.make, listing.model, listing.bodyStyle);
  
  let depreciationRate = 1;
  if (age <= 1) depreciationRate = 0.82;
  else if (age <= 3) depreciationRate = 0.82 * Math.pow(0.88, age - 1);
  else if (age <= 7) depreciationRate = 0.82 * Math.pow(0.88, 2) * Math.pow(0.92, age - 3);
  else depreciationRate = 0.82 * Math.pow(0.88, 2) * Math.pow(0.92, 4) * Math.pow(0.95, age - 7);

  const expectedMiles = age * 12000;
  const milesDiff = listing.miles - expectedMiles;
  const mileageAdj = 1 - (milesDiff / 100000) * 0.15;

  const baseValue = baseMSRP * depreciationRate * Math.max(0.5, Math.min(1.3, mileageAdj));
  
  const retail = Math.round(baseValue / 100) * 100;
  const privateParty = Math.round(retail * 0.88 / 100) * 100;
  const tradeIn = Math.round(retail * 0.78 / 100) * 100;
  const wholesale = Math.round(retail * 0.72 / 100) * 100;

  return { retail, wholesale, tradeIn, privateParty };
}

function getBaseMSRP(make: string, model: string, bodyStyle?: string): number {
  const luxuryMakes = ["BMW", "Mercedes-Benz", "Lexus", "Audi", "Porsche", "Tesla", "Infiniti", "Acura", "Genesis", "Volvo", "Land Rover", "Jaguar", "Cadillac", "Lincoln"];
  const truckModels = ["F-150", "Silverado", "1500", "Sierra", "Tundra", "Titan", "Ranger", "Colorado", "Tacoma", "Gladiator", "Frontier"];
  
  const isLuxury = luxuryMakes.some(m => make.toLowerCase().includes(m.toLowerCase()));
  const isTruck = truckModels.some(m => model.toLowerCase().includes(m.toLowerCase())) || bodyStyle === "Truck";
  const isSUV = bodyStyle === "SUV" || model.toLowerCase().includes("suv");

  if (isLuxury && isSUV) return 58000;
  if (isLuxury) return 48000;
  if (isTruck) return 45000;
  if (isSUV) return 36000;
  return 30000;
}

// ─── Convex <-> Local Field Mapping ──────────────────────────────────
export function mapConvexVehicleToLocal(cv: any): Vehicle {
  return {
    id: cv._id,
    year: cv.year,
    make: cv.make,
    model: cv.model,
    trim: cv.trim || "",
    vin: cv.vin || "",
    miles: cv.miles,
    purchase_price: cv.purchasePrice,
    mechanical_condition: cv.mechanicalCondition as MechCondition,
    appearance: cv.appearance as MechCondition,
    exterior_color: cv.exteriorColor || "",
    interior_color: cv.interiorColor || "",
    status: cv.status as VehicleStatus,
    stock_number: cv.stockNumber || "",
    purchase_location: cv.purchaseLocation || "",
    payment_method: (cv.paymentMethod as PaymentMethod) || "Cash",
    title_type: (cv.titleType as TitleType) || "Clean",
    primary_damage: (cv.primaryDamage as DamageType) || "NONE",
    secondary_damage: (cv.secondaryDamage as DamageType) || "NONE",
    drivability: (cv.drivability as Drivability) || "Runs and Drives",
    date_purchased: cv.datePurchased || "",
    seller_name: cv.sellerName || "",
    seller_phone: cv.sellerPhone || "",
    seller_email: cv.sellerEmail || "",
    seller_location: cv.sellerLocation || "",
    seller_description: cv.sellerDescription || "",
    buyer_name: cv.buyerName || "",
    sale_price: cv.salePrice || 0,
    sale_date: cv.saleDate || "",
    commission: cv.commission || 0,
    notes: cv.notes || "",
    created_at: new Date(cv._creationTime).toISOString(),
  };
}

export function mapLocalVehicleToConvex(v: Partial<Vehicle>): Record<string, any> {
  const map: Record<string, any> = {};
  if (v.year !== undefined) map.year = v.year;
  if (v.make !== undefined) map.make = v.make;
  if (v.model !== undefined) map.model = v.model;
  if (v.trim !== undefined) map.trim = v.trim || undefined;
  if (v.vin !== undefined) map.vin = v.vin || undefined;
  if (v.miles !== undefined) map.miles = v.miles;
  if (v.purchase_price !== undefined) map.purchasePrice = v.purchase_price;
  if (v.mechanical_condition !== undefined) map.mechanicalCondition = v.mechanical_condition;
  if (v.appearance !== undefined) map.appearance = v.appearance;
  if (v.exterior_color !== undefined) map.exteriorColor = v.exterior_color || undefined;
  if (v.interior_color !== undefined) map.interiorColor = v.interior_color || undefined;
  if (v.status !== undefined) map.status = v.status;
  if (v.stock_number !== undefined) map.stockNumber = v.stock_number || undefined;
  if (v.purchase_location !== undefined) map.purchaseLocation = v.purchase_location || undefined;
  if (v.payment_method !== undefined) map.paymentMethod = v.payment_method || undefined;
  if (v.title_type !== undefined) map.titleType = v.title_type || undefined;
  if (v.primary_damage !== undefined) map.primaryDamage = v.primary_damage || undefined;
  if (v.secondary_damage !== undefined) map.secondaryDamage = v.secondary_damage || undefined;
  if (v.drivability !== undefined) map.drivability = v.drivability || undefined;
  if (v.date_purchased !== undefined) map.datePurchased = v.date_purchased || undefined;
  if (v.seller_name !== undefined) map.sellerName = v.seller_name || undefined;
  if (v.seller_phone !== undefined) map.sellerPhone = v.seller_phone || undefined;
  if (v.seller_email !== undefined) map.sellerEmail = v.seller_email || undefined;
  if (v.seller_location !== undefined) map.sellerLocation = v.seller_location || undefined;
  if (v.seller_description !== undefined) map.sellerDescription = v.seller_description || undefined;
  if (v.buyer_name !== undefined) map.buyerName = v.buyer_name || undefined;
  if (v.sale_price !== undefined) map.salePrice = v.sale_price || undefined;
  if (v.sale_date !== undefined) map.saleDate = v.sale_date || undefined;
  if (v.commission !== undefined) map.commission = v.commission || undefined;
  if (v.notes !== undefined) map.notes = v.notes || undefined;
  return map;
}

export function mapConvexExpenseToLocal(ce: any): Expense {
  return {
    id: ce._id,
    vehicle_id: ce.vehicleId,
    date: ce.date,
    type: ce.expenseType as ExpenseCategory,
    description: ce.description,
    amount: ce.amount,
    is_income: ce.isIncome,
    created_at: new Date(ce._creationTime).toISOString(),
  };
}

export function mapConvexAppraisalToLocal(ca: any): Appraisal {
  return {
    id: ca._id,
    vehicle_id: ca.vehicleId || "",
    year: ca.year,
    make: ca.make,
    model: ca.model,
    trim: ca.trim || "",
    miles: ca.miles,
    mechanical_condition: ca.mechanicalCondition as MechCondition,
    appearance: ca.appearance as MechCondition,
    retail: ca.retail,
    trade_in: ca.tradeIn,
    private_party: ca.privateParty,
    auction: ca.auction,
    wholesale: ca.wholesale,
    source: "local",
    created_at: new Date(ca._creationTime).toISOString(),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────
export function uid(): string {
  return crypto.randomUUID();
}

export function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtK(n: number): string {
  if (n >= 1000) {
    return "$" + (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return fmtCurrency(n);
}

export function fmtDate(d: string): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function vehicleLabel(v: { year: string; make: string; model: string; trim?: string }): string {
  return `${v.year} ${v.make} ${v.model}${v.trim ? " " + v.trim : ""}`;
}

export function getDaysInInventory(createdAt: string, soldDate?: string): number {
  const start = new Date(createdAt);
  const end = soldDate ? new Date(soldDate) : new Date();
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function getDaysColor(days: number): string {
  if (days <= 60) return "text-emerald-400";
  if (days <= 120) return "text-yellow-400";
  if (days <= 180) return "text-red-400";
  return "text-purple-400";
}

export function getDaysBgColor(days: number): string {
  if (days <= 60) return "bg-emerald-500/20 text-emerald-400";
  if (days <= 120) return "bg-yellow-500/20 text-yellow-400";
  if (days <= 180) return "bg-red-500/20 text-red-400";
  return "bg-purple-500/20 text-purple-400";
}

export function getVehicleCosts(expenses: Expense[], vehicleId: string): number {
  return expenses
    .filter((e) => e.vehicle_id === vehicleId && !e.is_income)
    .reduce((s, e) => s + e.amount, 0);
}

export function getVehicleIncome(expenses: Expense[], vehicleId: string): number {
  return expenses
    .filter((e) => e.vehicle_id === vehicleId && e.is_income)
    .reduce((s, e) => s + e.amount, 0);
}

export function getVehicleProfit(expenses: Expense[], vehicleId: string): number {
  return getVehicleIncome(expenses, vehicleId) - getVehicleCosts(expenses, vehicleId);
}

// ─── Offer Rating based on appraisal ─────────────────────────────────
export function rateOffer(offerAmount: number, wholesaleValue: number, retailValue: number): { rating: "excellent" | "good" | "fair" | "low"; label: string; color: string } {
  if (wholesaleValue <= 0 || retailValue <= 0) return { rating: "fair", label: "No appraisal data", color: "text-gray-400" };
  const midpoint = (wholesaleValue + retailValue) / 2;
  const pct = (offerAmount / midpoint) * 100;
  if (pct >= 95) return { rating: "excellent", label: `${Math.round(pct)}% of market - Excellent offer`, color: "text-emerald-400" };
  if (pct >= 80) return { rating: "good", label: `${Math.round(pct)}% of market - Good offer`, color: "text-blue-400" };
  if (pct >= 65) return { rating: "fair", label: `${Math.round(pct)}% of market - Fair offer`, color: "text-yellow-400" };
  return { rating: "low", label: `${Math.round(pct)}% of market - Below market`, color: "text-red-400" };
}

// ─── Default Categories ──────────────────────────────────────────────
export const DEFAULT_CATEGORIES: VehicleCategory[] = [
  { id: "cat-local", name: "Local Purchases", color: "#3dd45c" },
  { id: "cat-auction", name: "Auction Purchases", color: "#f59e0b" },
  { id: "cat-online", name: "Online Purchases", color: "#3b82f6" },
  { id: "cat-trade", name: "Trade-Ins", color: "#a855f7" },
];

const CATEGORY_COLORS = ["#3dd45c", "#f59e0b", "#3b82f6", "#a855f7", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

// ─── Vehicle image helper (picsum.photos - reliable, deterministic) ──
const VEHICLE_IMAGE_IDS: number[] = [
  111, 116, 133, 137, 146, 171, 183, 195, 205, 210,
  214, 222, 237, 244, 250, 252, 256, 260, 274, 281,
  287, 292, 299, 301, 306, 311, 319, 325, 338, 341,
  349, 355, 360, 366, 373, 380, 386, 392, 399, 403,
  410, 416, 421, 429, 433, 440, 447, 453, 460, 466,
  473, 480, 486, 493, 499,
];

function carImg(idx: number): string {
  const id = VEHICLE_IMAGE_IDS[idx % VEHICLE_IMAGE_IDS.length];
  return `https://picsum.photos/id/${id}/640/400`;
}

function carImgSet(idx: number): string[] {
  return [
    carImg(idx),
    carImg(idx + 17),
    carImg(idx + 34),
  ];
}

// ─── Mock Data ───────────────────────────────────────────────────────
const now = new Date().toISOString();

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "v1", year: "2020", make: "Honda", model: "Civic", trim: "EX 4dr Sedan",
    vin: "2HGFC2F53LH012345", miles: 85000, purchase_price: 12500,
    mechanical_condition: "Good", appearance: "Fair", exterior_color: "Black", interior_color: "Gray",
    status: "Active", stock_number: "INV-001", purchase_location: "Dallas, TX",
    payment_method: "Cash", title_type: "Clean",
    primary_damage: "MINOR DENT/SCRATCHES", secondary_damage: "NONE", drivability: "Runs and Drives",
    date_purchased: "2024-11-20",
    seller_name: "John Martinez", seller_phone: "555-0142", seller_email: "john.m@email.com",
    seller_location: "Dallas, TX", seller_description: "One owner, clean title, minor cosmetic wear on bumper.",
    buyer_name: "", sale_price: 0, sale_date: "", commission: 0,
    notes: "Needs new brake pads and detail before listing.", created_at: "2024-11-20T10:00:00Z",
    categoryId: "cat-local",
  },
  {
    id: "v2", year: "2018", make: "Toyota", model: "Camry", trim: "SE",
    vin: "4T1B11HK5JU123456", miles: 102000, purchase_price: 9800,
    mechanical_condition: "Good", appearance: "Good", exterior_color: "Silver", interior_color: "Black",
    status: "Sold", stock_number: "INV-002", purchase_location: "Austin, TX",
    payment_method: "Card", title_type: "Clean",
    primary_damage: "NORMAL WEAR", secondary_damage: "NONE", drivability: "Runs and Drives",
    date_purchased: "2024-10-05",
    seller_name: "Sarah Chen", seller_phone: "555-0198", seller_email: "schen@email.com",
    seller_location: "Austin, TX", seller_description: "Well maintained, all service records available.",
    buyer_name: "Mike Thompson", sale_price: 14200, sale_date: "2024-12-15", commission: 0,
    notes: "Quick flip. Buyer found through Facebook Marketplace.", created_at: "2024-10-05T14:30:00Z",
    categoryId: "cat-online",
  },
  {
    id: "v3", year: "2019", make: "Ford", model: "F-150", trim: "XLT SuperCrew",
    vin: "1FTEW1EP0KFA12345", miles: 78000, purchase_price: 22000,
    mechanical_condition: "Excellent", appearance: "Good", exterior_color: "White", interior_color: "Gray",
    status: "Active", stock_number: "INV-003", purchase_location: "Houston, TX",
    payment_method: "Credit-line", title_type: "Clean",
    primary_damage: "NONE", secondary_damage: "NONE", drivability: "Runs and Drives",
    date_purchased: "2024-12-01",
    seller_name: "Robert Davis", seller_phone: "555-0267", seller_email: "rdavis@email.com",
    seller_location: "Houston, TX", seller_description: "Fleet vehicle, well maintained, new tires.",
    buyer_name: "", sale_price: 0, sale_date: "", commission: 0,
    notes: "High demand truck. Should sell quickly at $28k.", created_at: "2024-12-01T09:15:00Z",
    categoryId: "cat-auction",
  },
  {
    id: "v4", year: "2021", make: "Chevrolet", model: "Malibu", trim: "LT",
    vin: "1G1ZD5ST8MF123456", miles: 45000, purchase_price: 15500,
    mechanical_condition: "Excellent", appearance: "Excellent", exterior_color: "Blue", interior_color: "Black",
    status: "Prospect", stock_number: "INV-004", purchase_location: "San Antonio, TX",
    payment_method: "Cash", title_type: "Clean",
    primary_damage: "NONE", secondary_damage: "NONE", drivability: "Runs and Drives",
    date_purchased: "",
    seller_name: "Lisa Wong", seller_phone: "555-0334", seller_email: "lwong@email.com",
    seller_location: "San Antonio, TX", seller_description: "Moving overseas, need to sell ASAP. Clean title.",
    buyer_name: "", sale_price: 0, sale_date: "", commission: 0,
    notes: "Great deal - motivated seller. Inspect this weekend.", created_at: now,
    categoryId: "cat-local",
  },
  {
    id: "v5", year: "2017", make: "BMW", model: "3 Series", trim: "330i",
    vin: "WBA8B9G50HNU12345", miles: 92000, purchase_price: 14000,
    mechanical_condition: "Fair", appearance: "Good", exterior_color: "Gray", interior_color: "Tan",
    status: "Prospect", stock_number: "INV-005", purchase_location: "Fort Worth, TX",
    payment_method: "Other", title_type: "Salvage",
    primary_damage: "MECHANICAL", secondary_damage: "MINOR DENT/SCRATCHES", drivability: "Starts",
    date_purchased: "",
    seller_name: "James Park", seller_phone: "555-0401", seller_email: "jpark@email.com",
    seller_location: "Fort Worth, TX", seller_description: "Needs AC compressor. Otherwise runs great.",
    buyer_name: "", sale_price: 0, sale_date: "", commission: 0,
    notes: "AC repair ~$800. Could flip for $18-19k after fix.", created_at: now,
  },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: "e1", vehicle_id: "v1", date: "2024-11-20", type: "Vehicle Purchase", description: "Purchase from seller", amount: 12500, is_income: false, created_at: "2024-11-20T10:00:00Z" },
  { id: "e2", vehicle_id: "v1", date: "2024-11-25", type: "Repair", description: "Brake pads + rotors", amount: 450, is_income: false, created_at: "2024-11-25T14:00:00Z" },
  { id: "e3", vehicle_id: "v1", date: "2024-11-28", type: "Cleaning/Detail", description: "Full interior/exterior detail", amount: 250, is_income: false, created_at: "2024-11-28T09:00:00Z" },
  { id: "e4", vehicle_id: "v1", date: "2024-12-01", type: "License/Title", description: "Title transfer + temp tags", amount: 185, is_income: false, created_at: "2024-12-01T11:00:00Z" },
  { id: "e5", vehicle_id: "v2", date: "2024-10-05", type: "Vehicle Purchase", description: "Purchase from seller", amount: 9800, is_income: false, created_at: "2024-10-05T14:30:00Z" },
  { id: "e6", vehicle_id: "v2", date: "2024-10-10", type: "Cleaning/Detail", description: "Quick detail", amount: 150, is_income: false, created_at: "2024-10-10T10:00:00Z" },
  { id: "e7", vehicle_id: "v2", date: "2024-10-12", type: "License/Title", description: "Title + registration", amount: 175, is_income: false, created_at: "2024-10-12T09:00:00Z" },
  { id: "e8", vehicle_id: "v2", date: "2024-10-15", type: "Advertising", description: "Facebook Marketplace boost", amount: 25, is_income: false, created_at: "2024-10-15T08:00:00Z" },
  { id: "e9", vehicle_id: "v2", date: "2024-12-15", type: "Vehicle Sale", description: "Sold to Mike Thompson", amount: 14200, is_income: true, created_at: "2024-12-15T16:00:00Z" },
  { id: "e10", vehicle_id: "v3", date: "2024-12-01", type: "Vehicle Purchase", description: "Purchase from fleet sale", amount: 22000, is_income: false, created_at: "2024-12-01T09:15:00Z" },
  { id: "e11", vehicle_id: "v3", date: "2024-12-05", type: "Repair", description: "Oil change + fluid top-off", amount: 120, is_income: false, created_at: "2024-12-05T10:00:00Z" },
  { id: "e12", vehicle_id: "v3", date: "2024-12-08", type: "Cleaning/Detail", description: "Full detail + engine bay", amount: 350, is_income: false, created_at: "2024-12-08T14:00:00Z" },
  { id: "e13", vehicle_id: "v3", date: "2024-12-10", type: "Parts", description: "New floor mats + bed liner", amount: 280, is_income: false, created_at: "2024-12-10T11:00:00Z" },
  { id: "e14", vehicle_id: "v3", date: "2024-12-12", type: "License/Title", description: "Title transfer", amount: 195, is_income: false, created_at: "2024-12-12T09:00:00Z" },
];

export const MOCK_APPRAISALS: Appraisal[] = [
  {
    id: "a1", vehicle_id: "v1", year: "2020", make: "Honda", model: "Civic", trim: "EX 4dr Sedan",
    miles: 85000, mechanical_condition: "Good", appearance: "Fair",
    retail: 18200, trade_in: 14100, private_party: 16300, auction: 13200, wholesale: 12100,
    source: "local", created_at: "2024-11-22T10:30:00Z",
  },
  {
    id: "a2", vehicle_id: "v2", year: "2018", make: "Toyota", model: "Camry", trim: "SE",
    miles: 102000, mechanical_condition: "Good", appearance: "Good",
    retail: 16800, trade_in: 13500, private_party: 15200, auction: 12400, wholesale: 11200,
    source: "local", created_at: "2024-10-06T09:00:00Z",
  },
  {
    id: "a3", vehicle_id: "v3", year: "2019", make: "Ford", model: "F-150", trim: "XLT SuperCrew",
    miles: 78000, mechanical_condition: "Excellent", appearance: "Good",
    retail: 32500, trade_in: 27800, private_party: 30100, auction: 25600, wholesale: 24200,
    source: "local", created_at: "2024-12-02T14:00:00Z",
  },
];

// ─── 55 Mock Marketplace Listings with reliable images ──────────────
function ml(id: number, year: string, make: string, model: string, trim: string, miles: number, price: number, location: string, color: string, days: number, seller: string, desc: string, opts: Partial<MarketplaceListing> = {}): MarketplaceListing {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return {
    id: `ml${id}`,
    year, make, model, trim, miles, price, location,
    exteriorColor: color,
    imageUrl: carImg(id),
    imageUrls: carImgSet(id),
    daysListed: days,
    source: "marketplace",
    sellerName: seller,
    description: desc,
    postedAt: d.toISOString(),
    drivetrain: opts.drivetrain || "FWD",
    fuelType: opts.fuelType || "Gasoline",
    engine: opts.engine || "2.0L I4",
    bodyStyle: opts.bodyStyle || "Sedan",
    transmission: opts.transmission || "Automatic",
    titleType: opts.titleType || "Clean",
    features: opts.features || ["Backup Camera", "Bluetooth"],
    contactPreference: opts.contactPreference || "any",
    sellerPhone: opts.sellerPhone,
    sellerEmail: opts.sellerEmail,
    sourceUrl: opts.sourceUrl,
    interiorColor: opts.interiorColor || "Black",
    vin: opts.vin,
  };
}

export const MOCK_MARKETPLACE: MarketplaceListing[] = [
  ml(1, "2019", "Honda", "Accord", "Sport", 67000, 18500, "Dallas, TX", "White", 3, "AutoMax Dallas", "One owner, clean CARFAX, sport package with leather seats and sunroof.", { engine: "2.0L Turbo I4", features: ["Leather Seats", "Sunroof", "Apple CarPlay", "Lane Keep Assist", "Adaptive Cruise"], sellerEmail: "sales@automaxdallas.com", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example1" }),
  ml(2, "2020", "Toyota", "RAV4", "XLE", 42000, 24900, "Houston, TX", "Blue", 7, "Gulf Coast Motors", "Low miles, all-wheel drive, backup camera, lane departure warning.", { drivetrain: "AWD", engine: "2.5L I4", bodyStyle: "SUV", features: ["AWD", "Backup Camera", "Lane Departure Warning", "Blind Spot Monitor", "Heated Seats"], sellerPhone: "713-555-0188", sourceUrl: "https://www.cargurus.com/Cars/inventorylisting/example2" }),
  ml(3, "2018", "Ford", "Mustang", "EcoBoost Premium", 55000, 21000, "Phoenix, AZ", "Red", 12, "Private Seller - Mark R.", "Premium package, leather, navigation, performance exhaust. Clean title.", { drivetrain: "RWD", engine: "2.3L Turbo I4", bodyStyle: "Coupe", transmission: "Manual", features: ["Leather Seats", "Navigation", "Performance Exhaust", "SYNC 3", "Premium Audio"], sellerPhone: "602-555-0199" }),
  ml(4, "2021", "Chevrolet", "Equinox", "LT", 31000, 19800, "San Antonio, TX", "Gray", 5, "Alamo Auto Group", "Certified pre-owned, remaining factory warranty, heated seats.", { engine: "1.5L Turbo I4", bodyStyle: "SUV", features: ["Heated Seats", "Remote Start", "Apple CarPlay", "Android Auto", "Factory Warranty"], sellerEmail: "sales@alamoauto.com", sourceUrl: "https://www.cars.com/vehicledetail/example4" }),
  ml(5, "2017", "BMW", "X3", "xDrive28i", 89000, 16500, "Atlanta, GA", "Black", 18, "Private Seller - Amy L.", "Well maintained, all service records, panoramic sunroof, navigation.", { drivetrain: "AWD", engine: "2.0L Turbo I4", bodyStyle: "SUV", features: ["Panoramic Sunroof", "Navigation", "Leather Seats", "Heated Seats", "Parking Sensors"], sellerPhone: "404-555-0342" }),
  ml(6, "2020", "Nissan", "Altima", "2.5 SV", 48000, 17200, "Chicago, IL", "Silver", 9, "Windy City Auto Sales", "ProPILOT Assist, blind spot warning, remote start. Great commuter car.", { engine: "2.5L I4", features: ["ProPILOT Assist", "Blind Spot Warning", "Remote Start", "Apple CarPlay", "Heated Seats"], sellerEmail: "info@windycityauto.com", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example6" }),
  ml(7, "2019", "Jeep", "Grand Cherokee", "Limited", 62000, 26500, "Denver, CO", "White", 2, "Mile High Motors", "4x4, leather, heated/cooled seats, tow package, clean title.", { drivetrain: "4WD", engine: "3.6L V6", bodyStyle: "SUV", features: ["4x4", "Leather Seats", "Heated/Cooled Seats", "Tow Package", "Uconnect"], sellerPhone: "303-555-0177", sourceUrl: "https://www.cargurus.com/Cars/inventorylisting/example7" }),
  ml(8, "2022", "Hyundai", "Tucson", "SEL", 22000, 23800, "Miami, FL", "Green", 1, "Private Seller - David K.", "Like new condition, still under factory warranty, all-wheel drive.", { drivetrain: "AWD", engine: "2.5L I4", bodyStyle: "SUV", features: ["AWD", "Factory Warranty", "Digital Key", "Blind Spot Collision Avoidance", "LED Headlights"], sellerPhone: "305-555-0221", contactPreference: "chat" }),
  ml(9, "2016", "Lexus", "IS", "200t F Sport", 78000, 19900, "Los Angeles, CA", "Gray", 14, "Prestige Auto LA", "F Sport package, Mark Levinson audio, navigation, clean CARFAX.", { drivetrain: "RWD", engine: "2.0L Turbo I4", features: ["F Sport Package", "Mark Levinson Audio", "Navigation", "Heated/Ventilated Seats", "Sunroof"], sellerEmail: "sales@prestigeautola.com", sourceUrl: "https://www.cars.com/vehicledetail/example9" }),
  ml(10, "2020", "Ram", "1500", "Big Horn", 51000, 29500, "Nashville, TN", "Black", 6, "Music City Trucks", "Crew cab, 4x4, HEMI V8, tow package, bed liner.", { drivetrain: "4WD", engine: "5.7L HEMI V8", bodyStyle: "Truck", features: ["4x4", "HEMI V8", "Tow Package", "Spray-In Bedliner", "Uconnect 5", "Apple CarPlay"], sellerPhone: "615-555-0299", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example10" }),
  ml(11, "2018", "Subaru", "Outback", "2.5i Premium", 71000, 18200, "Seattle, WA", "Blue", 10, "Private Seller - Karen W.", "EyeSight driver assist, all-wheel drive, roof rails, heated seats.", { drivetrain: "AWD", engine: "2.5L Flat-4", bodyStyle: "Wagon", features: ["EyeSight Driver Assist", "AWD", "Roof Rails", "Heated Seats", "Starlink"], sellerPhone: "206-555-0411" }),
  ml(12, "2021", "Kia", "Telluride", "S", 35000, 32000, "New York, NY", "White", 4, "Metro Auto NYC", "3-row SUV, V6, Apple CarPlay, blind spot monitoring, clean title.", { engine: "3.8L V6", bodyStyle: "SUV", features: ["3rd Row Seating", "Apple CarPlay", "Blind Spot Monitoring", "Rear Cross Traffic Alert", "Smart Cruise"], sellerEmail: "sales@metroautonyc.com", sourceUrl: "https://www.cargurus.com/Cars/inventorylisting/example12" }),
  ml(13, "2019", "Toyota", "Tacoma", "TRD Off-Road", 58000, 31200, "Austin, TX", "Gray", 3, "Lone Star Trucks", "4x4, crawl control, locking rear diff, bed rack ready.", { drivetrain: "4WD", engine: "3.5L V6", bodyStyle: "Truck", features: ["4x4", "Crawl Control", "Locking Rear Diff", "TRD Suspension", "JBL Audio"], sellerPhone: "512-555-0133", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example13" }),
  ml(14, "2020", "Mazda", "CX-5", "Grand Touring", 39000, 24500, "Portland, OR", "Red", 8, "Pacific Auto Group", "Turbo, Bose audio, heads-up display, leather interior.", { drivetrain: "AWD", engine: "2.5L Turbo I4", bodyStyle: "SUV", features: ["Turbo", "Bose Audio", "Heads-Up Display", "Leather Interior", "360 Camera"], sellerEmail: "sales@pacificauto.com", sourceUrl: "https://www.cars.com/vehicledetail/example14" }),
  ml(15, "2017", "Audi", "A4", "2.0T Premium Plus", 72000, 19800, "Minneapolis, MN", "White", 15, "Private Seller - Tom H.", "Quattro AWD, virtual cockpit, B&O sound, well maintained.", { drivetrain: "AWD", engine: "2.0L Turbo I4", features: ["Quattro AWD", "Virtual Cockpit", "B&O Sound", "Navigation", "Heated Seats"], sellerPhone: "612-555-0288" }),
  ml(16, "2021", "Honda", "CR-V", "EX-L", 28000, 27900, "Charlotte, NC", "Black", 2, "Queen City Honda", "Low miles, leather, sunroof, Honda Sensing suite.", { drivetrain: "AWD", engine: "1.5L Turbo I4", bodyStyle: "SUV", features: ["Leather Seats", "Sunroof", "Honda Sensing", "Apple CarPlay", "Wireless Charging"], sellerEmail: "sales@queencityhonda.com", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example16" }),
  ml(17, "2018", "Tesla", "Model 3", "Long Range", 65000, 24500, "San Francisco, CA", "White", 11, "EV Auto Bay Area", "Autopilot, premium interior, long range battery, supercharger access.", { drivetrain: "AWD", fuelType: "Electric", engine: "Dual Motor Electric", features: ["Autopilot", "Premium Interior", "Glass Roof", "Supercharger Access", "OTA Updates"], sellerEmail: "info@evautobay.com", sourceUrl: "https://www.cargurus.com/Cars/inventorylisting/example17" }),
  ml(18, "2019", "Dodge", "Challenger", "R/T", 41000, 28900, "Las Vegas, NV", "Red", 6, "Desert Auto Sales", "5.7L HEMI, 6-speed manual, Brembo brakes, clean title.", { drivetrain: "RWD", engine: "5.7L HEMI V8", bodyStyle: "Coupe", transmission: "Manual", features: ["HEMI V8", "6-Speed Manual", "Brembo Brakes", "Uconnect", "Performance Exhaust"], sellerPhone: "702-555-0344" }),
  ml(19, "2020", "Volkswagen", "Jetta", "SEL", 37000, 18900, "Philadelphia, PA", "Gray", 9, "Liberty Auto Philly", "Turbo, digital cockpit, Beats audio, sunroof.", { engine: "1.4L Turbo I4", features: ["Digital Cockpit", "Beats Audio", "Sunroof", "Blind Spot Monitor", "Adaptive Cruise"], sellerEmail: "sales@libertyautophilly.com", sourceUrl: "https://www.cars.com/vehicledetail/example19" }),
  ml(20, "2022", "Toyota", "Corolla", "SE", 18000, 21500, "Orlando, FL", "Blue", 1, "Sunshine Toyota", "Nearly new, Toyota Safety Sense, dynamic shift CVT.", { engine: "2.0L I4", features: ["Toyota Safety Sense", "Apple CarPlay", "Android Auto", "LED Headlights", "Dual Zone Climate"], sellerPhone: "407-555-0199", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example20" }),
  ml(21, "2017", "Ford", "Explorer", "XLT", 88000, 18900, "Indianapolis, IN", "Silver", 20, "Crossroads Auto", "3rd row, 4WD, SYNC 3, tow package, roof rails.", { drivetrain: "4WD", engine: "3.5L V6", bodyStyle: "SUV", features: ["3rd Row", "4WD", "SYNC 3", "Tow Package", "Roof Rails"], sellerEmail: "info@crossroadsauto.com", sourceUrl: "https://www.cargurus.com/Cars/inventorylisting/example21" }),
  ml(22, "2021", "Chevrolet", "Silverado 1500", "LT Trail Boss", 34000, 38500, "Fort Worth, TX", "Black", 4, "Texas Truck Depot", "Z71, 4x4, 5.3L V8, trailering package, spray-in liner.", { drivetrain: "4WD", engine: "5.3L V8", bodyStyle: "Truck", features: ["Z71 Package", "4x4", "Trailering Package", "Spray-In Liner", "Apple CarPlay"], sellerPhone: "817-555-0422", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example22" }),
  ml(23, "2019", "Mercedes-Benz", "C-Class", "C300", 52000, 27800, "Scottsdale, AZ", "White", 7, "Luxury Auto Scottsdale", "AMG Line, panoramic roof, Burmester audio, MBUX.", { drivetrain: "RWD", engine: "2.0L Turbo I4", features: ["AMG Line", "Panoramic Roof", "Burmester Audio", "MBUX", "Heated Seats"], sellerEmail: "sales@luxuryautoscottsdale.com", sourceUrl: "https://www.cars.com/vehicledetail/example23" }),
  ml(24, "2020", "GMC", "Sierra 1500", "SLE", 47000, 33200, "Oklahoma City, OK", "White", 5, "Heartland Trucks", "Crew cab, 4WD, 5.3L V8, X31 off-road, ProGrade trailering.", { drivetrain: "4WD", engine: "5.3L V8", bodyStyle: "Truck", features: ["4WD", "X31 Off-Road", "ProGrade Trailering", "Apple CarPlay", "Spray-In Liner"], sellerPhone: "405-555-0311" }),
  ml(25, "2018", "Honda", "Pilot", "EX-L", 69000, 24200, "Raleigh, NC", "Silver", 13, "Triangle Auto Sales", "3rd row, AWD, leather, Honda Sensing, power liftgate.", { drivetrain: "AWD", engine: "3.5L V6", bodyStyle: "SUV", features: ["3rd Row", "AWD", "Leather Seats", "Honda Sensing", "Power Liftgate"], sellerEmail: "info@triangleauto.com", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example25" }),
  ml(26, "2021", "Hyundai", "Sonata", "SEL Plus", 25000, 22100, "Columbus, OH", "Blue", 3, "Buckeye Auto Mall", "Panoramic sunroof, Bose audio, highway driving assist.", { engine: "2.5L I4", features: ["Panoramic Sunroof", "Bose Audio", "Highway Driving Assist", "Wireless Charging", "LED Headlights"], sellerPhone: "614-555-0188", sourceUrl: "https://www.cargurus.com/Cars/inventorylisting/example26" }),
  ml(27, "2016", "Porsche", "Cayenne", "Base", 82000, 29900, "Boca Raton, FL", "Black", 22, "Palm Beach Exotics", "V6, panoramic roof, BOSE, sport chrono, clean CARFAX.", { drivetrain: "AWD", engine: "3.6L V6", bodyStyle: "SUV", features: ["Panoramic Roof", "BOSE Audio", "Sport Chrono", "Navigation", "Heated Seats"], sellerEmail: "sales@pbexotics.com", sourceUrl: "https://www.cars.com/vehicledetail/example27" }),
  ml(28, "2020", "Kia", "Sportage", "LX", 44000, 18500, "Kansas City, MO", "Gray", 8, "Midwest Kia", "Apple CarPlay, backup camera, lane keep assist, clean title.", { drivetrain: "FWD", engine: "2.4L I4", bodyStyle: "SUV", features: ["Apple CarPlay", "Backup Camera", "Lane Keep Assist", "Forward Collision Warning", "Bluetooth"], sellerPhone: "816-555-0277", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example28" }),
  ml(29, "2019", "Acura", "TLX", "A-Spec", 51000, 25500, "Baltimore, MD", "Red", 11, "Private Seller - Jason M.", "A-Spec package, SH-AWD, ELS audio, navigation.", { drivetrain: "AWD", engine: "3.5L V6", features: ["A-Spec Package", "SH-AWD", "ELS Audio", "Navigation", "Heated Seats"], sellerPhone: "410-555-0399" }),
  ml(30, "2022", "Ford", "Bronco Sport", "Big Bend", 19000, 27500, "Knoxville, TN", "Green", 2, "Smoky Mountain Ford", "4x4, SYNC 3, Co-Pilot360, rubberized floors.", { drivetrain: "4WD", engine: "1.5L Turbo I3", bodyStyle: "SUV", features: ["4x4", "SYNC 3", "Co-Pilot360", "Rubberized Floors", "Roof Rails"], sellerEmail: "sales@smokymtnford.com", sourceUrl: "https://www.cargurus.com/Cars/inventorylisting/example30" }),
  ml(31, "2017", "Toyota", "Highlander", "XLE", 76000, 23800, "Sacramento, CA", "White", 16, "Capital Auto Group", "3rd row, AWD, leather, JBL audio, Toyota Safety Sense.", { drivetrain: "AWD", engine: "3.5L V6", bodyStyle: "SUV", features: ["3rd Row", "AWD", "Leather Seats", "JBL Audio", "Toyota Safety Sense"], sellerPhone: "916-555-0144", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example31" }),
  ml(32, "2020", "Nissan", "Rogue", "SV", 38000, 21200, "Tampa, FL", "Silver", 6, "Bay Area Nissan", "ProPILOT Assist, panoramic moonroof, heated seats.", { drivetrain: "AWD", engine: "2.5L I4", bodyStyle: "SUV", features: ["ProPILOT Assist", "Panoramic Moonroof", "Heated Seats", "Apple CarPlay", "Remote Start"], sellerEmail: "sales@bayareanissan.com", sourceUrl: "https://www.cars.com/vehicledetail/example32" }),
  ml(33, "2021", "Mazda", "3", "Preferred", 27000, 21800, "Pittsburgh, PA", "Red", 4, "Steel City Mazda", "Skyactiv-G, Bose audio, leather, heads-up display.", { engine: "2.5L I4", features: ["Bose Audio", "Leather Seats", "Heads-Up Display", "Adaptive Cruise", "Blind Spot Monitor"], sellerPhone: "412-555-0233" }),
  ml(34, "2018", "Chevrolet", "Colorado", "Z71", 63000, 25900, "Albuquerque, NM", "Black", 10, "Desert Trucks NM", "4WD, V6, Z71 off-road, trailering package, spray-in liner.", { drivetrain: "4WD", engine: "3.6L V6", bodyStyle: "Truck", features: ["4WD", "Z71 Off-Road", "Trailering Package", "Spray-In Liner", "Apple CarPlay"], sellerEmail: "info@deserttrucksnm.com", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example34" }),
  ml(35, "2019", "Infiniti", "Q50", "3.0t Luxe", 55000, 23500, "Detroit, MI", "Gray", 14, "Motor City Luxury", "Twin-turbo V6, AWD, leather, InTouch dual screen.", { drivetrain: "AWD", engine: "3.0L Twin-Turbo V6", features: ["Twin-Turbo V6", "AWD", "Leather Seats", "InTouch Dual Screen", "Around View Monitor"], sellerPhone: "313-555-0411", sourceUrl: "https://www.cargurus.com/Cars/inventorylisting/example35" }),
  ml(36, "2020", "Honda", "Accord", "Touring", 33000, 26800, "San Diego, CA", "Black", 3, "SoCal Honda", "2.0T, 10-speed auto, wireless CarPlay, heads-up display.", { engine: "2.0L Turbo I4", features: ["2.0T Engine", "10-Speed Auto", "Wireless CarPlay", "Heads-Up Display", "Heated/Ventilated Seats"], sellerEmail: "sales@socalhonda.com", sourceUrl: "https://www.cars.com/vehicledetail/example36" }),
  ml(37, "2022", "Toyota", "Camry", "TRD", 15000, 29500, "Memphis, TN", "Red", 1, "Bluff City Toyota", "TRD tuned suspension, cat-back exhaust, sport seats.", { engine: "3.5L V6", features: ["TRD Suspension", "Cat-Back Exhaust", "Sport Seats", "Apple CarPlay", "Toyota Safety Sense"], sellerPhone: "901-555-0188", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example37" }),
  ml(38, "2017", "Volvo", "XC60", "T5 Inscription", 74000, 20500, "Boston, MA", "White", 19, "Private Seller - Sarah B.", "Inscription trim, panoramic roof, Harman Kardon, pilot assist.", { drivetrain: "AWD", engine: "2.0L Turbo I4", bodyStyle: "SUV", features: ["Inscription Trim", "Panoramic Roof", "Harman Kardon", "Pilot Assist", "Heated Seats"], sellerPhone: "617-555-0322" }),
  ml(39, "2021", "Ford", "F-150", "Lariat", 29000, 42500, "Tulsa, OK", "Blue", 5, "Green Country Ford", "3.5L EcoBoost, 4x4, leather, 360 camera, Pro Power Onboard.", { drivetrain: "4WD", engine: "3.5L EcoBoost V6", bodyStyle: "Truck", features: ["EcoBoost", "4x4", "Leather Seats", "360 Camera", "Pro Power Onboard", "SYNC 4"], sellerEmail: "sales@greencountryford.com", sourceUrl: "https://www.cargurus.com/Cars/inventorylisting/example39" }),
  ml(40, "2019", "Cadillac", "XT5", "Luxury", 48000, 26900, "St. Louis, MO", "Silver", 7, "Gateway Cadillac", "Luxury trim, leather, Bose, driver awareness package.", { drivetrain: "FWD", engine: "3.6L V6", bodyStyle: "SUV", features: ["Luxury Trim", "Leather Seats", "Bose Audio", "Driver Awareness Package", "Wireless Charging"], sellerPhone: "314-555-0199", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example40" }),
  ml(41, "2020", "Subaru", "Forester", "Sport", 36000, 25200, "Burlington, VT", "Green", 4, "Green Mountain Subaru", "Sport trim, AWD, EyeSight, X-Mode, panoramic roof.", { drivetrain: "AWD", engine: "2.5L Flat-4", bodyStyle: "SUV", features: ["Sport Trim", "AWD", "EyeSight", "X-Mode", "Panoramic Roof"], sellerEmail: "sales@greenmtnsubaru.com" }),
  ml(42, "2018", "Genesis", "G80", "3.3T Sport", 59000, 22800, "Richmond, VA", "Black", 12, "Private Seller - Chris D.", "Twin-turbo V6, sport suspension, Lexicon audio, HUD.", { drivetrain: "RWD", engine: "3.3L Twin-Turbo V6", features: ["Twin-Turbo V6", "Sport Suspension", "Lexicon Audio", "Heads-Up Display", "Heated/Cooled Seats"], sellerPhone: "804-555-0277" }),
  ml(43, "2021", "Jeep", "Wrangler", "Sahara", 24000, 38900, "Moab, UT", "White", 2, "Red Rock Jeep", "Unlimited, 4x4, hardtop, leather, sky one-touch power top.", { drivetrain: "4WD", engine: "3.6L V6", bodyStyle: "SUV", features: ["Unlimited", "4x4", "Hardtop", "Leather Seats", "Sky One-Touch Power Top", "LED Lighting"], sellerPhone: "435-555-0188", sourceUrl: "https://www.cars.com/vehicledetail/example43" }),
  ml(44, "2019", "Buick", "Enclave", "Avenir", 52000, 28500, "Milwaukee, WI", "Gray", 9, "Lakefront Buick", "Avenir trim, 3rd row, AWD, Bose, hands-free liftgate.", { drivetrain: "AWD", engine: "3.6L V6", bodyStyle: "SUV", features: ["Avenir Trim", "3rd Row", "AWD", "Bose Audio", "Hands-Free Liftgate"], sellerEmail: "sales@lakefrontbuick.com", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example44" }),
  ml(45, "2020", "Mitsubishi", "Outlander", "SEL", 41000, 19500, "Louisville, KY", "White", 6, "Derby City Auto", "3rd row, AWD, leather, 710W Rockford Fosgate audio.", { drivetrain: "AWD", engine: "2.4L I4", bodyStyle: "SUV", features: ["3rd Row", "AWD", "Leather Seats", "Rockford Fosgate Audio", "360 Camera"], sellerPhone: "502-555-0344", sourceUrl: "https://www.cargurus.com/Cars/inventorylisting/example45" }),
  ml(46, "2022", "Hyundai", "Elantra", "N Line", 12000, 23900, "Savannah, GA", "Blue", 1, "Coastal Hyundai", "N Line sport, 1.6T, dual-clutch, sport exhaust.", { engine: "1.6L Turbo I4", transmission: "Automatic (DCT)", features: ["N Line Sport", "1.6T Engine", "Dual-Clutch Trans", "Sport Exhaust", "Bose Audio"], sellerEmail: "sales@coastalhyundai.com", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example46" }),
  ml(47, "2017", "Lincoln", "MKZ", "Reserve", 68000, 17900, "Birmingham, AL", "Black", 17, "Private Seller - Angela T.", "Reserve trim, 3.0T AWD, Revel audio, panoramic roof.", { drivetrain: "AWD", engine: "3.0L Twin-Turbo V6", features: ["Reserve Trim", "3.0T AWD", "Revel Audio", "Panoramic Roof", "Heated/Cooled Seats"], sellerPhone: "205-555-0411" }),
  ml(48, "2020", "Chrysler", "Pacifica", "Touring L", 39000, 24800, "Omaha, NE", "Silver", 8, "Heartland Chrysler", "Stow n Go, Uconnect Theater, 360 surround view.", { engine: "3.6L V6", bodyStyle: "Van", features: ["Stow n Go", "Uconnect Theater", "360 Surround View", "Apple CarPlay", "Tri-Zone Climate"], sellerEmail: "sales@heartlandchrysler.com", sourceUrl: "https://www.cars.com/vehicledetail/example48" }),
  ml(49, "2019", "Mazda", "MX-5 Miata", "Grand Touring", 32000, 26500, "Monterey, CA", "Red", 5, "Pacific Coast Mazda", "Retractable hardtop, Bose, Brembo brakes, limited slip diff.", { drivetrain: "RWD", engine: "2.0L I4", bodyStyle: "Convertible", transmission: "Manual", features: ["Retractable Hardtop", "Bose Audio", "Brembo Brakes", "Limited Slip Diff", "Bilstein Shocks"], sellerPhone: "831-555-0199" }),
  ml(50, "2021", "Toyota", "4Runner", "TRD Pro", 27000, 46500, "Boise, ID", "Green", 3, "Mountain West Toyota", "TRD Pro, 4x4, KDSS, Fox shocks, crawl control.", { drivetrain: "4WD", engine: "4.0L V6", bodyStyle: "SUV", features: ["TRD Pro", "4x4", "KDSS", "Fox Shocks", "Crawl Control", "JBL Audio"], sellerEmail: "sales@mtnwesttoyota.com", sourceUrl: "https://www.cargurus.com/Cars/inventorylisting/example50" }),
  ml(51, "2018", "Dodge", "Durango", "GT", 71000, 22500, "Tucson, AZ", "Black", 11, "Sonoran Auto Sales", "V6, AWD, leather, 3rd row, Uconnect 8.4.", { drivetrain: "AWD", engine: "3.6L V6", bodyStyle: "SUV", features: ["AWD", "Leather Seats", "3rd Row", "Uconnect 8.4", "Rear Entertainment"], sellerPhone: "520-555-0288", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example51" }),
  ml(52, "2020", "Volkswagen", "Atlas", "SE w/Tech", 35000, 27900, "Hartford, CT", "White", 4, "New England VW", "3rd row, AWD, digital cockpit, panoramic sunroof.", { drivetrain: "AWD", engine: "3.6L V6", bodyStyle: "SUV", features: ["3rd Row", "AWD", "Digital Cockpit", "Panoramic Sunroof", "Fender Audio"], sellerEmail: "sales@newenglandvw.com", sourceUrl: "https://www.cars.com/vehicledetail/example52" }),
  ml(53, "2019", "Chevrolet", "Camaro", "2SS", 38000, 32500, "Charlotte, NC", "Yellow", 7, "Speed City Motors", "6.2L V8, magnetic ride, heads-up display, Brembo brakes.", { drivetrain: "RWD", engine: "6.2L V8", bodyStyle: "Coupe", transmission: "Manual", features: ["6.2L V8", "Magnetic Ride", "Heads-Up Display", "Brembo Brakes", "Performance Exhaust"], sellerPhone: "704-555-0377" }),
  ml(54, "2022", "Kia", "EV6", "Wind", 14000, 36500, "Portland, OR", "Gray", 2, "Pacific EV Center", "Electric, 310mi range, fast charging, highway driving assist.", { drivetrain: "RWD", fuelType: "Electric", engine: "Single Motor Electric", features: ["310mi Range", "Fast Charging", "Highway Driving Assist", "Vehicle-to-Load", "Vegan Leather"], sellerEmail: "sales@pacificevcenter.com", sourceUrl: "https://www.cargurus.com/Cars/inventorylisting/example54" }),
  ml(55, "2017", "Land Rover", "Discovery Sport", "HSE", 81000, 18900, "Aspen, CO", "Blue", 21, "Mountain Luxury Auto", "HSE trim, AWD, panoramic roof, navigation, meridian audio.", { drivetrain: "AWD", engine: "2.0L Turbo I4", bodyStyle: "SUV", features: ["HSE Trim", "AWD", "Panoramic Roof", "Navigation", "Meridian Audio"], sellerPhone: "970-555-0144", sourceUrl: "https://www.autotrader.com/cars-for-sale/vehicledetails.xhtml?listingId=example55" }),
];

// ─── Store Context ───────────────────────────────────────────────────
export interface StoreState {
  vehicles: Vehicle[];
  expenses: Expense[];
  appraisals: Appraisal[];
  marketplace: MarketplaceListing[];
  offers: MarketplaceOffer[];
  categories: VehicleCategory[];
  addVehicle: (v: Omit<Vehicle, "id" | "created_at">) => string;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addExpense: (e: Omit<Expense, "id" | "created_at">) => void;
  deleteExpense: (id: string) => void;
  addAppraisal: (a: Omit<Appraisal, "id" | "created_at">) => string;
  getLatestAppraisal: (vehicleId: string) => Appraisal | null;
  addMarketplaceListing: (listing: Omit<MarketplaceListing, "id" | "postedAt">) => void;
  addOffer: (offer: Omit<MarketplaceOffer, "id" | "createdAt">) => void;
  updateOfferStatus: (id: string, status: MarketplaceOffer["status"]) => void;
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  toast: (msg: string, type?: "success" | "error") => void;
  isCloudConnected: boolean;
}

export const StoreContext = createContext<StoreState | null>(null);

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
