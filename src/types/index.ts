export type FreshnessLevel = 'fresh' | 'moderate' | 'critical';

export type DestinationType = 'human_consumption' | 'animal_feed' | 'composting' | 'processing';

export type RecipientType = 
  | 'ngo' 
  | 'community_kitchen' 
  | 'food_bank' 
  | 'restaurant' 
  | 'hostel' 
  | 'animal_shelter' 
  | 'composting_unit' 
  | 'household';

export type ListingStatus = 
  | 'available' 
  | 'matched' 
  | 'pickup_scheduled' 
  | 'in_transit' 
  | 'completed' 
  | 'cancelled';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface SurplusListing {
  id: string;
  vegetableName: string;
  teluguName: string;
  category: 'Leafy Greens' | 'Fruit Vegetables' | 'Root Vegetables' | 'Gourds' | 'Alliums & Chillies';
  quantityKg: number;
  remainingKg: number;
  freshness: FreshnessLevel;
  freshnessScore: number; // 0 - 100
  hoursRemaining: number;
  recommendedDestination: DestinationType;
  qualitySummary: string;
  farmerName: string;
  farmerPhone: string;
  stallNumber: string;
  rythuBazaarLocation: string;
  coordinates: Coordinates;
  availablePickupUntil: string; // e.g. "Today, 8:00 PM"
  askingPricePerKg: number; // 0 = Free donation, >0 = nominal recovery price
  retailMarketPricePerKg: number;
  photoUrl: string;
  notes?: string;
  status: ListingStatus;
  createdAt: string;
  // Match & Tracking
  matchedRecipientId?: string;
  matchedRecipientName?: string;
  matchedRecipientType?: RecipientType;
  matchScore?: number;
  pickupOtp?: string;
  pickupTimeline?: {
    matchedAt?: string;
    scheduledAt?: string;
    inTransitAt?: string;
    completedAt?: string;
  };
}

export interface Recipient {
  id: string;
  name: string;
  type: RecipientType;
  contactPerson: string;
  phone: string;
  address: string;
  locationName: string;
  coordinates: Coordinates;
  distanceKmFromMarket: number;
  requiredVegetables: string[]; // e.g. ["Tomatoes", "Palak (Spinach)", "Methi", "Potatoes"]
  dailyCapacityKg: number;
  currentNeededKg: number;
  acceptsFreshness: FreshnessLevel[];
  pickupWindow: string; // e.g. "5:00 PM - 8:30 PM"
  vehicleType: 'Two-Wheeler' | 'Auto-Rickshaw' | 'Mini-Van' | 'Bicycle/Pushcart';
  verifiedStatus: boolean;
  rating: number; // 1.0 to 5.0
  avatarColor?: string;
}

export interface AIMatchRecommendation {
  recipient: Recipient;
  listingId: string;
  matchScore: number; // 0 - 100
  scoreBreakdown: {
    distanceScore: number;        // Max 30
    quantityFitScore: number;     // Max 25
    freshnessSuitabilityScore: number; // Max 20
    urgencySpeedScore: number;    // Max 15
    reliabilityScore: number;     // Max 10
  };
  matchedQuantityKg: number;
  distanceKm: number;
  estimatedTravelMins: number;
  aiReasoning: string;
  urgencyLevel: 'high' | 'medium' | 'normal';
  priorityRank: number;
  recommendedDestination: DestinationType;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'match_alert' | 'pickup_update' | 'expiry_warning' | 'waste_prevented';
  timestamp: string;
  read: boolean;
  listingId?: string;
}

export interface ImpactStats {
  totalKgRedistributed: number;
  farmerLossAvoidedInr: number;
  totalMealsEquivalent: number;
  co2EmissionsSavedKg: number;
  activeSurplusKg: number;
  totalMatchesCount: number;
}
