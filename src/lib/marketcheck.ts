// ─── MarketCheck API Integration ─────────────────────────────────────
// Fetches real vehicle listings from MarketCheck API
// Maps API data into Flipdash MarketplaceListing format
// Flipdash Value Engine runs AFTER data is received

import type { MarketplaceListing } from "./store";

// ─── API Key ─────────────────────────────────────────────────────────
const MARKETCHECK_API_KEY = "0Rr8eNu7gOu3AXm1GBJGwMEDMa9AgDiD";
const BASE_URL = "https://mc-api.marketcheck.com/v2";

export function getMarketCheckApiKey(): string {
  return MARKETCHECK_API_KEY;
}

export function hasMarketCheckApiKey(): boolean {
  return true;
}

// ─── Types ───────────────────────────────────────────────────────────

export interface MarketCheckSearchParams {
  year?: string;
  make?: string;
  model?: string;
  zip?: string;
  radius?: number;
  priceMin?: number;
  priceMax?: number;
  milesMin?: number;
  milesMax?: number;
  rows?: number;
  start?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  sellerType?: "dealer" | "private";
  bodyType?: string;
}

export interface MarketCheckListing {
  id: string | number;
  vin?: string;
  heading?: string;
  price?: number;
  miles?: number;
  msrp?: number;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  body_type?: string;
  exterior_color?: string;
  interior_color?: string;
  dom?: number;
  first_seen_at?: string;
  last_seen_at?: string;
  seller_type?: string;
  inventory_type?: string;
  source?: string;
  vdp_url?: string;
  media?: {
    photo_links?: string[];
  };
  build?: {
    engine?: string;
    transmission?: string;
    drivetrain?: string;
    fuel_type?: string;
    doors?: number;
    made_in?: string;
    city_miles?: number;
    highway_miles?: number;
  };
  dealer?: {
    id?: number;
    name?: string;
    phone?: string;
    website?: string;
    city?: string;
    state?: string;
    zip?: string;
    latitude?: number;
    longitude?: number;
  };
  extra?: {
    features?: string[];
  };
  dist?: number;
}

export interface MarketCheckResponse {
  num_found: number;
  listings: MarketCheckListing[];
}

// ─── Placeholder image for missing photos ────────────────────────────

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400' fill='%23111827'%3E%3Crect width='640' height='400' fill='%23111827'/%3E%3Ctext x='50%25' y='45%25' text-anchor='middle' fill='%234B5563' font-family='system-ui' font-size='24'%3ENo Photo%3C/text%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' fill='%234B5563' font-family='system-ui' font-size='14'%3EAvailable%3C/text%3E%3C/svg%3E";

export function getPlaceholderImage(): string {
  return PLACEHOLDER_IMG;
}

// ─── Map MarketCheck listing → Flipdash MarketplaceListing ───────────

