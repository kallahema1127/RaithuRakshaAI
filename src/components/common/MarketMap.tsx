import React, { useState } from 'react';
import { SurplusListing, Recipient } from '../../types';
import { 
  Building2, 
  MapPin, 
  Truck, 
  Sparkles, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  Filter, 
  RefreshCw,
  Info
} from 'lucide-react';

interface MarketMapProps {
  listings: SurplusListing[];
  recipients: Recipient[];
  selectedListing?: SurplusListing | null;
  onSelectListing?: (listing: SurplusListing) => void;
  onSelectRecipient?: (recipient: Recipient) => void;
  height?: string;
}

export const MarketMap: React.FC<MarketMapProps> = ({
  listings,
  recipients,
  selectedListing,
  onSelectListing,
  onSelectRecipient,
  height = 'h-96',
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'kitchens' | 'shelters' | 'ngos'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredNode, setHoveredNode] = useState<{ type: 'bazaar' | 'recipient'; data: any } | null>(null);

  // Center coordinate roughly around Mehdipatnam Rythu Bazaar (lat: 17.3916, lng: 78.4398)
  const centerLat = 17.3916;
  const centerLng = 78.4398;

  // Map geographic coords to SVG viewBox (600 x 400)
  // Scale: 0.01 deg lat ~= 1.1km, 0.01 deg lng ~= 1.05km
  const latRange = 0.12; // ~13km north-south
  const lngRange = 0.14; // ~15km east-west

  const toSvgX = (lng: number) => {
    const norm = (lng - (centerLng - lngRange / 2)) / lngRange;
    return Math.max(40, Math.min(560, norm * 600));
  };

  const toSvgY = (lat: number) => {
    // Invert Y because SVG 0 is top
    const norm = ((centerLat + latRange / 2) - lat) / latRange;
    return Math.max(40, Math.min(360, norm * 400));
  };

  const filteredRecipients = recipients.filter((r) => {
    if (activeFilter === 'kitchens') return r.type === 'community_kitchen' || r.type === 'food_bank';
    if (activeFilter === 'shelters') return r.type === 'animal_shelter' || r.type === 'composting_unit';
    if (activeFilter === 'ngos') return r.type === 'ngo' || r.type === 'hostel';
    return true;
  });

  // Active in-transit or scheduled routes to animate
  const activeRoutes = listings.filter(
    (l) => (l.status === 'in_transit' || l.status === 'pickup_scheduled') && l.matchedRecipientId
  );

  return (
    <div className={`relative w-full ${height} bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col`}>
      {/* Map Control Header Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto">
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">Rythu Bazaar Logistics Radar</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
              activeFilter === 'all'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Nodes
          </button>
          <button
            onClick={() => setActiveFilter('kitchens')}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
              activeFilter === 'kitchens'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kitchens
          </button>
          <button
            onClick={() => setActiveFilter('shelters')}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
              activeFilter === 'shelters'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Animal / Compost
          </button>
        </div>
      </div>

      {/* Main SVG Radar Canvas */}
      <div className="relative w-full h-full flex-1">
        <svg
          viewBox="0 0 600 400"
          className="w-full h-full object-cover select-none"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.3s ease' }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1E293B" strokeWidth="0.8" opacity="0.6" />
            </pattern>
            {/* Radial Radar Glow */}
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>

          {/* Background Grid */}
          <rect width="600" height="400" fill="#090E17" />
          <rect width="600" height="400" fill="url(#grid)" />

          {/* Central Bazaar Distance Range Rings */}
          <circle cx="300" cy="200" r="160" fill="url(#radarGlow)" />
          <circle cx="300" cy="200" r="60" fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="300" cy="200" r="120" fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="300" cy="200" r="180" fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />

          {/* Distance Labels */}
          <text x="365" y="196" fill="#475569" fontSize="9" fontFamily="monospace">1.5 km</text>
          <text x="425" y="196" fill="#475569" fontSize="9" fontFamily="monospace">3.0 km</text>
          <text x="485" y="196" fill="#475569" fontSize="9" fontFamily="monospace">5.0 km</text>

          {/* Active Route Lines */}
          {activeRoutes.map((listing) => {
            const recip = recipients.find((r) => r.id === listing.matchedRecipientId);
            if (!recip) return null;
            const startX = toSvgX(listing.coordinates.lng);
            const startY = toSvgY(listing.coordinates.lat);
            const endX = toSvgX(recip.coordinates.lng);
            const endY = toSvgY(recip.coordinates.lat);

            return (
              <g key={`route-${listing.id}`}>
                {/* Glow Line */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#10B981"
                  strokeWidth="3"
                  opacity="0.3"
                  strokeLinecap="round"
                />
                {/* Dashed animated line */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="url(#routeGradient)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
                {/* Midpoint Truck/Auto Icon Indicator */}
                <circle
                  cx={(startX + endX) / 2}
                  cy={(startY + endY) / 2}
                  r="7"
                  fill="#0284C7"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          {/* Recipient Nodes */}
          {filteredRecipients.map((recipient) => {
            const rx = toSvgX(recipient.coordinates.lng);
            const ry = toSvgY(recipient.coordinates.lat);
            const isKitchen = recipient.type === 'community_kitchen' || recipient.type === 'food_bank';
            const isShelter = recipient.type === 'animal_shelter' || recipient.type === 'composting_unit';

            const fillColor = isKitchen ? '#10B981' : isShelter ? '#F59E0B' : '#6366F1';

            return (
              <g
                key={recipient.id}
                className="cursor-pointer transition-transform duration-200 hover:scale-125"
                onClick={() => onSelectRecipient?.(recipient)}
                onMouseEnter={() => setHoveredNode({ type: 'recipient', data: recipient })}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Ping ring for high demand */}
                {recipient.currentNeededKg > 30 && (
                  <circle cx={rx} cy={ry} r="14" fill={fillColor} opacity="0.2" className="animate-ping" />
                )}
                {/* Outer badge */}
                <circle cx={rx} cy={ry} r="10" fill="#0F172A" stroke={fillColor} strokeWidth="2" />
                <circle cx={rx} cy={ry} r="5" fill={fillColor} />
                {/* Name Label */}
                <text
                  x={rx}
                  y={ry + 18}
                  textAnchor="middle"
                  fill="#CBD5E1"
                  fontSize="8.5"
                  fontWeight="600"
                  className="drop-shadow"
                >
                  {recipient.name.split(' ')[0]}
                </text>
              </g>
            );
          })}

          {/* Rythu Bazaar Hub Pins */}
          {listings.map((listing) => {
            const bx = toSvgX(listing.coordinates.lng);
            const by = toSvgY(listing.coordinates.lat);
            const isSelected = selectedListing?.id === listing.id;

            return (
              <g
                key={listing.id}
                className="cursor-pointer"
                onClick={() => onSelectListing?.(listing)}
                onMouseEnter={() => setHoveredNode({ type: 'bazaar', data: listing })}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {isSelected && (
                  <circle cx={bx} cy={by} r="16" fill="#F43F5E" opacity="0.3" className="animate-ping" />
                )}
                <circle
                  cx={bx}
                  cy={by}
                  r="9"
                  fill="#F43F5E"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <circle cx={bx} cy={by} r="4" fill="#FFFFFF" />
                <text
                  x={bx}
                  y={by - 12}
                  textAnchor="middle"
                  fill="#F87171"
                  fontSize="8.5"
                  fontWeight="700"
                >
                  {listing.stallNumber} ({listing.quantityKg}kg)
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredNode && (
          <div className="absolute bottom-4 left-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl text-xs max-w-xs animate-in fade-in duration-150">
            {hoveredNode.type === 'recipient' ? (
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{hoveredNode.data.name}</span>
                </div>
                <p className="text-slate-300 text-[11px] mb-1.5">{hoveredNode.data.locationName}</p>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 bg-slate-800/60 p-2 rounded-lg">
                  <div>Capacity: <span className="text-white font-medium">{hoveredNode.data.dailyCapacityKg} kg</span></div>
                  <div>Urgent Need: <span className="text-amber-400 font-medium">{hoveredNode.data.currentNeededKg} kg</span></div>
                  <div>Vehicle: <span className="text-slate-200">{hoveredNode.data.vehicleType}</span></div>
                  <div>Rating: <span className="text-amber-300">★ {hoveredNode.data.rating}</span></div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{hoveredNode.data.rythuBazaarLocation} ({hoveredNode.data.stallNumber})</span>
                </div>
                <p className="text-white font-semibold text-xs mb-1">
                  {hoveredNode.data.vegetableName} - {hoveredNode.data.quantityKg} kg
                </p>
                <div className="text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Farmer: {hoveredNode.data.farmerName}</span>
                  <span className="text-emerald-400 font-semibold">{hoveredNode.data.askingPricePerKg === 0 ? 'FREE Donation' : `₹${hoveredNode.data.askingPricePerKg}/kg`}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Footer Legend & Zoom */}
      <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Rythu Bazaar Stalls</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Community Kitchens</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Gaushalas & Bio-Compost</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
            <Info className="w-3 h-3" />
            <span>Click any node to inspect & dispatch</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.9, z - 0.1))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
