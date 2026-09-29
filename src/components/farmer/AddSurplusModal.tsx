import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FreshnessLevel, DestinationType } from '../../types';
import { 
  VEGETABLE_CATALOG, 
  RYTHU_BAZAAR_LOCATIONS, 
  VegetableCatalogItem 
} from '../../data/mockData';
import { 
  X, 
  Sparkles, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  IndianRupee, 
  Store, 
  MapPin, 
  Check, 
  Loader2,
  HelpCircle
} from 'lucide-react';

interface AddSurplusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSurplusModal: React.FC<AddSurplusModalProps> = ({ isOpen, onClose }) => {
  const { addListing } = useApp();

  const [selectedVeg, setSelectedVeg] = useState<VegetableCatalogItem>(VEGETABLE_CATALOG[0]);
  const [quantityKg, setQuantityKg] = useState<number>(30);
  const [freshness, setFreshness] = useState<FreshnessLevel>('fresh');
  const [freshnessScore, setFreshnessScore] = useState<number>(90);
  const [hoursRemaining, setHoursRemaining] = useState<number>(24);
  const [qualitySummary, setQualitySummary] = useState<string>('Freshly harvested morning batch. Firm and clean condition.');
  const [teluguTip, setTeluguTip] = useState<string>('తాజా కూరగాయలు నేరుగా ఆహార బ్యాంకులకు లేదా హాస్టళ్లకు పంపిణీ చేయవచ్చు.');
  const [recommendedDest, setRecommendedDest] = useState<DestinationType>('human_consumption');
  
  const [farmerName, setFarmerName] = useState<string>('Mallesh Yadav (మల్లేష్ యాదవ్)');
  const [farmerPhone, setFarmerPhone] = useState<string>('+91 98492 88123');
  const [stallNumber, setStallNumber] = useState<string>('Stall #14');
  const [marketLocation, setMarketLocation] = useState<string>(RYTHU_BAZAAR_LOCATIONS[0].name);
  const [pickupDeadline, setPickupDeadline] = useState<string>('Today, 8:00 PM');
  const [isDonation, setIsDonation] = useState<boolean>(false);
  const [askingPrice, setAskingPrice] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');
  
