// ================================================
// VERIFIED MATCH - Browse & Discover System
// Premium swipe interface with smart recommendations
// ================================================

const BrowseSystem = {
  // ================================================
  // INITIALIZE BROWSING SESSION
  // ================================================
  
  initBrowseSession: function(userId, preferences) {
    const session = {
      sessionId: 'browse_' + userId + '_' + Date.now(),
      userId: userId,
      startTime: new Date().toISOString(),
      preferences: {
        ageMin: preferences.ageMin || 18,
        ageMax: preferences.ageMax || 65,
        location: preferences.location || 'all',
        distance: preferences.distance || 50,
        verifiedOnly: preferences.verifiedOnly !== false,
        premiumProfiles: preferences.premiumProfiles || false,
        interests: preferences.interests || []
      },
      totalShown: 0,
      totalActions: 0,
      viewedProfiles: [],
      queue: [],
      paused: false
    };

    return session;
  },

  // ================================================
  // LOAD BROWSING QUEUE
  // ================================================
  
  loadBrowseQueue: function(session, profiles) {
    const filtered = profiles.filter(profile => {
      if (profile.age < session.preferences.ageMin) return false;
      if (profile.age > session.preferences.ageMax) return false;
      if (session.preferences.location !== 'all' && profile.location !== session.preferences.location) return false;
      if (session.preferences.verifiedOnly && !profile.verified) return false;
      if (session.viewedProfiles.includes(profile.userId)) return false;
      return true;
    });

    // Sort by compatibility and quality score
    filtered.sort((a, b) => {
      const scoreA = (a.qualityScore || 0) + (a.compatibilityScore || 0);
      const scoreB = (b.qualityScore || 0) + (b.compatibilityScore || 0);
      return scoreB - scoreA;
    });

    session.queue = filtered.slice(0, 100);
    return session.queue;
  },

  // ================================================
  // GET NEXT PROFILE TO BROWSE
  // ================================================
  
  getNextProfile: function(session) {
    if (session.queue.length === 0) {
      return {
        status: 'empty',
        message: 'No more profiles to browse',
        profile: null
      };
    }

    const profile = session.queue.shift();
    session.totalShown++;
    session.viewedProfiles.push(profile.userId);

    return {
      status: 'success',
      profile: profile,
      queueRemaining: session.queue.length
    };
  },

  // ================================================
  // SWIPE LIKE
  // ================================================
  
  swipeLike: function(userId, targetUserId) {
    const like = {
      likerUserId: userId,
      likedUserId: targetUserId,
      timestamp: new Date().toISOString(),
      isMatch: false,
      message: null
    };

    return like;
  },

  // ================================================
  // SWIPE PASS
  // ================================================
  
  swipePass: function(userId, targetUserId, reason) {
    const pass = {
      userId: userId,
      passedUserId: targetUserId,
      reason: reason,
      timestamp: new Date().toISOString()
    };

    return pass;
  },

  // ================================================
  // SWIPE SUPER LIKE
  // ================================================
  
  swipeSuperLike: function(userId, targetUserId) {
    const superLike = {
      userId: userId,
      targetUserId: targetUserId,
      type: 'superLike',
      isPremiumFeature: true,
      timestamp: new Date().toISOString(),
      priority: 'high'
    };

    return superLike;
  },

  // ================================================
  // CHECK FOR MUTUAL MATCHES
  // ================================================
  
  checkMutualMatch: function(userId, targetUserId, targetLikes) {
    const targetLikedUser = targetLikes.some(like => like.likedUserId === userId);

    if (targetLikedUser) {
      return {
        isMatch: true,
        matchId: 'match_' + [userId, targetUserId].sort().join('_'),
        matchedAt: new Date().toISOString(),
        status: 'active'
      };
    }

    return { isMatch: false };
  },

  // ================================================
  // ADVANCED FILTERING
  // ================================================
  
  applyAdvancedFilters: function(profiles, filters) {
    return profiles.filter(profile => {
      // Height filter
      if (filters.heightMin && profile.height < filters.heightMin) return false;
      if (filters.heightMax && profile.height > filters.heightMax) return false;

      // Body type filter
      if (filters.bodyType && filters.bodyType.length > 0) {
        if (!filters.bodyType.includes(profile.bodyType)) return false;
      }

      // Education filter
      if (filters.education && filters.education.length > 0) {
        if (!filters.education.includes(profile.education)) return false;
      }

      // Religion filter
      if (filters.religion && profile.religion !== filters.religion) return false;

      // Drinking/Smoking filter
      if (filters.drinking && profile.drinking !== filters.drinking) return false;
      if (filters.smoking && profile.smoking !== filters.smoking) return false;

      // Job type filter
      if (filters.jobType && filters.jobType.length > 0) {
        if (!filters.jobType.includes(profile.jobType)) return false;
      }

      return true;
    });
  },

  // ================================================
  // PERSONALIZED RECOMMENDATIONS
  // ================================================
  
  getPersonalizedRecommendations: function(currentProfile, allProfiles, likes, passes) {
    const likedUserIds = likes.map(l => l.likedUserId);
    const passedUserIds = passes.map(p => p.passedUserId);

    // Find common traits in liked profiles
    const likedProfiles = allProfiles.filter(p => likedUserIds.includes(p.userId));
    const commonTraits = this.findCommonTraits(likedProfiles);

    // Filter profiles based on common traits
    const recommendations = allProfiles.filter(profile => {
      if (likedUserIds.includes(profile.userId)) return false;
      if (passedUserIds.includes(profile.userId)) return false;

      // Match on common traits
      let traitMatches = 0;
      if (commonTraits.interests) {
        traitMatches += (profile.interests || []).filter(i => commonTraits.interests.includes(i)).length;
      }
      if (commonTraits.ageRange) {
        if (profile.age >= commonTraits.ageRange.min && profile.age <= commonTraits.ageRange.max) {
          traitMatches += 2;
        }
      }

      return traitMatches > 0;
    }).slice(0, 20);

    return recommendations;
  },

  // ================================================
  // FIND COMMON TRAITS
  // ================================================
  
  findCommonTraits: function(profiles) {
    if (profiles.length === 0) return {};

    // Calculate average age
    const avgAge = profiles.reduce((sum, p) => sum + p.age, 0) / profiles.length;
    const ageMin = Math.max(18, Math.floor(avgAge - 5));
    const ageMax = Math.ceil(avgAge + 5);

    // Find most common interests
    const interestMap = {};
    profiles.forEach(profile => {
      (profile.interests || []).forEach(interest => {
        interestMap[interest] = (interestMap[interest] || 0) + 1;
      });
    });

    const topInterests = Object.entries(interestMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    return {
      ageRange: { min: ageMin, max: ageMax },
      interests: topInterests
    };
  },

  // ================================================
  // BROWSE STATISTICS
  // ================================================
  
  getBrowseStats: function(session) {
    const likeRate = session.totalActions > 0 ? (session.totalActions / session.totalShown) * 100 : 0;

    return {
      sessionId: session.sessionId,
      duration: new Date() - new Date(session.startTime),
      profilesShown: session.totalShown,
      actionsPerProfile: session.totalActions / Math.max(1, session.totalShown),
      likeRate: likeRate.toFixed(2) + '%',
      queueStatus: {
        remaining: session.queue.length,
        viewed: session.viewedProfiles.length
      }
    };
  }
};

export default BrowseSystem;
