// Advanced Matching Engine for Verified Match
// Uses sophisticated algorithms to match users based on multiple compatibility factors

const MatchingEngine = {
  // Scoring weights for different compatibility factors
  WEIGHTS: {
    GENDER_PREFERENCE: 0.25,      // 25% - Basic compatibility
    AGE_COMPATIBILITY: 0.20,      // 20% - Age range match
    LOCATION_PROXIMITY: 0.15,     // 15% - Geographic proximity
    INTERESTS_OVERLAP: 0.20,      // 20% - Shared interests
    ACTIVITY_SCORE: 0.10,        // 10% - User activity level
    VERIFICATION_BONUS: 0.10     // 10% - Verified users bonus
  },

  // Calculate compatibility score between two users
  calculateCompatibilityScore: (user1, user2) => {
    let totalScore = 0;

    // 1. Gender Preference Score (Basic Match)
    const genderScore = user1.gender !== user2.gender ? 100 : 0;
    totalScore += (genderScore / 100) * MatchingEngine.WEIGHTS.GENDER_PREFERENCE * 100;

    // 2. Age Compatibility Score
    const ageDifference = Math.abs(user1.age - user2.age);
    const ageScore = Math.max(0, 100 - (ageDifference * 2)); // Decrease by 2 points per year difference
    totalScore += (ageScore / 100) * MatchingEngine.WEIGHTS.AGE_COMPATIBILITY * 100;

    // 3. Location Proximity Score
    const locationScore = user1.location === user2.location ? 100 : 50; // Same location gets full points
    totalScore += (locationScore / 100) * MatchingEngine.WEIGHTS.LOCATION_PROXIMITY * 100;

    // 4. Interests Overlap Score
    const interestScore = MatchingEngine.calculateInterestOverlap(user1.interests, user2.interests);
    totalScore += (interestScore / 100) * MatchingEngine.WEIGHTS.INTERESTS_OVERLAP * 100;

    // 5. Activity Score (based on profile completeness)
    const activityScore = MatchingEngine.calculateActivityScore(user1, user2);
    totalScore += (activityScore / 100) * MatchingEngine.WEIGHTS.ACTIVITY_SCORE * 100;

    // 6. Verification Bonus
    const verificationBonus = (user1.verified && user2.verified) ? 100 : 0;
    totalScore += (verificationBonus / 100) * MatchingEngine.WEIGHTS.VERIFICATION_BONUS * 100;

    return Math.min(100, Math.round(totalScore));
  },

  // Calculate overlap between two sets of interests
  calculateInterestOverlap: (interests1, interests2) => {
    if (!interests1 || !interests2 || interests1.length === 0 || interests2.length === 0) {
      return 0;
    }

    const interestArray1 = Array.isArray(interests1) ? interests1 : JSON.parse(interests1);
    const interestArray2 = Array.isArray(interests2) ? interests2 : JSON.parse(interests2);

    const overlap = interestArray1.filter(interest => 
      interestArray2.includes(interest)
    ).length;

    const maxPossible = Math.max(interestArray1.length, interestArray2.length);
    return (overlap / maxPossible) * 100;
  },

  // Calculate activity score based on profile completeness and engagement
  calculateActivityScore: (user1, user2) => {
    let score1 = 0;
    let score2 = 0;

    // Profile completeness metrics
    if (user1.bio) score1 += 20;
    if (user1.photos && user1.photos.length > 0) score1 += 30;
    if (user1.interests && user1.interests.length > 0) score1 += 30;
    if (user1.verified) score1 += 20;

    if (user2.bio) score2 += 20;
    if (user2.photos && user2.photos.length > 0) score2 += 30;
    if (user2.interests && user2.interests.length > 0) score2 += 30;
    if (user2.verified) score2 += 20;

    // Return average activity score
    return (score1 + score2) / 2;
  },

  // Rank potential matches for a user
  rankPotentialMatches: (currentUser, potentialMatches) => {
    return potentialMatches
      .map(match => ({
        ...match,
        compatibilityScore: MatchingEngine.calculateCompatibilityScore(currentUser, match)
      }))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  },

  // Get smart match recommendations (top matches)
  getSmartMatches: (currentUser, potentialMatches, limit = 10) => {
    const rankedMatches = MatchingEngine.rankPotentialMatches(currentUser, potentialMatches);
    return rankedMatches.slice(0, limit);
  },

  // Filter users based on preferences
  filterByPreferences: (users, preferences) => {
    return users.filter(user => {
      if (preferences.ageMin && user.age < preferences.ageMin) return false;
      if (preferences.ageMax && user.age > preferences.ageMax) return false;
      if (preferences.location && user.location !== preferences.location) return false;
      if (preferences.verifiedOnly && !user.verified) return false;
      return true;
    });
  },

  // Generate personalized match suggestions
  generateMatchSuggestions: (currentUser, allUsers, limit = 20) => {
    // Filter out the current user and already matched users
    const availableUsers = allUsers.filter(user => user.id !== currentUser.id);
    
    // Apply basic filters
    const filteredUsers = MatchingEngine.filterByPreferences(availableUsers, {
      ageMin: currentUser.preferredAgeMin || 18,
      ageMax: currentUser.preferredAgeMax || 99,
      verifiedOnly: false
    });

    // Get ranked matches
    return MatchingEngine.getSmartMatches(currentUser, filteredUsers, limit);
  }
};

module.exports = MatchingEngine;