  // Image & AI scanning state
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [aiScanDone, setAiScanDone] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle image upload and trigger AI freshness scan
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      runAiFreshnessScan(base64, selectedVeg.name, quantityKg);
    };
    reader.readAsDataURL(file);
  };

  const runAiFreshnessScan = async (imageBase64?: string, vegName?: string, qty?: number) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/ai/analyze-vegetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vegetableName: vegName || selectedVeg.name,
          quantityKg: qty || quantityKg,
          notes: notes || 'Evening surplus from Rythu Bazaar stall',
          imageBase64: imageBase64 || imagePreview,
          hoursSinceHarvest: 'Harvested morning 6 AM, displayed till evening',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.freshness) {
          setFreshness(data.freshness as FreshnessLevel);
        }
        if (data.freshnessScore) {
          setFreshnessScore(data.freshnessScore);
        }
        if (data.shelfLifeHoursRemaining) {
          setHoursRemaining(data.shelfLifeHoursRemaining);
        }
        if (data.qualitySummary) {
          setQualitySummary(data.qualitySummary);
        }
        if (data.recommendedDestination) {
          setRecommendedDest(data.recommendedDestination as DestinationType);
        }
        if (data.teluguTip) {
          setTeluguTip(data.teluguTip);
        }
        setAiScanDone(true);
      }
    } catch (err) {
      console.error('AI scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const locationObj = RYTHU_BAZAAR_LOCATIONS.find((l) => l.name === marketLocation) || RYTHU_BAZAAR_LOCATIONS[0];

    const defaultImage = imagePreview || (
      selectedVeg.name.toLowerCase().includes('tomato')
        ? 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80'
        : selectedVeg.name.toLowerCase().includes('palak') || selectedVeg.name.toLowerCase().includes('spinach')
        ? 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80'
    );

    addListing({
      vegetableName: selectedVeg.name,
      teluguName: selectedVeg.teluguName,
      category: selectedVeg.category,
      quantityKg: Number(quantityKg),
      freshness,
      freshnessScore,
      hoursRemaining,
      recommendedDestination: recommendedDest,
      qualitySummary,
      farmerName,
      farmerPhone,
      stallNumber,
      rythuBazaarLocation: marketLocation,
      coordinates: locationObj.coords,
      availablePickupUntil: pickupDeadline,
      askingPricePerKg: isDonation ? 0 : Number(askingPrice),
      retailMarketPricePerKg: selectedVeg.averageRetailPrice,
      photoUrl: defaultImage,
      notes: notes.trim() || `${selectedVeg.teluguName} surplus listed for quick redistribution.`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/60 rounded-xl">
              <Store className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">List Surplus Vegetables</h2>
              <p className="text-xs text-emerald-200">
                రైతు బజార్ కూరగాయల మిగులు నమోదు &bull; AI Matching Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-emerald-600/50 text-emerald-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Vegetable Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              1. Select Vegetable / ఆకుకూరలు లేదా కూరగాయలు
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VEGETABLE_CATALOG.slice(0, 8).map((veg) => {
                const isSelected = selectedVeg.name === veg.name;
                return (
                  <button
                    key={veg.name}
                    type="button"
                    onClick={() => {
                      setSelectedVeg(veg);
                      setHoursRemaining(veg.typicalPerishHours);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-gray-50/70 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{veg.iconEmoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{veg.name.split(' ')[0]}</p>
                      <p className="text-[10px] text-gray-500 truncate">{veg.teluguName}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: AI Freshness Scanner & Photo */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  2. AI Freshness & Priority Scanner
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                Gemini Vision Powered
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Photo Upload Area */}
              <div className="relative border-2 border-dashed border-emerald-300 rounded-xl p-3 flex flex-col items-center justify-center text-center bg-white hover:bg-emerald-50/50 transition cursor-pointer min-h-[120px]">
                {imagePreview ? (
                  <div className="relative w-full h-28 rounded-lg overflow-hidden">
                    <img src={imagePreview} alt="Surplus scan" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/40 text-white text-[11px] font-bold flex items-center justify-center opacity-0 hover:opacity-100 transition cursor-pointer">
                      Change Photo
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-2">
                    <Camera className="w-8 h-8 text-emerald-600 mb-1" />
                    <span className="text-xs font-bold text-emerald-900">Upload / Take Photo</span>
                    <span className="text-[10px] text-gray-500">Auto-detect freshness</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* AI Scan Results / Manual Override */}
              <div className="sm:col-span-2 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Freshness Assessment:</span>
                  <button
                    type="button"
                    onClick={() => runAiFreshnessScan()}
                    disabled={isScanning}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Run AI Scan
                      </>
                    )}
                  </button>
                </div>

                {/* Freshness Tier Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFreshness('fresh');
                      setFreshnessScore(92);
                      setRecommendedDest('human_consumption');
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border flex flex-col items-center ${
                      freshness === 'fresh'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>🟢 Fresh</span>
                    <span className="text-[10px] font-normal opacity-80">Direct Eating</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFreshness('moderate');
                      setFreshnessScore(70);
                      setRecommendedDest('human_consumption');
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border flex flex-col items-center ${
                      freshness === 'moderate'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>🟡 Moderate</span>
                    <span className="text-[10px] font-normal opacity-80">Cook &lt; 12h</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFreshness('critical');
                      setFreshnessScore(38);
                      setRecommendedDest('animal_feed');
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border flex flex-col items-center ${
                      freshness === 'critical'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>🔴 Critical</span>
                    <span className="text-[10px] font-normal opacity-80">Gaushala/Compost</span>
                  </button>
                </div>

                {/* AI Summary Banner */}
                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200 text-xs">
                  <p className="text-gray-800 font-medium leading-relaxed">
                    {qualitySummary}
                  </p>
                  {teluguTip && (
                    <p className="text-[11px] text-emerald-800 font-semibold mt-1">
                      💡 {teluguTip}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Quantity & Time Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Surplus Quantity (kg) / పరిమాణం
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(Math.max(1, Number(e.target.value)))}
                  className="w-full pl-3 pr-10 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold text-gray-900"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-semibold">kg</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Estimated Shelf-Life Remaining
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={hoursRemaining}
                  onChange={(e) => setHoursRemaining(Math.max(1, Number(e.target.value)))}
                  className="w-full pl-8 pr-12 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold text-gray-900"
                  required
                />
                <Clock className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-semibold">hours</span>
              </div>
            </div>
          </div>

          {/* Section 4: Market Stall, Location & Pickup Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Rythu Bazaar Location
              </label>
              <select
                value={marketLocation}
                onChange={(e) => setMarketLocation(e.target.value)}
                className="w-full p-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-xs font-semibold text-gray-900 bg-white"
              >
                {RYTHU_BAZAAR_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Stall Number / స్టాల్ నంబర్
              </label>
              <input
                type="text"
                value={stallNumber}
                onChange={(e) => setStallNumber(e.target.value)}
                placeholder="e.g. Stall #14"
                className="w-full p-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Available Pickup Until
              </label>
              <input
                type="text"
                value={pickupDeadline}
                onChange={(e) => setPickupDeadline(e.target.value)}
                placeholder="e.g. Today, 8:00 PM"
                className="w-full p-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                required
              />
            </div>
          </div>

          {/* Section 5: Price Recovery vs Free Donation */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900">100% Free Donation to Charity / NGO</span>
                <p className="text-[11px] text-gray-500">Donate directly to feed the hungry or shelter cows</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDonation}
                  onChange={(e) => setIsDonation(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {!isDonation && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">Nominal Recovery Price:</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={selectedVeg.averageRetailPrice}
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(Number(e.target.value))}
                    className="w-20 p-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-900 text-right"
                  />
                  <span className="text-xs text-gray-500">/ kg</span>
                  <span className="text-[10px] text-gray-400 ml-2 line-through">
                    Retail ₹{selectedVeg.averageRetailPrice}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Farmer Notes & Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Placed in plastic crates near gate 2. Quick loading ready."
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Publish & Find AI Matches</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
