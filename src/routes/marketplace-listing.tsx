import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useStore, estimateMarketValues, getDealRating, fmtCurrency } from '@/lib/store';
import { fetchMarketCheckListing, getCachedListing, getPlaceholderImage } from '@/lib/marketcheck';
import type { MarketplaceListing } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const Route = createFileRoute('/marketplace-listing')({
  validateSearch: (search: Record<string, unknown>) => ({
    listingId: (search.listingId as string) || '',
  }),
  component: MarketplaceListingDetail,
});

function MarketplaceListingDetail() {
  const { listingId } = Route.useSearch();
  const { addOffer, toast } = useStore();

  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | 'chat'>('email');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!listingId) {
        setError('No listing ID provided');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      // Try cache first (populated from marketplace search)
      const cached = getCachedListing(listingId);
      if (cached) {
        setListing(cached);
        setIsLoading(false);
        return;
      }

      // Fallback to API
      const result = await fetchMarketCheckListing(listingId);
      if (cancelled) return;
      if (result.error || !result.listing) {
        setError(result.error || 'Listing not found');
        setListing(null);
      } else {
        setListing(result.listing);
      }
      setIsLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [listingId]);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (target.src !== getPlaceholderImage()) {
      target.src = getPlaceholderImage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-[#3dd45c]/30 border-t-[#3dd45c] rounded-full animate-spin mb-4" />
          <p className="text-gray-400 text-lg">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-4xl mb-4">🚗</p>
          <h1 className="text-2xl font-bold text-white mb-2">Listing Not Found</h1>
          <p className="text-gray-400 mb-4">{error || 'This listing may have been sold or removed.'}</p>
          <button onClick={() => window.history.back()} className="px-4 py-2 rounded-lg text-sm font-medium border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all">
            ← Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const marketValues = estimateMarketValues(listing);
  const dealRating = getDealRating(listing.price, marketValues.retail, marketValues.wholesale);

  const handleMakeOffer = async () => {
    if (!offerAmount || !buyerName || !buyerEmail) {
      toast('Please fill in all required fields', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      addOffer({
        listingId: listing.id,
        buyerName,
        buyerEmail,
        buyerPhone,
        offerAmount: parseInt(offerAmount),
        message: offerMessage,
        status: 'pending',
      });
      toast('Offer submitted successfully! Seller will be notified.', 'success');
      setOfferAmount('');
      setOfferMessage('');
      setBuyerName('');
      setBuyerEmail('');
      setBuyerPhone('');
    } catch {
      toast('Failed to submit offer', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const images = listing.imageUrls && listing.imageUrls.length > 0 ? listing.imageUrls : [listing.imageUrl];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button onClick={() => window.history.back()} className="text-sm text-gray-400 hover:text-white transition-colors">
        ← Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Images & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image */}
          <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="relative h-80 sm:h-96 bg-[#0a0e17]">
              <img
                src={images[selectedImage] || images[0]}
                alt={`${listing.year} ${listing.make} ${listing.model}`}
                className="w-full h-full object-cover"
                onError={handleImgError}
              />
              <div className={`absolute top-4 right-4 ${dealRating.bgColor} ${dealRating.color} px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2`}>
                <span className="text-xl">{dealRating.emoji}</span>
                <div>
                  <div>{dealRating.label}</div>
                  <div className="text-[10px] opacity-80">{dealRating.pctOfMarket}% of market</div>
                </div>
              </div>
            </div>
            {images.length > 1 && (
              <div className="p-3 border-t border-white/[0.06] flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`View ${idx + 1}`}
                    className={`h-16 w-16 object-cover rounded cursor-pointer transition-opacity ${selectedImage === idx ? 'ring-2 ring-[#3dd45c] opacity-100' : 'hover:opacity-75 opacity-50'}`}
                    onClick={() => setSelectedImage(idx)}
                    onError={handleImgError}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Title & Price */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {listing.year} {listing.make} {listing.model}
            </h1>
            <p className="text-lg text-gray-400 mb-4">{listing.trim || ''}</p>
            <div className="flex items-baseline gap-4 flex-wrap">
              <p className="text-4xl font-bold text-[#3dd45c]">{fmtCurrency(listing.price)}</p>
              <div className="text-[11px] text-gray-500">
                <p>Est. Retail: {marketValues.retail > 0 ? fmtCurrency(marketValues.retail) : 'Unavailable'}</p>
                <p>Est. Wholesale: {marketValues.wholesale > 0 ? fmtCurrency(marketValues.wholesale) : 'Unavailable'}</p>
              </div>
            </div>
          </div>

          {/* Flipdash Deal Analysis */}
          <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-lg font-bold text-white mb-4">📊 Flipdash Deal Analysis</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                <p className="text-[10px] text-gray-500 mb-1">Asking Price</p>
                <p className="text-base font-bold text-white">{fmtCurrency(listing.price)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                <p className="text-[10px] text-gray-500 mb-1">Est. Retail</p>
                <p className="text-base font-bold text-white">{marketValues.retail > 0 ? fmtCurrency(marketValues.retail) : 'N/A'}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                <p className="text-[10px] text-gray-500 mb-1">Est. Wholesale</p>
                <p className="text-base font-bold text-white">{marketValues.wholesale > 0 ? fmtCurrency(marketValues.wholesale) : 'N/A'}</p>
              </div>
              <div className={`text-center p-3 rounded-lg ${dealRating.bgColor}`}>
                <p className="text-[10px] opacity-70 mb-1">Deal Rating</p>
                <p className={`text-base font-bold ${dealRating.color}`}>{dealRating.emoji} {dealRating.label}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 italic">{dealRating.description}</p>
          </div>

          {/* Key Specs */}
          <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-lg font-bold text-white mb-4">Vehicle Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Mileage', value: listing.miles > 0 ? `${listing.miles.toLocaleString()} mi` : 'Unknown' },
                { label: 'Year', value: listing.year },
                { label: 'Body Style', value: listing.bodyStyle !== 'Unknown' ? listing.bodyStyle : 'N/A' },
                { label: 'Engine', value: listing.engine !== 'Unknown' ? listing.engine : 'N/A' },
                { label: 'Transmission', value: listing.transmission !== 'Unknown' ? listing.transmission : 'N/A' },
                { label: 'Drivetrain', value: listing.drivetrain !== 'Unknown' ? listing.drivetrain : 'N/A' },
                { label: 'Fuel Type', value: listing.fuelType !== 'Unknown' ? listing.fuelType : 'N/A' },
                { label: 'Exterior Color', value: listing.exteriorColor !== 'Unknown' ? listing.exteriorColor : 'N/A' },
                ...(listing.interiorColor && listing.interiorColor !== 'Unknown' ? [{ label: 'Interior Color', value: listing.interiorColor }] : []),
              ].map((spec) => (
                <div key={spec.label}>
                  <p className="text-[11px] text-gray-500 font-medium">{spec.label}</p>
                  <p className="text-sm font-semibold text-white">{spec.value}</p>
                </div>
              ))}
              {listing.vin && (
                <div className="col-span-2 md:col-span-3">
                  <p className="text-[11px] text-gray-500 font-medium">VIN</p>
                  <p className="text-sm font-semibold text-white font-mono">{listing.vin}</p>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          {listing.features && listing.features.length > 0 && (
            <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5">
              <h2 className="text-lg font-bold text-white mb-4">Features</h2>
              <div className="flex flex-wrap gap-2">
                {listing.features.map((feature, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-full bg-white/[0.06] text-gray-300 text-xs">
                    ✓ {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-lg font-bold text-white mb-3">Description</h2>
            <p className="text-gray-300 text-sm leading-relaxed">{listing.description}</p>
          </div>
        </div>

        {/* Right: Seller Info & Make Offer */}
        <div className="lg:col-span-1 space-y-5">
          {/* Seller Card */}
          <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5 sticky top-20">
            <h2 className="text-lg font-bold text-white mb-4">Seller Information</h2>
            <div className="space-y-3 mb-5">
              <div>
                <p className="text-[11px] text-gray-500 font-medium">Name</p>
                <p className="text-sm text-white">{listing.sellerName}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium">Location</p>
                <p className="text-sm text-white">{listing.location}</p>
              </div>
              {listing.sellerPhone && (
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">Phone</p>
                  <a href={`tel:${listing.sellerPhone}`} className="text-sm text-[#3dd45c] hover:underline">{listing.sellerPhone}</a>
                </div>
              )}
              {listing.daysListed > 0 && (
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">Days on Market</p>
                  <p className="text-sm text-white">{listing.daysListed} days</p>
                </div>
              )}
            </div>

            {/* Contact Methods */}
            <div className="mb-5 pb-5 border-b border-white/[0.06]">
              <p className="text-[11px] text-gray-500 font-medium mb-3">Contact Options</p>
              <div className="space-y-2">
                {listing.sellerPhone && (
                  <a href={`tel:${listing.sellerPhone}`} className="block w-full px-3 py-2 rounded-lg text-sm font-medium border border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.04] transition-all text-left">
                    📞 Call Seller
                  </a>
                )}
                <button className="w-full px-3 py-2 rounded-lg text-sm font-medium border border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.04] transition-all text-left">
                  ✉️ Email Seller
                </button>
                <button className="w-full px-3 py-2 rounded-lg text-sm font-medium border border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.04] transition-all text-left">
                  💬 Chat on Platform
                </button>
              </div>
            </div>

            {/* External Source Link */}
            {listing.sourceUrl && (
              <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer" className="block w-full px-3 py-2 rounded-lg text-sm font-medium border border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.04] transition-all text-left mb-5">
                🔗 View Original Listing
              </a>
            )}

            {/* Make Offer Button */}
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full px-4 py-3 rounded-lg text-base font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity">
                  💰 Make an Offer
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#131a2b] border-white/[0.08] text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Make an Offer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Your Name *</label>
                    <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="John Doe" className="bg-[#0a0e17] border-white/[0.08] text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Email *</label>
                    <Input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} placeholder="john@example.com" className="bg-[#0a0e17] border-white/[0.08] text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Phone</label>
                    <Input type="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} placeholder="(555) 123-4567" className="bg-[#0a0e17] border-white/[0.08] text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Offer Amount *</label>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">$</span>
                      <Input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} placeholder={listing.price.toString()} className="bg-[#0a0e17] border-white/[0.08] text-white flex-1" />
                    </div>
                    {offerAmount && (
                      <p className="text-[10px] text-gray-500 mt-1">
                        {parseInt(offerAmount) < listing.price
                          ? `${Math.round(((listing.price - parseInt(offerAmount)) / listing.price) * 100)}% below asking`
                          : parseInt(offerAmount) > listing.price
                          ? `${Math.round(((parseInt(offerAmount) - listing.price) / listing.price) * 100)}% above asking`
                          : 'At asking price'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Message</label>
                    <Textarea value={offerMessage} onChange={(e) => setOfferMessage(e.target.value)} placeholder="Add any notes..." className="bg-[#0a0e17] border-white/[0.08] text-white min-h-20" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Preferred Contact</label>
                    <select value={contactMethod} onChange={(e) => setContactMethod(e.target.value as 'phone' | 'email' | 'chat')} className="w-full px-3 py-2 bg-[#0a0e17] border border-white/[0.08] rounded-md text-white text-sm">
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="chat">Chat on Platform</option>
                    </select>
                  </div>
                  <button onClick={handleMakeOffer} disabled={isSubmitting} className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity disabled:opacity-50">
                    {isSubmitting ? 'Submitting...' : 'Submit Offer'}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
