import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  SurplusListing, 
  Recipient, 
  AppNotification, 
  ImpactStats, 
  ListingStatus 
} from '../types';
import { 
  INITIAL_SURPLUS_LISTINGS, 
  INITIAL_RECIPIENTS 
} from '../data/mockData';

interface AppContextType {
  currentRole: 'farmer' | 'recipient' | 'admin';
  setCurrentRole: (role: 'farmer' | 'recipient' | 'admin') => void;
  selectedRecipientId: string;
  setSelectedRecipientId: (id: string) => void;
  listings: SurplusListing[];
  recipients: Recipient[];
  notifications: AppNotification[];
  impactStats: ImpactStats;
  addListing: (listingData: Omit<SurplusListing, 'id' | 'createdAt' | 'status' | 'remainingKg'>) => SurplusListing;
  acceptMatch: (listingId: string, recipientId: string, matchScore: number) => void;
  rejectMatch: (listingId: string, recipientId: string) => void;
  advancePickupStatus: (listingId: string) => void;
  addRecipient: (recipientData: Omit<Recipient, 'id' | 'rating' | 'verifiedStatus'>) => void;
  updateRecipientNeeds: (recipientId: string, neededKg: number, requiredVegetables: string[]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDemoData: () => void;
  activeListingForModal: SurplusListing | null;
  setActiveListingForModal: (listing: SurplusListing | null) => void;
}

const STORAGE_KEYS = {
  LISTINGS: 'rythu_bazaar_listings_v1',
  RECIPIENTS: 'rythu_bazaar_recipients_v1',
  NOTIFICATIONS: 'rythu_bazaar_notifications_v1',
  ROLE: 'rythu_bazaar_role_v1',
  ACTIVE_RECIP: 'rythu_bazaar_active_recip_v1',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<'farmer' | 'recipient' | 'admin'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as 'farmer' | 'recipient' | 'admin') || 'farmer';
  });

  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_RECIP);
    return saved || 'rec_annapurna';
  });

  const [listings, setListings] = useState<SurplusListing[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved listings:', e);
      }
    }
    return INITIAL_SURPLUS_LISTINGS;
  });

  const [recipients, setRecipients] = useState<Recipient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECIPIENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved recipients:', e);
      }
    }
    return INITIAL_RECIPIENTS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse notifications:', e);
      }
    }
    return [
      {
        id: 'notif_1',
        title: '🌱 AI High-Priority Match Found',
        message: '35 kg Tomatoes at Mehdipatnam Stall #14 has 95% match with Annapurna Kitchen!',
        type: 'match_alert',
        timestamp: '15 mins ago',
        read: false,
        listingId: 'surplus_1',
      },
      {
        id: 'notif_2',
        title: '✅ Pickup Completed & Waste Prevented',
        message: '45 kg Methi & Greens safely redistributed to Sri Krishna Gaushala for cattle feed.',
        type: 'waste_prevented',
        timestamp: '1 hour ago',
        read: true,
        listingId: 'surplus_3',
      },
      {
        id: 'notif_3',
        title: '🚚 Van In Transit',
        message: 'Auto rickshaw en route to Erragadda Stall #33 for Bottle Gourd pickup (OTP: 5821).',
        type: 'pickup_update',
        timestamp: '25 mins ago',
        read: false,
        listingId: 'surplus_5',
      },
    ];
  });

  const [activeListingForModal, setActiveListingForModal] = useState<SurplusListing | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(recipients));
  }, [recipients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_RECIP, selectedRecipientId);
  }, [selectedRecipientId]);

  // Derived Impact Metrics
  const impactStats: ImpactStats = React.useMemo(() => {
    const completedOrActive = listings.filter((l) => l.status === 'completed' || l.status === 'in_transit' || l.status === 'pickup_scheduled');
    
    // Baseline historic impact from completed + active
    const redistributedKg = listings
      .filter((l) => l.status === 'completed' || l.status === 'in_transit')
      .reduce((sum, l) => sum + l.quantityKg, 320); // 320kg baseline from previous day

    const activeKg = listings
      .filter((l) => l.status === 'available' || l.status === 'matched')
      .reduce((sum, l) => sum + l.quantityKg, 0);

    const farmerSavings = listings
      .filter((l) => l.status === 'completed')
      .reduce((sum, l) => sum + l.quantityKg * (l.retailMarketPricePerKg * 0.75), 14200);

    const co2Saved = Math.round(redistributedKg * 1.9); // ~1.9 kg CO2e prevented per kg food saved
    const mealsServed = Math.round(redistributedKg * 2.5); // ~2.5 nutritious servings per kg

    const totalMatches = listings.filter((l) => l.status !== 'available').length + 18;

    return {
      totalKgRedistributed: redistributedKg,
      farmerLossAvoidedInr: Math.round(farmerSavings),
      totalMealsEquivalent: mealsServed,
      co2EmissionsSavedKg: co2Saved,
      activeSurplusKg: activeKg,
      totalMatchesCount: totalMatches,
    };
  }, [listings]);

  // Add new surplus listing
  const addListing = (listingData: Omit<SurplusListing, 'id' | 'createdAt' | 'status' | 'remainingKg'>) => {
    const newId = `surplus_${Date.now()}`;
    const newListing: SurplusListing = {
      ...listingData,
      id: newId,
      status: 'available',
      remainingKg: listingData.quantityKg,
      createdAt: new Date().toISOString(),
    };

    setListings((prev) => [newListing, ...prev]);

    // Send notification
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: `⚡ New Surplus Listed: ${newListing.vegetableName}`,
      message: `${newListing.quantityKg} kg listed at ${newListing.rythuBazaarLocation}. AI matching initiated!`,
      type: 'match_alert',
      timestamp: 'Just now',
      read: false,
      listingId: newId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newListing;
  };

  // Accept a match (either by farmer or recipient)
  const acceptMatch = (listingId: string, recipientId: string, matchScore: number) => {
    const recipient = recipients.find((r) => r.id === recipientId);
    if (!recipient) return;

    // Generate 4-digit pickup OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    setListings((prev) =>
      prev.map((l) => {
        if (l.id === listingId) {
          return {
            ...l,
            status: 'pickup_scheduled' as ListingStatus,
            matchedRecipientId: recipient.id,
            matchedRecipientName: recipient.name,
            matchedRecipientType: recipient.type,
            matchScore,
            pickupOtp: generatedOtp,
            pickupTimeline: {
              ...l.pickupTimeline,
              matchedAt: new Date().toISOString(),
              scheduledAt: new Date().toISOString(),
            },
          };
        }
        return l;
      })
    );

    // Update recipient needed quantity
    setRecipients((prev) =>
      prev.map((r) => {
        if (r.id === recipientId) {
          const matchedItem = listings.find((l) => l.id === listingId);
          const deduct = matchedItem ? matchedItem.quantityKg : 10;
          return {
            ...r,
            currentNeededKg: Math.max(0, r.currentNeededKg - deduct),
          };
        }
        return r;
      })
    );

    // Create Notification
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: `🤝 Match Confirmed: ${recipient.name}`,
      message: `Pickup scheduled for ${recipient.name} via ${recipient.vehicleType}. Pickup OTP: ${generatedOtp}`,
      type: 'pickup_update',
      timestamp: 'Just now',
      read: false,
      listingId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Reject a match (e.g. recipient lacks storage)
  const rejectMatch = (listingId: string, recipientId: string) => {
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'Match Declined',
      message: 'Listing released back to surplus pool for alternative recipient matching.',
      type: 'match_alert',
      timestamp: 'Just now',
      read: false,
      listingId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Move pickup status through timeline
  const advancePickupStatus = (listingId: string) => {
    setListings((prev) =>
      prev.map((l) => {
        if (l.id === listingId) {
          const now = new Date().toISOString();
          if (l.status === 'pickup_scheduled') {
            return {
              ...l,
              status: 'in_transit' as ListingStatus,
              pickupTimeline: {
                ...l.pickupTimeline,
                inTransitAt: now,
              },
            };
          } else if (l.status === 'in_transit') {
            return {
              ...l,
              status: 'completed' as ListingStatus,
              remainingKg: 0,
              pickupTimeline: {
                ...l.pickupTimeline,
                completedAt: now,
              },
            };
          }
        }
        return l;
      })
    );
  };

  // Add new recipient organization
  const addRecipient = (recipientData: Omit<Recipient, 'id' | 'rating' | 'verifiedStatus'>) => {
    const newRecipient: Recipient = {
      ...recipientData,
      id: `rec_${Date.now()}`,
      rating: 5.0,
      verifiedStatus: true,
      avatarColor: 'bg-emerald-700',
    };
    setRecipients((prev) => [newRecipient, ...prev]);
  };

  const updateRecipientNeeds = (recipientId: string, neededKg: number, requiredVegetables: string[]) => {
    setRecipients((prev) =>
      prev.map((r) => {
        if (r.id === recipientId) {
          return {
            ...r,
            currentNeededKg: neededKg,
            requiredVegetables,
          };
        }
        return r;
      })
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetToDemoData = () => {
    setListings(INITIAL_SURPLUS_LISTINGS);
    setRecipients(INITIAL_RECIPIENTS);
    localStorage.removeItem(STORAGE_KEYS.LISTINGS);
    localStorage.removeItem(STORAGE_KEYS.RECIPIENTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        selectedRecipientId,
        setSelectedRecipientId,
        listings,
        recipients,
        notifications,
        impactStats,
        addListing,
        acceptMatch,
        rejectMatch,
        advancePickupStatus,
        addRecipient,
        updateRecipientNeeds,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDemoData,
        activeListingForModal,
        setActiveListingForModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
