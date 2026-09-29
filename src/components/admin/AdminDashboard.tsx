import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FreshnessBadge } from '../common/FreshnessBadge';
import { MarketMap } from '../common/MarketMap';
import { 
  BarChart3, 
  TrendingUp, 
  Leaf, 
  IndianRupee, 
  Scale, 
  Users, 
  Building2, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertTriangle, 
  Download, 
  Search, 
  Filter,
  Sparkles,
  HeartHandshake
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { listings, recipients, impactStats } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'listings' | 'organizations'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [bazaarFilter, setBazaarFilter] = useState('all');

  const filteredListings = listings.filter((l) => {
    const matchesSearch = 
      l.vegetableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.rythuBazaarLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBazaar = bazaarFilter === 'all' || l.rythuBazaarLocation.includes(bazaarFilter);

    return matchesSearch && matchesBazaar;
  });

  // Monthly analytics data
  const monthlyData = [
    { month: 'Apr', kg: 1420, inr: 58000, co2: 2700 },
    { month: 'May', kg: 1980, inr: 81000, co2: 3760 },
    { month: 'Jun', kg: 2450, inr: 98500, co2: 4655 },
    { month: 'Jul', kg: 3120, inr: 124800, co2: 5928 },
    { month: 'Aug', kg: 3890, inr: 155600, co2: 7391 },
    { month: 'Sep (Current)', kg: 4650, inr: 186000, co2: 8835 },
  ];

  const maxKg = Math.max(...monthlyData.map((d) => d.kg));

  const exportCsv = () => {
    const headers = ['ID', 'Vegetable', 'Quantity(kg)', 'Freshness', 'Farmer', 'Market', 'Status', 'Matched Recipient', 'Score'];
    const rows = listings.map((l) => [
      l.id,
      l.vegetableName,
      l.quantityKg,
      l.freshness,
      `"${l.farmerName}"`,
      `"${l.rythuBazaarLocation}"`,
      l.status,
      `"${l.matchedRecipientName || 'N/A'}"`,
      l.matchScore || 'N/A',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rythu_bazaar_surplus_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
                మార్కెట్ అడ్మిన్ &bull; Market Supervisor
              </span>
              <span className="text-xs text-slate-300">Govt. of Telangana / AP Rythu Bazaar Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Food Waste Elimination &amp; Surplus Audit
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Real-time monitoring of vegetable surplus generation, AI algorithmic matching, logistics handovers, and economic recovery for farmers.
            </p>
          </div>

          <button
            onClick={exportCsv}
            className="self-start sm:self-center px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit CSV Report</span>
          </button>
        </div>

        {/* 4 Primary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-medium">Total Food Waste Prevented</span>
              <Leaf className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              {impactStats.totalKgRedistributed.toLocaleString('en-IN')} <span className="text-sm font-semibold text-emerald-400">kg</span>
            </p>
            <span className="text-[11px] text-emerald-300 mt-1 inline-block">
              ↑ +18.4% vs last month
            </span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-medium">Farmer Loss Avoided</span>
              <IndianRupee className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-300">
              ₹ {impactStats.farmerLossAvoidedInr.toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-amber-300 mt-1 inline-block">
              Recovered to smallholders
            </span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-medium">Nutritious Meals Served</span>
              <HeartHandshake className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              {impactStats.totalMealsEquivalent.toLocaleString('en-IN')} <span className="text-sm font-semibold text-rose-300">meals</span>
            </p>
            <span className="text-[11px] text-slate-300 mt-1 inline-block">
              Via Annapurna &amp; NGOs
            </span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-medium">CO₂ Emissions Averted</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-sky-300">
              {impactStats.co2EmissionsSavedKg.toLocaleString('en-IN')} <span className="text-sm font-semibold text-sky-200">kg CO₂e</span>
            </p>
            <span className="text-[11px] text-slate-300 mt-1 inline-block">
              Methane landfill avoidance
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'overview'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Analytics &amp; Charts
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'map'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Logistics Radar Map
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'listings'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          All Surplus Listings ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab('organizations')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'organizations'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Recipient Directory ({recipients.length})
        </button>
      </div>

      {/* Tab 1: Analytics & Charts */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trend Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Monthly Waste-Reduction Growth (kg Redistributed)
                  </h3>
                  <p className="text-xs text-gray-500">Tracked across all Hyderabad Rythu Bazaars in 2026</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  +227% YTD Growth
                </span>
              </div>

              {/* Bar Chart Visualization */}
              <div className="h-56 flex items-end justify-between gap-3 pt-8 pb-2 px-2 border-b border-gray-100">
                {monthlyData.map((d) => {
                  const heightPercent = Math.round((d.kg / maxKg) * 100);
                  return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[10px] font-bold text-gray-500 group-hover:text-emerald-700">
                        {d.kg} kg
                      </span>
                      <div className="w-full max-w-[48px] bg-emerald-100 hover:bg-emerald-600 rounded-t-xl transition-all duration-300 flex items-end overflow-hidden" style={{ height: `${heightPercent}%` }}>
                        <div className="w-full bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-t-xl" style={{ height: '100%' }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 truncate w-full text-center">
                        {d.month.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-3">
                <span>Direct value to farmers: ~₹40/kg equivalent value</span>
                <span>Peak redistribution time: 5:30 PM - 8:00 PM</span>
              </div>
            </div>

            {/* Destination Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  Redistribution by Destination
                </h3>
                <p className="text-xs text-gray-500 mb-4">AI routing allocation breakdown</p>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-700">Community Kitchens &amp; Food Banks</span>
                      <span className="text-emerald-700">55%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: '55%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-700">Animal Shelters &amp; Gaushalas</span>
                      <span className="text-amber-600">28%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '28%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-700">Hostels &amp; Budget Mess</span>
                      <span className="text-indigo-600">12%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: '12%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-700">Bio-Composting &amp; Methanation</span>
                      <span className="text-slate-600">5%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-slate-500 h-full rounded-full" style={{ width: '5%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 mt-4">
                <strong>Zero Waste Policy:</strong> 100% of produce unfit for human consumption is diverted directly to Gaushala feed or bio-fertilizer.
              </div>
            </div>
          </div>

          {/* Quick Embedded Radar View */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Live Dispatch Logistics Radar
                </h3>
                <p className="text-xs text-gray-500">Real-time geospatial layout of stalls, recipients &amp; active transit routes</p>
              </div>
              <button
                onClick={() => setActiveTab('map')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                Expand Full Map →
              </button>
            </div>
            <MarketMap listings={listings} recipients={recipients} height="h-80" />
          </div>
        </div>
      )}

      {/* Tab 2: Full Radar Map */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-gray-200">
            <MarketMap listings={listings} recipients={recipients} height="h-[520px]" />
          </div>
        </div>
      )}

      {/* Tab 3: Master Listings Audit Table */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search vegetable, farmer or market..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-300 text-xs bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={bazaarFilter}
                onChange={(e) => setBazaarFilter(e.target.value)}
                className="p-1.5 rounded-xl border border-gray-300 text-xs font-medium bg-white"
              >
                <option value="all">All Rythu Bazaars</option>
                <option value="Mehdipatnam">Mehdipatnam</option>
                <option value="Erragadda">Erragadda</option>
                <option value="Kukatpally">Kukatpally</option>
              </select>

              <button
                onClick={exportCsv}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-100/70 text-gray-900 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Produce &amp; Details</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Freshness Tier</th>
                  <th className="px-4 py-3">Rythu Bazaar Stall</th>
                  <th className="px-4 py-3">Status &amp; Match</th>
                  <th className="px-4 py-3 text-right">Farmer Loss Avoided</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredListings.map((listing) => {
                  return (
                    <tr key={listing.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={listing.photoUrl}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-gray-100"
                          />
                          <div>
                            <span className="font-bold text-gray-900 block">{listing.vegetableName}</span>
                            <span className="text-[10px] text-gray-500">{listing.teluguName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-extrabold text-gray-900">
                        {listing.quantityKg} kg
                      </td>
                      <td className="px-4 py-3">
                        <FreshnessBadge level={listing.freshness} score={listing.freshnessScore} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900 block">{listing.rythuBazaarLocation}</span>
                        <span className="text-[11px] text-gray-500">{listing.stallNumber} &bull; {listing.farmerName}</span>
                      </td>
                      <td className="px-4 py-3">
                        {listing.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Redistributed to {listing.matchedRecipientName?.split(' ')[0]}
                          </span>
                        ) : listing.status === 'in_transit' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full animate-pulse">
                            <Truck className="w-3 h-3" />
                            In Transit (OTP: {listing.pickupOtp})
                          </span>
                        ) : listing.status === 'pickup_scheduled' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            Pickup Scheduled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                            Available in Pool
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">
                        ₹{(listing.quantityKg * listing.retailMarketPricePerKg * 0.75).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Recipient Directory */}
      {activeTab === 'organizations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipients.map((rec) => (
            <div key={rec.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{rec.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{rec.locationName}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                    ★ {rec.rating}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 bg-gray-50 rounded-xl text-xs text-gray-600">
                  <div>Capacity: <strong className="text-gray-900">{rec.dailyCapacityKg} kg/day</strong></div>
                  <div>Transport: <strong className="text-gray-900">{rec.vehicleType}</strong></div>
                  <div>Contact: <span className="text-gray-800 font-medium">{rec.contactPerson}</span></div>
                  <div>Phone: <span className="text-emerald-700 font-medium">{rec.phone}</span></div>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] text-gray-500 font-semibold block mb-1">Needs:</span>
                  <div className="flex flex-wrap gap-1">
                    {rec.requiredVegetables.map((v) => (
                      <span key={v} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                        {v.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Govt Partner
                </span>
                <span className="text-gray-400">ID: {rec.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
