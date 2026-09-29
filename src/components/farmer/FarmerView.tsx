import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SurplusListing } from '../../types';
import { FreshnessBadge } from '../common/FreshnessBadge';
import { AddSurplusModal } from './AddSurplusModal';
import { FarmerMatchesModal } from './FarmerMatchesModal';
import { 
  Plus, 
  Sparkles, 
  MapPin, 
  Clock, 
  Truck, 
  CheckCircle2, 
  IndianRupee, 
  Scale, 
  Eye, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';

export const FarmerView: React.FC = () => {
  const { listings, advancePickupStatus } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedListingForMatches, setSelectedListingForMatches] = useState<SurplusListing | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'active_pickup' | 'completed'>('all');

  const filteredListings = listings.filter((l) => {
    if (statusFilter === 'available') return l.status === 'available';
    if (statusFilter === 'active_pickup') return l.status === 'pickup_scheduled' || l.status === 'in_transit';
    if (statusFilter === 'completed') return l.status === 'completed';
    return true;
  });

  const activeSurplusCount = listings.filter((l) => l.status === 'available').length;
  const inProgressPickups = listings.filter((l) => l.status === 'pickup_scheduled' || l.status === 'in_transit').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background Decorative Rings */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/10 pointer-events-none blur-2xl" />
        <div className="absolute right-32 top-0 w-48 h-48 rounded-full bg-amber-500/10 pointer-events-none blur-xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-xs font-semibold text-emerald-200 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>రైతు బజార్ విక్రేత &bull; Mehdipatnam Stall #14</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Farmer Surplus Dispatch
            </h2>
            <p className="text-sm text-emerald-200/90 mt-1.5 max-w-xl leading-relaxed">
              Don’t let unsold vegetables spoil at market closing. Our AI automatically connects your surplus to nearby community kitchens, NGOs, hostels, and gaushalas within minutes.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="self-start sm:self-center px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>List Surplus Vegetables</span>
          </button>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-700/50">
          <div className="bg-emerald-800/40 backdrop-blur-xs p-3 rounded-xl border border-emerald-600/30">
            <span className="text-[11px] text-emerald-300 font-medium">Available for Match</span>
            <p className="text-xl font-extrabold text-white mt-0.5">{activeSurplusCount} Batches</p>
          </div>
          <div className="bg-emerald-800/40 backdrop-blur-xs p-3 rounded-xl border border-emerald-600/30">
            <span className="text-[11px] text-emerald-300 font-medium">Active Pickups</span>
            <p className="text-xl font-extrabold text-amber-300 mt-0.5">{inProgressPickups} Scheduled</p>
          </div>
          <div className="bg-emerald-800/40 backdrop-blur-xs p-3 rounded-xl border border-emerald-600/30">
            <span className="text-[11px] text-emerald-300 font-medium">Avg Match Velocity</span>
            <p className="text-xl font-extrabold text-emerald-300 mt-0.5">&lt; 4 Mins</p>
          </div>
          <div className="bg-emerald-800/40 backdrop-blur-xs p-3 rounded-xl border border-emerald-600/30">
            <span className="text-[11px] text-emerald-300 font-medium">Total Loss Avoided</span>
            <p className="text-xl font-extrabold text-white mt-0.5">₹ 14,200</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              statusFilter === 'all'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Listings ({listings.length})
          </button>
          <button
            onClick={() => setStatusFilter('available')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              statusFilter === 'available'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Awaiting Match ({activeSurplusCount})
          </button>
          <button
            onClick={() => setStatusFilter('active_pickup')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              statusFilter === 'active_pickup'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            In Transit / Scheduled ({inProgressPickups})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              statusFilter === 'completed'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed
          </button>
        </div>

        <span className="text-xs text-gray-500 font-medium">
          Showing {filteredListings.length} surplus entries
        </span>
      </div>

      {/* Surplus Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredListings.map((listing) => {
          const isAvailable = listing.status === 'available';
          const isScheduled = listing.status === 'pickup_scheduled';
          const isInTransit = listing.status === 'in_transit';
          const isCompleted = listing.status === 'completed';

          return (
            <div
              key={listing.id}
              className="bg-white rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Card Top */}
              <div>
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={listing.photoUrl}
                          alt={listing.vegetableName}
                          className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-xs"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-xs">
                          {listing.category === 'Leafy Greens' ? '🥬' : '🍅'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-gray-900 leading-snug">
                            {listing.vegetableName}
                          </h3>
                        </div>
                        <p className="text-xs text-emerald-800 font-semibold">{listing.teluguName}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {listing.rythuBazaarLocation} &bull; {listing.stallNumber}
                        </p>
                      </div>
                    </div>

                    <FreshnessBadge
                      level={listing.freshness}
                      score={listing.freshnessScore}
                      hoursRemaining={listing.hoursRemaining}
                      showDetails
                    />
                  </div>

                  {/* Quantity & Value Pill */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 block font-medium">Quantity</span>
                      <span className="font-extrabold text-gray-900 text-sm">{listing.quantityKg} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block font-medium">Price Recovery</span>
                      <span className="font-extrabold text-emerald-700 text-sm">
                        {listing.askingPricePerKg === 0 ? 'FREE Donation' : `₹${listing.askingPricePerKg}/kg`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block font-medium">Retail Value</span>
                      <span className="font-extrabold text-gray-700 text-sm">
                        ₹{(listing.quantityKg * listing.retailMarketPricePerKg).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Quality & Telugu Notes */}
                  <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                    {listing.qualitySummary}
                  </p>
                </div>
              </div>

              {/* Card Footer / Status Workflow */}
              <div className="p-4 bg-gray-50/70 border-t border-gray-100">
                {isAvailable && (
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>AI Match ready with nearby kitchens & NGOs</span>
                    </div>
                    <button
                      onClick={() => setSelectedListingForMatches(listing)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>View AI Matches</span>
                    </button>
                  </div>
                )}

                {(isScheduled || isInTransit) && (
                  <div className="space-y-3">
                    {/* Status Pill */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                        <span className="text-xs font-bold text-sky-900">
                          {isScheduled ? 'Pickup Scheduled' : 'Vehicle In Transit'}
                        </span>
                      </div>
                      <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md font-mono font-bold">
                        OTP: {listing.pickupOtp || '4921'}
                      </span>
                    </div>

                    {/* Matched Recipient Info */}
                    <div className="p-2.5 bg-white rounded-xl border border-sky-100 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{listing.matchedRecipientName}</span>
                        <span className="text-[11px] text-emerald-700 font-bold">
                          {listing.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Volunteer en route via Auto-Rickshaw &bull; Please keep crates ready at stall
                      </p>
                    </div>

                    {/* Advance Status Button for Farmer */}
                    <button
                      onClick={() => advancePickupStatus(listing.id)}
                      className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Truck className="w-4 h-4" />
                      <span>
                        {isScheduled ? 'Confirm Driver Arrival & Dispatch' : 'Mark Handover Completed'}
                      </span>
                    </button>
                  </div>
                )}

                {isCompleted && (
                  <div className="flex items-center justify-between bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-bold">Successfully Redistributed!</span>
                        <p className="text-[10px] text-emerald-700">
                          Handed to {listing.matchedRecipientName}
                        </p>
                      </div>
                    </div>
                    <span className="text-emerald-700 font-extrabold text-[11px] bg-white px-2 py-1 rounded-md border border-emerald-200">
                      0% Waste
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      <AddSurplusModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Matches Modal */}
      <FarmerMatchesModal
        listing={selectedListingForMatches}
        isOpen={!!selectedListingForMatches}
        onClose={() => setSelectedListingForMatches(null)}
      />
    </div>
  );
};
