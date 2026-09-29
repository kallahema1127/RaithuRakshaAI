import React from 'react';
import { SurplusListing, AIMatchRecommendation } from '../../types';
import { useApp } from '../../context/AppContext';
import { generateAIMatches } from '../../services/aiMatchingEngine';
import { FreshnessBadge } from '../common/FreshnessBadge';
import { AIMatchScoreRing } from '../common/AIMatchScoreRing';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Navigation, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Scale, 
  Building2, 
  Info,
  ShieldCheck,
  Phone
} from 'lucide-react';

interface FarmerMatchesModalProps {
  listing: SurplusListing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FarmerMatchesModal: React.FC<FarmerMatchesModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  const { recipients, acceptMatch } = useApp();

  if (!isOpen || !listing) return null;

  const matches: AIMatchRecommendation[] = generateAIMatches(listing, recipients);

  const handleSelectMatch = (match: AIMatchRecommendation) => {
    acceptMatch(listing.id, match.recipient.id, match.matchScore);
    onClose();
  };

  const getRecipientTypeLabel = (type: string) => {
    switch (type) {
      case 'community_kitchen': return 'Community Kitchen';
      case 'ngo': return 'NGO / Relief Hub';
      case 'food_bank': return 'Food Bank';
      case 'animal_shelter': return 'Gaushala / Animal Shelter';
      case 'composting_unit': return 'Bio-Composting Facility';
      case 'hostel': return 'Student / Working Hostel';
      case 'restaurant': return 'Restaurant / Curries';
      default: return 'Recipient';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-700/60 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Surplus Match Recommendations</h2>
              <p className="text-xs text-emerald-200">
                Optimized by Distance &bull; Quantity Fit &bull; Freshness Tier &bull; Pickup Speed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-emerald-700 text-emerald-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing Overview Card */}
        <div className="bg-emerald-50/90 border-b border-emerald-100 p-4 px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={listing.photoUrl}
              alt={listing.vegetableName}
              className="w-14 h-14 rounded-2xl object-cover border border-emerald-200 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-gray-900">
                  {listing.vegetableName}
                </h3>
                <span className="text-xs text-gray-500 font-medium">({listing.teluguName})</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {listing.quantityKg} kg Surplus
                </span>
                <FreshnessBadge level={listing.freshness} score={listing.freshnessScore} />
              </div>
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="flex items-center justify-end gap-1 text-gray-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{listing.rythuBazaarLocation} ({listing.stallNumber})</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-gray-500 mt-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Pickup cutoff: {listing.availablePickupUntil}</span>
            </div>
          </div>
        </div>

        {/* Matches Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-gray-700">
              Ranked AI Matches ({matches.length} recipients evaluated)
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Verified Community Recipients
            </span>
          </div>

          {listing.freshness === 'critical' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">AI Priority Recommendation: </span>
                Produce is graded Critical ({listing.hoursRemaining}h remaining). System has prioritized animal shelters (Gaushalas) and organic composting to prevent landfill methane!
              </div>
            </div>
          )}

          {matches.map((match, idx) => {
            const isTopMatch = idx === 0;
            return (
              <div
                key={match.recipient.id}
                className={`p-4 rounded-2xl border transition relative ${
                  isTopMatch
                    ? 'bg-emerald-50/30 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {isTopMatch && (
                  <span className="absolute -top-2.5 left-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Top AI Match #1
                  </span>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
                  {/* Recipient details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">#{match.priorityRank}</span>
                      <h4 className="text-sm font-bold text-gray-900 truncate">
                        {match.recipient.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                        {getRecipientTypeLabel(match.recipient.type)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-emerald-600" />
                        <strong className="text-gray-800">{match.distanceKm} km</strong> away
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        ~{match.estimatedTravelMins} mins via {match.recipient.vehicleType}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Scale className="w-3 h-3 text-gray-400" />
                        Needs <strong className="text-gray-800">{match.recipient.currentNeededKg} kg</strong>
                      </span>
                    </p>

                    {/* AI Reasoning quote */}
                    <div className="mt-2.5 p-2 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700 italic">
                      &ldquo;{match.aiReasoning}&rdquo;
                    </div>

                    {/* Compatibility metric badges */}
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium">
                        Distance: {match.scoreBreakdown.distanceScore}/30
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 font-medium">
                        Quantity Fit: {match.scoreBreakdown.quantityFitScore}/25
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium">
                        Freshness Suitability: {match.scoreBreakdown.freshnessSuitabilityScore}/20
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 font-medium">
                        Urgency Speed: {match.scoreBreakdown.urgencySpeedScore}/15
                      </span>
                    </div>
                  </div>

                  {/* Match Score & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <AIMatchScoreRing score={match.matchScore} size="md" />

                    <button
                      onClick={() => handleSelectMatch(match)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>Accept Recipient</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>AI evaluates nearest verified recipients with active vehicle availability</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-700 hover:text-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
