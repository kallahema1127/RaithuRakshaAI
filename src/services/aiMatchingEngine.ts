import { Recipient, SurplusListing, AIMatchRecommendation, DestinationType } from '../types';

/**
 * Calculates Haversine distance in km between two lat/lng pairs
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * AI Surplus Matcher Engine:
 * Generates ranked recommendations for a given surplus listing across registered recipients.
 */
export function generateAIMatches(
  listing: SurplusListing,
  recipients: Recipient[]
): AIMatchRecommendation[] {
  const recommendations: AIMatchRecommendation[] = [];

  for (const recipient of recipients) {
    // 1. Distance Calculation & Score (Max 30 pts)
    // Distance between vendor and recipient: shorter distance = higher score
    const actualDistance = calculateDistanceKm(
      listing.coordinates.lat,
      listing.coordinates.lng,
      recipient.coordinates.lat,
      recipient.coordinates.lng
    );
    const distanceKm = actualDistance > 0 ? actualDistance : recipient.distanceKmFromMarket;

    // Within 1km = 30pts, 2km = 26pts, 3km = 21pts, 5km = 14pts, >7km = 5pts
    let distanceScore = Math.max(5, Math.round(30 - distanceKm * 3.5));
    if (distanceScore > 30) distanceScore = 30;

    // 2. Quantity Compatibility Score (Max 25 pts)
    // How well the surplus quantity satisfies or fits the recipient's daily capacity and current needed amount
    let quantityFitScore = 15;
    let matchedQuantityKg = Math.min(listing.quantityKg, recipient.currentNeededKg);
    if (matchedQuantityKg === 0) {
      matchedQuantityKg = Math.min(listing.quantityKg, recipient.dailyCapacityKg);
    }

    const ratio = matchedQuantityKg / listing.quantityKg;
    if (ratio >= 0.8) {
      quantityFitScore = 25; // Can absorb most or all of the surplus
    } else if (ratio >= 0.5) {
      quantityFitScore = 20;
    } else if (ratio >= 0.25) {
      quantityFitScore = 15;
    } else {
      quantityFitScore = 8;
    }

    // 3. Freshness & Quality Suitability Score (Max 20 pts)
    let freshnessSuitabilityScore = 10;
    const recipientAcceptsFreshness = recipient.acceptsFreshness.includes(listing.freshness);

    if (listing.freshness === 'critical') {
      // Critical produce should prioritize animal shelters & composting
      if (recipient.type === 'animal_shelter' || recipient.type === 'composting_unit') {
        freshnessSuitabilityScore = 20; // Perfect diversion destination!
      } else if (recipientAcceptsFreshness) {
        freshnessSuitabilityScore = 12;
      } else {
        freshnessSuitabilityScore = 0; // Ineligible for direct human food consumption
      }
    } else if (listing.freshness === 'moderate') {
      // Moderate produce should go to high-turnover kitchens, hostels, food banks, or animal shelters
      if (recipient.type === 'community_kitchen' || recipient.type === 'hostel' || recipient.type === 'restaurant') {
        freshnessSuitabilityScore = 20;
      } else if (recipient.type === 'ngo' || recipient.type === 'food_bank') {
        freshnessSuitabilityScore = 16;
      } else if (recipient.type === 'animal_shelter') {
        freshnessSuitabilityScore = 14;
      } else {
        freshnessSuitabilityScore = 10;
      }
    } else {
      // 'fresh'
      if (recipient.type === 'community_kitchen' || recipient.type === 'ngo' || recipient.type === 'food_bank' || recipient.type === 'restaurant' || recipient.type === 'hostel' || recipient.type === 'household') {
        freshnessSuitabilityScore = 20;
      } else {
        // Fresh food shouldn't be wasted on compost if humans can eat it!
        freshnessSuitabilityScore = 6;
      }
    }

    // 4. Urgency & Spoilage Speed Score (Max 15 pts)
    // Vegetable hours remaining vs recipient pickup turnaround
    let urgencySpeedScore = 10;
    const isFastVehicle = recipient.vehicleType === 'Two-Wheeler' || recipient.vehicleType === 'Auto-Rickshaw';
    
    if (listing.hoursRemaining <= 6) {
      // Urgent: prioritize quick local transport
      if (distanceKm <= 2.0 && isFastVehicle) {
        urgencySpeedScore = 15;
      } else if (distanceKm <= 3.0) {
        urgencySpeedScore = 12;
      } else {
        urgencySpeedScore = 6;
      }
    } else if (listing.hoursRemaining <= 16) {
      urgencySpeedScore = distanceKm <= 3.5 ? 14 : 10;
    } else {
      urgencySpeedScore = 12;
    }

    // 5. Vegetable Specific Requirement Match & Reliability (Max 10 pts)
    let reliabilityScore = 6;
    const wantsVegetable = recipient.requiredVegetables.some(
      (v) => v.toLowerCase().includes(listing.vegetableName.toLowerCase()) || listing.vegetableName.toLowerCase().includes(v.toLowerCase())
    );
    if (wantsVegetable) {
      reliabilityScore += 3;
    }
    if (recipient.verifiedStatus) {
      reliabilityScore += 1;
    }

    // Total Match Score (0 - 100)
    let totalScore = distanceScore + quantityFitScore + freshnessSuitabilityScore + urgencySpeedScore + reliabilityScore;
    
    // Penalize if recipient explicitly does not accept this freshness level
    if (!recipientAcceptsFreshness) {
      totalScore = Math.max(15, totalScore - 35);
    }

    // Clamp score
    totalScore = Math.min(99, Math.max(10, Math.round(totalScore)));

    // Travel time estimate: approx 3 mins per km in city traffic + 5 min loading
    const estimatedTravelMins = Math.round(distanceKm * 3.5 + 5);

    // AI Reasoning sentence construction
    let aiReasoning = '';
    let recommendedDestination: DestinationType = 'human_consumption';

    if (listing.freshness === 'critical') {
      if (recipient.type === 'animal_shelter') {
        recommendedDestination = 'animal_feed';
        aiReasoning = `High-priority diversion: ${listing.quantityKg}kg of wilted produce provides vital roughage for 40+ cows at ${recipient.name} (${distanceKm} km away).`;
      } else if (recipient.type === 'composting_unit') {
        recommendedDestination = 'composting';
        aiReasoning = `Zero waste diversion: Converts organic produce into high-nitrogen soil bio-fertilizer within ${distanceKm} km.`;
      } else {
        recommendedDestination = 'animal_feed';
        aiReasoning = `Rapid redistribution required within ${listing.hoursRemaining} hours before full decay.`;
      }
    } else if (listing.freshness === 'moderate') {
      recommendedDestination = 'human_consumption';
      aiReasoning = `${recipient.name} is prepping immediate evening cooking. Located just ${distanceKm} km away via ${recipient.vehicleType} (${estimatedTravelMins}m).`;
    } else {
      recommendedDestination = 'human_consumption';
      aiReasoning = `Exceptional match (${totalScore}%): High demand for ${listing.vegetableName}, only ${distanceKm} km from ${listing.rythuBazaarLocation}.`;
    }

    recommendations.push({
      recipient,
      listingId: listing.id,
      matchScore: totalScore,
      scoreBreakdown: {
        distanceScore,
        quantityFitScore,
        freshnessSuitabilityScore,
        urgencySpeedScore,
        reliabilityScore,
      },
      matchedQuantityKg,
      distanceKm,
      estimatedTravelMins,
      aiReasoning,
      urgencyLevel: listing.hoursRemaining <= 6 ? 'high' : listing.hoursRemaining <= 16 ? 'medium' : 'normal',
      priorityRank: 0,
      recommendedDestination,
    });
  }

  // Sort by match score descending
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  // Assign priority ranks
  return recommendations.map((rec, index) => ({
    ...rec,
    priorityRank: index + 1,
  }));
}