function mapToFlipdash(mc: MarketCheckListing): MarketplaceListing {
  const photos = mc.media?.photo_links || [];
  const primaryImage = photos.length > 0 ? photos[0] : PLACEHOLDER_IMG;
  const allImages = photos.length > 0 ? photos.slice(0, 10) : [PLACEHOLDER_IMG];

  const city = mc.dealer?.city || "";
  const state = mc.dealer?.state || "";
  const location = city && state ? `${city}, ${state}` : city || state || "Unknown";

  const sellerName = mc.dealer?.name || (mc.seller_type === "private" ? "Private Seller" : "Dealer");

  let daysListed = mc.dom || 0;
  if (!daysListed && mc.first_seen_at) {
    const firstSeen = new Date(mc.first_seen_at);
    const now = new Date();
    daysListed = Math.max(0, Math.floor((now.getTime() - firstSeen.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const postedAt = mc.first_seen_at || new Date().toISOString();

  const features: string[] = [];
  if (mc.extra?.features) {
    features.push(...mc.extra.features.slice(0, 15));
  }
  if (mc.build?.drivetrain && mc.build.drivetrain !== "FWD") {
    features.push(mc.build.drivetrain);
  }

  return {
    id: String(mc.id),
    year: String(mc.year || "Unknown"),
    make: mc.make || "Unknown",
    model: mc.model || "Unknown",
    trim: mc.trim || "",
    miles: mc.miles || 0,
    price: mc.price || 0,
    location,
    exteriorColor: mc.exterior_color || "Unknown",
    imageUrl: primaryImage,
    imageUrls: allImages,
    daysListed,
    source: "marketplace",
    sourceUrl: mc.vdp_url || undefined,
    sellerName,
    sellerPhone: mc.dealer?.phone || undefined,
    sellerEmail: undefined,
    description: mc.heading || `${mc.year || ""} ${mc.make || ""} ${mc.model || ""} ${mc.trim || ""}`.trim() || "No description available",
    vin: mc.vin || undefined,
    postedAt,
    drivetrain: mc.build?.drivetrain || "Unknown",
    fuelType: mc.build?.fuel_type || "Unknown",
    engine: mc.build?.engine || "Unknown",
    bodyStyle: mc.body_type || "Unknown",
    transmission: mc.build?.transmission || "Unknown",
    titleType: "Unknown",
    features: features.length > 0 ? features : [],
    contactPreference: "any",
    interiorColor: mc.interior_color || "Unknown",
  };
}

// ─── In-memory listing cache for detail page lookups ─────────────────
// Stores listings fetched from search so detail page can use them
// without a separate API call (avoids CORS and rate limit issues)

const listingCache = new Map<string, MarketplaceListing>();

export function cacheListings(listings: MarketplaceListing[]) {
  for (const l of listings) {
    listingCache.set(l.id, l);
  }
}

export function getCachedListing(id: string): MarketplaceListing | null {
  return listingCache.get(id) || null;
}

// ─── Fetch Listings from MarketCheck ─────────────────────────────────

export async function fetchMarketCheckListings(
  params: MarketCheckSearchParams
): Promise<{ listings: MarketplaceListing[]; totalFound: number; error?: string }> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set("api_key", MARKETCHECK_API_KEY);

    if (params.year) queryParams.set("year", params.year);
    if (params.make) queryParams.set("make", params.make);
    if (params.model) queryParams.set("model", params.model);
    if (params.zip) queryParams.set("zip", params.zip);
    if (params.radius) queryParams.set("radius", String(params.radius));
    if (params.priceMin && params.priceMax) {
      queryParams.set("price_range", `${params.priceMin}-${params.priceMax}`);
    } else if (params.priceMin) {
      queryParams.set("price_range", `${params.priceMin}-`);
    } else if (params.priceMax) {
      queryParams.set("price_range", `-${params.priceMax}`);
    }
    if (params.milesMax) queryParams.set("miles_range", `-${params.milesMax}`);
    if (params.rows) queryParams.set("rows", String(Math.min(params.rows, 50)));
    if (params.start) queryParams.set("start", String(params.start));
    if (params.sellerType) queryParams.set("seller_type", params.sellerType);
    if (params.bodyType) queryParams.set("body_type", params.bodyType);

    queryParams.set("sort_by", params.sortBy || "first_seen_at");
    queryParams.set("sort_order", params.sortOrder || "desc");

    const url = `${BASE_URL}/search/car/active?${queryParams.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      if (res.status === 401 || res.status === 403) {
        return { listings: [], totalFound: 0, error: "Invalid MarketCheck API key. Check your key in Settings." };
      }
      if (res.status === 429) {
        return { listings: [], totalFound: 0, error: "API rate limit reached. Please try again in a moment." };
      }
      throw new Error(`MarketCheck API returned ${res.status}: ${errorBody}`);
    }

    const data: MarketCheckResponse = await res.json();

    const listings = (data.listings || [])
      .filter((l) => l.price && l.price > 0)
      .map(mapToFlipdash);

    // Cache all listings for detail page lookups
    cacheListings(listings);

    return {
      listings,
      totalFound: data.num_found || listings.length,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch listings";
    // If it's a network/CORS error, provide a helpful message
    if (message.includes("Failed to fetch") || message.includes("NetworkError") || message.includes("CORS")) {
      return {
        listings: [],
        totalFound: 0,
        error: "Unable to reach MarketCheck API. This may be a network or CORS issue. Listings will load from cache if available.",
      };
    }
    return {
      listings: [],
      totalFound: 0,
      error: message,
    };
  }
}

// ─── Fetch Single Listing Detail ─────────────────────────────────────

export async function fetchMarketCheckListing(
  listingId: string
): Promise<{ listing: MarketplaceListing | null; error?: string }> {
  // First check cache (populated from search results)
  const cached = getCachedListing(listingId);
  if (cached) {
    return { listing: cached };
  }

  // If not in cache, try API
  try {
    const res = await fetch(
      `${BASE_URL}/listing/${listingId}?api_key=${MARKETCHECK_API_KEY}`
    );

    if (!res.ok) {
      if (res.status === 404) {
        return { listing: null, error: "Listing not found. It may have been sold or removed." };
      }
      throw new Error(`MarketCheck API returned ${res.status}`);
    }

    const data: MarketCheckListing = await res.json();
    const listing = mapToFlipdash({ ...data, id: data.id || listingId });
    cacheListings([listing]);
    return { listing };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch listing detail";
    return {
      listing: null,
      error: message.includes("Failed to fetch")
        ? "Unable to load listing details. Please go back and click the listing again."
        : message,
    };
  }
}
