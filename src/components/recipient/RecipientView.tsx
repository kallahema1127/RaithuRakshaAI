import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateAIMatches } from '../../services/aiMatchingEngine';
import { FreshnessBadge } from '../common/FreshnessBadge';
import { AIMatchScoreRing } from '../common/AIMatchScoreRing';
import { RegisterRecipientModal } from './RegisterRecipientModal';
import { 
  Building2, 
  Sparkles, 
  MapPin, 
  Truck, 
  Clock, 
  Scale, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  ShieldCheck, 
  Check, 
  Info,
  Sliders,
  PhoneCall,
  UserCheck
} from 'lucide-react';

export const RecipientView: React.FC = () => {
  const { 
    recipients, 
    selectedRecipientId, 
    setSelectedRecipientId, 
    listings, 
    acceptMatch, 
    rejectMatch, 
    advancePickupStatus,
    updateRecipientNeeds 
  } = useApp();

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'matches' | 'active_pickups' | 'settings'>('matches');

  const activeRecipient = recipients.find((r) => r.id === selectedRecipientId) || recipients[0];

  // Find all available surplus listings and score them for the active recipient
  const availableListings = listings.filter((l) => l.status === 'available');

  const matchesForThisRecipient = availableListings.map((listing) => {
    const allMatches = generateAIMatches(listing, recipients);
    const matchForMe = allMatches.find((m) => m.recipient.id === activeRecipient.id);
    return {
      listing,
      match: matchForMe,
    };
  }).filter((item) => item.match !== undefined)
    .sort((a, b) => (b.match?.matchScore || 0) - (a.match?.matchScore || 0));

  // Find active pickups claimed by this recipient
  const myPickups = listings.filter(
    (l) => l.matchedRecipientId === activeRecipient.id && (l.status === 'pickup_scheduled' || l.status === 'in_transit' || l.status === 'completed')
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Recipient Switcher */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-xs font-semibold text-emerald-200">
                గ్రహీత &bull; Recipient Portal
              </span>
              <span className="flex items-center gap-1 text-xs text-amber-300 font-semibold bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Partner
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {activeRecipient.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
              <span>{activeRecipient.locationName}</span>
              <span>&bull;</span>
              <span>Vehicle: {activeRecipient.vehicleType}</span>
              <span>&bull;</span>
              <span>Contact: {activeRecipient.contactPerson} ({activeRecipient.phone})</span>
            </p>
          </div>

          {/* Org Selector & Register New */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <div className="bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2 mb-1">
                Switch Organization Profile:
              </label>
              <select
                value={selectedRecipientId}
                onChange={(e) => setSelectedRecipientId(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-emerald-500"
              >
                {recipients.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.locationName})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Org</span>
            </button>
          </div>
        </div>

        {/* Requirements Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60 text-xs">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40">
            <span className="text-slate-400 block font-medium text-[11px]">Daily Absorption Capacity</span>
            <p className="text-lg font-bold text-white mt-0.5">{activeRecipient.dailyCapacityKg} kg</p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40">
            <span className="text-slate-400 block font-medium text-[11px]">Urgent Demand Today</span>
            <p className="text-lg font-bold text-amber-300 mt-0.5">{activeRecipient.currentNeededKg} kg</p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40">
            <span className="text-slate-400 block font-medium text-[11px]">Pickup Transport</span>
            <p className="text-lg font-bold text-emerald-300 mt-0.5">{activeRecipient.vehicleType}</p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40">
            <span className="text-slate-400 block font-medium text-[11px]">Acceptable Freshness</span>
            <p className="text-xs font-bold text-white mt-1">
              {activeRecipient.acceptsFreshness.map((f) => (f === 'fresh' ? '🟢 ' : f === 'moderate' ? '🟡 ' : '🔴 '))}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'matches'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Surplus Matches ({matchesForThisRecipient.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('active_pickups')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'active_pickups'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>My Claimed Pickups ({myPickups.length})</span>
          </button>
        </div>

        <span className="text-xs text-gray-500 hidden sm:inline">
          Automatic AI matching prioritized by proximity &amp; spoilage urgency
        </span>
      </div>

      {/* Tab 1: AI Surplus Matches Feed */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {matchesForThisRecipient.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-6">
              <Sparkles className="w-12 h-12 text-emerald-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-gray-900">No Pending Surplus Right Now</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                All Rythu Bazaar surplus batches have been claimed or redistributed. You will be alerted instantly when new surplus is listed!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchesForThisRecipient.map(({ listing, match }) => {
                if (!match) return null;
                const score = match.matchScore;

                return (
                  <div
                    key={listing.id}
                    className="bg-white rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Vegetable and Match Score */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={listing.photoUrl}
                            alt={listing.vegetableName}
                            className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-xs"
                          />
                          <div>
                            <h3 className="text-base font-extrabold text-gray-900 leading-snug">
                              {listing.vegetableName}
                            </h3>
                            <p className="text-xs text-emerald-800 font-semibold">{listing.teluguName}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {listing.rythuBazaarLocation} &bull; {listing.stallNumber}
                            </p>
                          </div>
                        </div>

                        <AIMatchScoreRing score={score} size="md" />
                      </div>

                      {/* Freshness & Logistics Pills */}
                      <div className="flex items-center gap-2 mt-4 flex-wrap">
                        <FreshnessBadge
                          level={listing.freshness}
                          score={listing.freshnessScore}
                          hoursRemaining={listing.hoursRemaining}
                          showDetails
                        />
                        <span className="text-xs font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-full">
                          {listing.quantityKg} kg Available
                        </span>
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          {listing.askingPricePerKg === 0 ? 'FREE Donation' : `₹${listing.askingPricePerKg}/kg`}
                        </span>
                      </div>

                      {/* Distance & Travel Time */}
                      <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 bg-gray-50 rounded-2xl text-xs text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Distance: <strong>{match.distanceKm} km</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>ETA: <strong>~{match.estimatedTravelMins} mins</strong> ({activeRecipient.vehicleType})</span>
                        </div>
                      </div>

                      {/* AI Reasoning */}
                      <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950 italic">
                        &ldquo;{match.aiReasoning}&rdquo;
                      </div>
                    </div>

                    {/* Action Buttons: Accept / Reject */}
                    <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <button
                        onClick={() => rejectMatch(listing.id, activeRecipient.id)}
                        className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </button>

                      <button
                        onClick={() => acceptMatch(listing.id, activeRecipient.id, match.matchScore)}
                        className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>Accept &amp; Claim Surplus</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Claimed Pickups */}
      {activeTab === 'active_pickups' && (
        <div className="space-y-4">
          {myPickups.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-6">
              <Truck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-gray-900">No Active Pickups</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Accept a surplus match above to schedule an automated pickup.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPickups.map((listing) => {
                const isScheduled = listing.status === 'pickup_scheduled';
                const isInTransit = listing.status === 'in_transit';
                const isCompleted = listing.status === 'completed';

                return (
                  <div
                    key={listing.id}
                    className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Status */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isInTransit
                              ? 'bg-sky-100 text-sky-800 animate-pulse'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Delivered &amp; Distributed</span>
                            </>
                          ) : isInTransit ? (
                            <>
                              <Truck className="w-3.5 h-3.5" />
                              <span>Auto-Rickshaw In Transit</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pickup Scheduled</span>
                            </>
                          )}
                        </span>

                        <span className="text-xs bg-slate-900 text-white font-mono font-bold px-2.5 py-1 rounded-lg">
                          OTP: {listing.pickupOtp || '8312'}
                        </span>
                      </div>

                      {/* Produce info */}
                      <div className="flex items-center gap-3">
                        <img
                          src={listing.photoUrl}
                          alt={listing.vegetableName}
                          className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
                        />
                        <div>
                          <h4 className="text-base font-bold text-gray-900">{listing.vegetableName}</h4>
                          <p className="text-xs text-emerald-800 font-semibold">{listing.quantityKg} kg &bull; {listing.teluguName}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Farmer: {listing.farmerName} ({listing.farmerPhone})
                          </p>
                        </div>
                      </div>

                      {/* Location & Stall */}
                      <div className="mt-3 p-3 bg-gray-50 rounded-2xl text-xs space-y-1">
                        <div className="flex items-center justify-between text-gray-700">
                          <span>Pickup Stall:</span>
                          <strong className="text-gray-900">{listing.rythuBazaarLocation}, {listing.stallNumber}</strong>
                        </div>
                        <div className="flex items-center justify-between text-gray-700">
                          <span>Available Until:</span>
                          <span className="text-rose-600 font-bold">{listing.availablePickupUntil}</span>
                        </div>
                      </div>
                    </div>

                    {/* Workflow status advance button */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {isScheduled && (
                        <button
                          onClick={() => advancePickupStatus(listing.id)}
                          className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Dispatch Volunteer / Driver En Route</span>
                        </button>
                      )}

                      {isInTransit && (
                        <button
                          onClick={() => advancePickupStatus(listing.id)}
                          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>Confirm Handover &amp; Verify Weight Received</span>
                        </button>
                      )}

                      {isCompleted && (
                        <div className="text-center text-xs text-emerald-800 font-semibold bg-emerald-50 py-2 rounded-xl border border-emerald-100">
                          🎉 Food Waste Eliminated &bull; Added to Kitchen Stock
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Register Modal */}
      <RegisterRecipientModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
};
