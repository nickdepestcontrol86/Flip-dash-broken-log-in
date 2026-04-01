import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { fmtCurrency, estimateMarketValues, getDealRating } from '@/lib/store';
import { fetchMarketCheckListings, getPlaceholderImage } from '@/lib/marketcheck';
import type { MarketplaceListing } from '@/lib/store';
import type { MarketCheckSearchParams } from '@/lib/marketcheck';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/marketplace')({ component: MarketplacePage });

function MarketplacePage() {
  // ─── Search / filter state ─────────────────────────────────────────
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [zip, setZip] = useState('');
  const [radius, setRadius] = useState('100');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('first_seen_at');

  // ─── Data state ────────────────────────────────────────────────────
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // ─── Fetch from MarketCheck API ────────────────────────────────────
  const doSearch = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    const params: MarketCheckSearchParams = {
      rows: itemsPerPage,
      start: (page - 1) * itemsPerPage,
      sortBy,
      sortOrder: 'desc',
    };

    if (make.trim()) params.make = make.trim();
    if (model.trim()) params.model = model.trim();
    if (year.trim()) params.year = year.trim();
    if (zip.trim()) params.zip = zip.trim();
    if (radius) params.radius = parseInt(radius);
    if (priceMin) params.priceMin = parseInt(priceMin);
    if (priceMax) params.priceMax = parseInt(priceMax);

    const result = await fetchMarketCheckListings(params);

    if (result.error) {
      setError(result.error);
      setListings([]);
      setTotalFound(0);
    } else {
      setListings(result.listings);
      setTotalFound(result.totalFound);
    }
    setCurrentPage(page);
    setIsLoading(false);
  }, [make, model, year, zip, radius, priceMin, priceMax, sortBy]);

  // Auto-search on first load with defaults
  useEffect(() => {
    doSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(1);
  };

  const handleClear = () => {
    setMake('');
    setModel('');
    setYear('');
    setZip('');
    setRadius('100');
    setPriceMin('');
    setPriceMax('');
    setSortBy('first_seen_at');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalFound / itemsPerPage);

  // ─── Image error handler ──────────────────────────────────────────
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (target.src !== getPlaceholderImage()) {
      target.src = getPlaceholderImage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white mb-1">🏪 Marketplace</h1>
        <p className="text-sm text-gray-400">
          {hasSearched
            ? isLoading
              ? 'Searching...'
              : `${totalFound.toLocaleString()} vehicles found`
            : 'Search for real vehicle listings'}
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5">Powered by MarketCheck &bull; Real-time inventory data</p>
      </div>

      {/* Search Filters */}
      <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Make</label>
              <Input
                placeholder="e.g. Toyota, Honda..."
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="bg-[#0a0e17] border-white/[0.08] text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Model</label>
              <Input
                placeholder="e.g. Camry, Civic..."
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-[#0a0e17] border-white/[0.08] text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Year</label>
              <Input
                placeholder="e.g. 2020"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="bg-[#0a0e17] border-white/[0.08] text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0e17] border border-white/[0.08] rounded-md text-white text-sm"
              >
                <option value="first_seen_at">Newest First</option>
                <option value="price">Price</option>
                <option value="miles">Mileage</option>
                <option value="dom">Days on Market</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">ZIP Code</label>
              <Input
                placeholder="e.g. 75201"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="bg-[#0a0e17] border-white/[0.08] text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Radius (mi)</label>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0e17] border border-white/[0.08] rounded-md text-white text-sm"
              >
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
                <option value="200">200 miles</option>
                <option value="500">500 miles</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Min Price</label>
              <Input
                type="number"
                placeholder="$0"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="bg-[#0a0e17] border-white/[0.08] text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Max Price</label>
              <Input
                type="number"
                placeholder="$999,999"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="bg-[#0a0e17] border-white/[0.08] text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? '⏳ Searching...' : '🔍 Search'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-16">
          <div className="inline-block w-10 h-10 border-4 border-[#3dd45c]/30 border-t-[#3dd45c] rounded-full animate-spin mb-4" />
          <p className="text-gray-400 text-lg">Fetching live listings...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
          <p className="text-red-400 text-lg font-semibold mb-2">⚠️ {error}</p>
          <p className="text-gray-500 text-sm">Try adjusting your search filters or check back later.</p>
        </div>
      )}

      {/* Listings Grid — Flipdash UI preserved */}
      {!isLoading && listings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => {
            const marketValues = estimateMarketValues(listing);
            const dealRating = getDealRating(listing.price, marketValues.retail, marketValues.wholesale);

            return (
              <Link
                key={listing.id}
                to="/marketplace-listing"
                search={{ listingId: listing.id }}
                className="no-underline"
              >
                <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.12] hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col group">
                  {/* Image */}
                  <div className="relative h-48 bg-[#0a0e17] overflow-hidden">
                    <img
                      src={listing.imageUrl}
                      alt={`${listing.year} ${listing.make} ${listing.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImgError}
                      loading="lazy"
                    />
                    {/* Deal Badge */}
                    <div className={`absolute top-3 right-3 ${dealRating.bgColor} ${dealRating.color} px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                      <span>{dealRating.emoji}</span>
                      <span>{dealRating.label}</span>
                    </div>
                    {/* Days Listed */}
                    {listing.daysListed > 0 && (
                      <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-[10px] font-medium">
                        {listing.daysListed}d on market
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="font-bold text-[15px] text-white mb-0.5 truncate">
                      {listing.year} {listing.make} {listing.model}
                    </h3>
                    <p className="text-[11px] text-gray-500 mb-3 truncate">{listing.trim || 'Base'}</p>

                    {/* Price & Location */}
                    <div className="mb-3">
                      <p className="text-xl font-bold text-[#3dd45c] mb-0.5">{listing.price > 0 ? fmtCurrency(listing.price) : 'Call for Price'}</p>
                      <p className="text-[11px] text-gray-500">{listing.location}</p>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3 text-[11px] text-gray-400">
                      <div>
                        <span className="text-gray-500">Miles:</span> {listing.miles > 0 ? listing.miles.toLocaleString() : 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Fuel:</span> {listing.fuelType !== 'Unknown' ? listing.fuelType : 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Trans:</span> {listing.transmission !== 'Unknown' ? listing.transmission : 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Color:</span> {listing.exteriorColor !== 'Unknown' ? listing.exteriorColor : 'N/A'}
                      </div>
                    </div>

                    {/* Flipdash Valuation */}
                    <div className="pt-3 border-t border-white/[0.06] space-y-1 mt-auto">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">Est. Retail:</span>
                        <span className="text-white font-semibold">{marketValues.retail > 0 ? fmtCurrency(marketValues.retail) : 'Unavailable'}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">Est. Wholesale:</span>
                        <span className="text-white font-semibold">{marketValues.wholesale > 0 ? fmtCurrency(marketValues.wholesale) : 'Unavailable'}</span>
                      </div>
                    </div>

                    {/* Seller */}
                    <div className="pt-2 border-t border-white/[0.06] mt-2 flex items-center justify-between">
                      <p className="text-[10px] text-gray-500 truncate">
                        {listing.sellerName}
                      </p>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#3dd45c]/10 text-[#3dd45c]">
                        Live
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && hasSearched && listings.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🚗</p>
          <p className="text-gray-400 text-lg mb-2">No vehicles match your search.</p>
          <p className="text-gray-500 text-sm">Try broadening your filters or searching a different area.</p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pb-4">
          <button
            onClick={() => doSearch(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all disabled:opacity-30"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages.toLocaleString()}
          </span>
          <button
            onClick={() => doSearch(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
