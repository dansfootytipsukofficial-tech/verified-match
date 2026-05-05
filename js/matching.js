// ============================================
// VERIFIED MATCH - Advanced Matching Algorithm
// The "Magic" - Makes this the best dating platform
// ============================================

const Matching = {
  // ============================================
  // COMPATIBILITY SCORE CALCULATION
  // ============================================

  calculateCompatibility: function(user1, user2) {
    const scores = {
      ageScore: this.calculateAgeCompatibility(user1, user2),
      locationScore: this.calculateLocationCompatibility(user1, user2),
      interestsScore: this.calculateInterestsCompatibility(user1, user2),
      personalityScore: this.calculatePersonalityCompatibility(user1, user2),
      valuesScore: this.calculateValuesCompatibility(user1, user2),
    };

    // Apply weighted factors
    const weights = APP_CONFIG.matching.weightedFactors;
    const totalScore = (
      scores.ageScore * weights.agePreference +
      scores.locationScore * weights.location +
      scores.interestsScore * weights.interests +
      scores.personalityScore * weights.personality +
      scores.valuesScore * weights.values
    ) * 100;

    return {
      overall: Math.round(totalScore),
      breakdown: scores,
      compatible: totalScore >= (APP_CONFIG.matching.minCompatibilityScore / 100),
    };
  },

  // Age compatibility (18-100)
  calculateAgeCompatibility: function(user1, user2) {
    const age1 = Utils.calculateAge(new Date(user1.birthDate));
    const age2 = Utils.calculateAge(new Date(user2.birthDate));
    const ageDiff = Math.abs(age1 - age2);

    // Perfect match: 0-2 years difference
    if (ageDiff <= 2) return 1.0;
    // Great match: 3-5 years
    if (ageDiff <= 5) return 0.9;
    // Good match: 6-10 years
    if (ageDiff <= 10) return 0.75;
    // Okay match: 11-15 years
    if (ageDiff <= 15) return 0.5;
    // Poor match: 16+ years
    return 0.2;
  },

  // Location compatibility
  calculateLocationCompatibility: function(user1, user2) {
    const distance = Utils.calculateDistance(
      user1.latitude,
      user1.longitude,
      user2.latitude,
      user2.longitude
    );

    const maxDistance = APP_CONFIG.matching.maxDistance;
    
    // Perfect: Same location
    if (distance < 1) return 1.0;
    // Great: Within 5km
    if (distance <= 5) return 0.95;
    // Good: Within 10km
    if (distance <= 10) return 0.85;
    // Okay: Within 25km
    if (distance <= 25) return 0.65;
    // Fair: Within max distance
    if (distance <= maxDistance) return 0.4;
    // Too far
    return 0.0;
  },

  // Shared interests compatibility
  calculateInterestsCompatibility: function(user1, user2) {
    const interests1 = user1.interests || [];
    const interests2 = user2.interests || [];

    if (interests1.length === 0 || interests2.length === 0) return 0.5;

    // Find common interests
    const commonInterests = interests1.filter(interest =>
      interests2.includes(interest)
    );

    const commonCount = commonInterests.length;
    const maxCount = Math.max(interests1.length, interests2.length);

    // Perfect: All interests match
    if (commonCount === maxCount) return 1.0;
    // Great: 75% or more match
    if (commonCount >= maxCount * 0.75) return 0.9;
    // Good: 50% or more match
    if (commonCount >= maxCount * 0.5) return 0.75;
    // Okay: 25% or more match
    if (commonCount >= maxCount * 0.25) return 0.5;
    // Poor: Less than 25% match
    return 0.25;
  },

  // Personality type compatibility
  calculatePersonalityCompatibility: function(user1, user2) {
    const personality1 = user1.personalityType || 'unknown';
    const personality2 = user2.personalityType || 'unknown';

    // Define personality compatibility matrix
    const compatibilityMatrix = {
      // MBTI-style personality compatibility
      // This is a simplified version - can be expanded
      'introvert-introvert': 0.8,
      'introvert-extrovert': 0.6,
      'extrovert-extrovert': 0.85,
      'ambivert-ambivert': 0.9,
      'ambivert-any': 0.75,
    };

    // Simple matching logic
    if (personality1 === personality2) return 0.85;
    if (personality1 === 'ambivert' || personality2 === 'ambivert') return 0.75;
    if (
      (personality1 === 'introvert' && personality2 === 'extrovert') ||
      (personality1 === 'extrovert' && personality2 === 'introvert')
    ) return 0.65;

    return 0.5;
  },

  // Core values compatibility
  calculateValuesCompatibility: function(user1, user2) {
    const values1 = user1.values || [];
    const values2 = user2.values || [];

    if (values1.length === 0 || values2.length === 0) return 0.5;

    // Core values are more important than interests
    const commonValues = values1.filter(value =>
      values2.includes(value)
    );

    const commonCount = commonValues.length;
    const maxCount = Math.max(values1.length, values2.length);

    // Perfect: All values match (very important!)
    if (commonCount === maxCount) return 1.0;
    // Great: 75% or more match
    if (commonCount >= maxCount * 0.75) return 0.95;
    // Good: 50% or more match
    if (commonCount >= maxCount * 0.5) return 0.8;
    // Fair: 25% or more match
    if (commonCount >= maxCount * 0.25) return 0.5;
    // Poor: Less than 25% match (values conflict!)
    return 0.1;
  },

  // ============================================
  // SMART FILTERING & RANKING
  // ============================================

  // Get best matches for a user
  getBestMatches: async function(userId, options = {}) {
    try {
      const currentUser = await API.users.getProfile(userId);
      const potentialMatches = await API.matches.getAllPotentialMatches(userId);

      // Filter based on preferences
      let filtered = potentialMatches.filter(match => {
        // Don't match with self
        if (match.user_id === userId) return false;

        // Filter by age preference
        if (options.ageRange) {
          const age = Utils.calculateAge(new Date(match.birthDate));
          if (age < options.ageRange.min || age > options.ageRange.max) {
            return false;
          }
        }

        // Filter by location
        if (options.locationFilter) {
          const distance = Utils.calculateDistance(
            currentUser.latitude,
            currentUser.longitude,
            match.latitude,
            match.longitude
          );
          if (distance > APP_CONFIG.matching.maxDistance) return false;
        }

        // Filter by verification status
        if (options.verifiedOnly && !match.verified) return false;

        // Filter by interests (optional)
        if (options.interests && options.interests.length > 0) {
          const hasCommonInterests = match.interests?.some(interest =>
            options.interests.includes(interest)
          );
          if (!hasCommonInterests) return false;
        }

        return true;
      });

      // Calculate compatibility scores
      const ranked = filtered
        .map(match => ({
          ...match,
          compatibility: this.calculateCompatibility(currentUser, match),
        }))
        .filter(match => match.compatibility.compatible) // Only compatible matches
        .sort((a, b) => b.compatibility.overall - a.compatibility.overall);

      return ranked;
    } catch (error) {
      console.error('Error getting matches:', error);
      return [];
    }
  },

  // Get matches by specific criteria
  filterMatches: function(matches, criteria) {
    return matches.filter(match => {
      // Filter by score range
      if (criteria.minScore && match.compatibility.overall < criteria.minScore) {
        return false;
      }
      if (criteria.maxScore && match.compatibility.overall > criteria.maxScore) {
        return false;
      }

      // Filter by compatibility factor
      if (criteria.factorType && criteria.factorThreshold) {
        const score = match.compatibility.breakdown[criteria.factorType];
        if (score < criteria.factorThreshold) return false;
      }

      return true;
    });
  },

  // ============================================
  // MATCH ACTIONS
  // ============================================

  // Like a profile
  likeProfile: async function(userId, likedUserId) {
    try {
      // Check for mutual like (instant match)
      const { data: existingLike } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', likedUserId)
        .eq('matched_user_id', userId)
        .eq('status', 'interested')
        .single();

      if (existingLike) {
        // Mutual match!
        const { error } = await API.matches.likeProfile(userId, likedUserId);
        if (error) throw new Error(error.message);

        // Update both to 'matched' status
        await supabase
          .from('matches')
          .update({ status: 'matched', matched_at: new Date() })
          .eq('user_id', likedUserId)
          .eq('matched_user_id', userId);

        return { success: true, type: 'mutual_match', message: 'Its a match!' };
      } else {
        // Just a like
        await API.matches.likeProfile(userId, likedUserId);
        return { success: true, type: 'like', message: 'Profile liked!' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Pass on a profile
  passProfile: async function(userId, passedUserId) {
    try {
      // Record the pass (to improve algorithm learning)
      await supabase
        .from('matches')
        .insert([{
          user_id: userId,
          matched_user_id: passedUserId,
          status: 'passed',
          created_at: new Date(),
        }]);

      return { success: true, message: 'Profile passed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Block a profile
  blockProfile: async function(userId, blockedUserId) {
    try {
      await supabase
        .from('matches')
        .insert([{
          user_id: userId,
          matched_user_id: blockedUserId,
          status: 'blocked',
          reason: 'User blocked',
          created_at: new Date(),
        }]);

      return { success: true, message: 'Profile blocked' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // ALGORITHM LEARNING & OPTIMIZATION
  // ============================================

  // Learn from user behavior
  updateAlgorithmLearning: async function(userId) {
    try {
      // Get user's interaction history
      const { data: interactions } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', userId);

      if (!interactions || interactions.length === 0) return;

      // Analyze successful matches vs passed profiles
      const matches = interactions.filter(i => i.status === 'matched');
      const passed = interactions.filter(i => i.status === 'passed');

      // Store learning data for future improvements
      const learningData = {
        userId,
        successRate: matches.length / (matches.length + passed.length),
        matchedCount: matches.length,
        passedCount: passed.length,
        updated_at: new Date(),
      };

      // This can be used to personalize future matches
      return learningData;
    } catch (error) {
      console.error('Error in algorithm learning:', error);
    }
  },

  // ============================================
  // ANALYTICS & INSIGHTS
  // ============================================

  // Get match statistics
  getMatchStats: async function(userId) {
    try {
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', userId);

      if (!matches) return null;

      const stats = {
        totalInteractions: matches.length,
        matched: matches.filter(m => m.status === 'matched').length,
        interested: matches.filter(m => m.status === 'interested').length,
        passed: matches.filter(m => m.status === 'passed').length,
        blocked: matches.filter(m => m.status === 'blocked').length,
        matchRate: (matches.filter(m => m.status === 'matched').length / matches.length) * 100,
      };

      return stats;
    } catch (error) {
      console.error('Error getting match stats:', error);
      return null;
    }
  },

  // Get compatibility report
  getCompatibilityReport: function(compatibility) {
    const score = compatibility.overall;

    if (score >= 90) return { level: 'Perfect Match! ⭐⭐⭐', color: '#4caf50' };
    if (score >= 80) return { level: 'Excellent Match! ⭐⭐', color: '#8bc34a' };
    if (score >= 70) return { level: 'Great Match! ⭐', color: '#ffc107' };
    if (score >= 60) return { level: 'Good Match ✓', color: '#ff9800' };
    if (score >= 50) return { level: 'Potential Match', color: '#ff5722' };
    return { level: 'Low Compatibility', color: '#f44336' };
  },
};


export default Matching;
