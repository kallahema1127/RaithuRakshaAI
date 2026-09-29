import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RecipientType, FreshnessLevel } from '../../types';
import { VEGETABLE_CATALOG } from '../../data/mockData';
import { 
  X, 
  Building2, 
  MapPin, 
  Phone, 
  Truck, 
  Scale, 
  Check, 
  Plus 
} from 'lucide-react';

interface RegisterRecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterRecipientModal: React.FC<RegisterRecipientModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addRecipient, setSelectedRecipientId } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<RecipientType>('community_kitchen');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [locationName, setLocationName] = useState('');
  const [distanceKm, setDistanceKm] = useState(1.5);
  const [dailyCapacityKg, setDailyCapacityKg] = useState(50);
  const [currentNeededKg, setCurrentNeededKg] = useState(30);
  const [vehicleType, setVehicleType] = useState<'Two-Wheeler' | 'Auto-Rickshaw' | 'Mini-Van' | 'Bicycle/Pushcart'>('Auto-Rickshaw');
  const [pickupWindow, setPickupWindow] = useState('5:00 PM - 8:30 PM (Evening batch)');
  const [acceptsFresh, setAcceptsFresh] = useState(true);
  const [acceptsModerate, setAcceptsModerate] = useState(true);
  const [acceptsCritical, setAcceptsCritical] = useState(false);
  const [selectedVegs, setSelectedVegs] = useState<string[]>([
    'Tomatoes (Desi)',
    'Palak (Spinach)',
    'Potatoes (Alu)',
  ]);

  if (!isOpen) return null;

  const toggleVeg = (vegName: string) => {
    if (selectedVegs.includes(vegName)) {
      setSelectedVegs(selectedVegs.filter((v) => v !== vegName));
    } else {
      setSelectedVegs([...selectedVegs, vegName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactPerson || !phone) return;

    const acceptedTiers: FreshnessLevel[] = [];
    if (acceptsFresh) acceptedTiers.push('fresh');
    if (acceptsModerate) acceptedTiers.push('moderate');
    if (acceptsCritical) acceptedTiers.push('critical');

    // Approximate coords near Hyderabad center
    const coords = {
      lat: 17.3916 + (Math.random() - 0.5) * 0.04,
      lng: 78.4398 + (Math.random() - 0.5) * 0.04,
    };

    addRecipient({
      name,
      type,
      contactPerson,
      phone,
      address: address || `${locationName}, Hyderabad`,
      locationName: locationName || `${distanceKm} km from Market`,
      coordinates: coords,
      distanceKmFromMarket: Number(distanceKm),
      requiredVegetables: selectedVegs.length > 0 ? selectedVegs : ['Tomatoes (Desi)'],
      dailyCapacityKg: Number(dailyCapacityKg),
      currentNeededKg: Number(currentNeededKg),
      acceptsFreshness: acceptedTiers.length > 0 ? acceptedTiers : ['fresh', 'moderate'],
      pickupWindow,
      vehicleType,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/60 rounded-xl">
              <Building2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Register Recipient Organization</h2>
              <p className="text-xs text-emerald-200">
                Join Rythu Bazaar Food Waste Elimination Network
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Org Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Organization / Account Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Akshaya Anna Daan Kitchen"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Recipient Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RecipientType)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="community_kitchen">Community Kitchen (Daily meals)</option>
                <option value="ngo">NGO / Relief Organization</option>
                <option value="food_bank">Food Bank / Hunger Center</option>
                <option value="hostel">Hostel Mess / PG</option>
                <option value="restaurant">Restaurant / Curries</option>
                <option value="animal_shelter">Gaushala / Animal Shelter</option>
                <option value="composting_unit">Composting / Bio-gas Unit</option>
                <option value="household">Household / Community Cluster</option>
              </select>
            </div>
          </div>

          {/* Contact Person & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Contact Person & Role
              </label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Ramesh Kumar (Coordinator)"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Contact Mobile Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98480 XXXXX"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Location & Distance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Address / Neighborhood Area
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Gudimalkapur, Mehdipatnam"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Distance from Market (km)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.2"
                max="25"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Capacity, Needed Kg & Transport Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Daily Capacity (kg)
              </label>
              <input
                type="number"
                min="5"
                max="500"
                value={dailyCapacityKg}
                onChange={(e) => setDailyCapacityKg(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Urgent Need Today (kg)
              </label>
              <input
                type="number"
                min="5"
                max={dailyCapacityKg}
                value={currentNeededKg}
                onChange={(e) => setCurrentNeededKg(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Transport Mode
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-medium bg-white"
              >
                <option value="Two-Wheeler">Two-Wheeler / Bike</option>
                <option value="Auto-Rickshaw">Auto-Rickshaw</option>
                <option value="Mini-Van">Mini-Van / Cargo Auto</option>
                <option value="Bicycle/Pushcart">Bicycle / Pushcart</option>
              </select>
            </div>
          </div>

          {/* Freshness acceptance checkboxes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Acceptable Freshness Tiers
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={acceptsFresh}
                  onChange={(e) => setAcceptsFresh(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-emerald-900">🟢 Fresh</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={acceptsModerate}
                  onChange={(e) => setAcceptsModerate(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-amber-900">🟡 Moderate</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={acceptsCritical}
                  onChange={(e) => setAcceptsCritical(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-rose-900">🔴 Critical</span>
              </label>
            </div>
          </div>

          {/* Vegetables Required */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Vegetables Required (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
              {VEGETABLE_CATALOG.map((veg) => {
                const isSelected = selectedVegs.includes(veg.name);
                return (
                  <button
                    key={veg.name}
                    type="button"
                    onClick={() => toggleVeg(veg.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>{veg.iconEmoji}</span>
                    <span>{veg.name.split(' ')[0]}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pickup Window */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Pickup Availability Window
            </label>
            <input
              type="text"
              value={pickupWindow}
              onChange={(e) => setPickupWindow(e.target.value)}
              placeholder="e.g. 5:00 PM - 8:30 PM (Evening batch)"
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              Register & Enable AI Matching
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
