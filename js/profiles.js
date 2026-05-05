// ================================================
// VERIFIED MATCH - User Profile Management
// Premium profile system with verification
// ================================================

const ProfileSystem = {
  // ================================================
  // CREATE PROFILE
  // ================================================
  
  createProfile: function(userId, profileData) {
    const profile = {
      userId: userId,
      displayName: profileData.displayName,
      age: profileData.age,
      location: profileData.location,
      bio: profileData.bio,
      photos: profileData.photos || [],
      verified: false,
      verificationStatus: 'pending',
      profileCompletion: this.calculateProfileCompletion(profileData),
      badges: [],
      premiumFeatures: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return profile;
  },

  // ================================================
  // PROFILE COMPLETION SCORE
  // ================================================
  
  calculateProfileCompletion: function(profileData) {
    let completionScore = 0;
    let totalFields = 0;

    const requiredFields = [
      'displayName',
      'age',
      'location',
      'bio',
      'photos'
    ];

    const optionalFields = [
      'interests',
      'occupation',
      'education',
      'height',
      'bodyType',
      'drinking',
      'smoking',
      'zodiac'
    ];

    // Score required fields
    requiredFields.forEach(field => {
      totalFields++;
      if (profileData[field] && profileData[field].length > 0) {
        completionScore += 50;
      }
    });

    // Score optional fields
    optionalFields.forEach(field => {
      totalFields++;
      if (profileData[field]) {
        completionScore += 50 / optionalFields.length;
      }
    });

    return Math.min(100, Math.round(completionScore / (totalFields / 2)));
  },

  // ================================================
  // PHOTO VERIFICATION
  // ================================================
  
  verifyPhotos: function(photos) {
    const verification = {
      totalPhotos: photos.length,
      verifiedPhotos: 0,
      pendingPhotos: 0,
      rejectedPhotos: 0,
      issues: []
    };

    if (photos.length < 2) {
      verification.issues.push('Minimum 2 photos required');
    }

    if (photos.length > 20) {
      verification.issues.push('Maximum 20 photos allowed');
    }

    verification.pendingPhotos = Math.min(photos.length, 20);
    
    return verification;
  },

  // ================================================
  // IDENTITY VERIFICATION
  // ================================================
  
  verifyIdentity: function(userId, documentType, documentData) {
    const verification = {
      userId: userId,
      documentType: documentType,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      verifiedAt: null,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      issues: []
    };

    if (!documentData.number || documentData.number.length < 5) {
      verification.issues.push('Invalid document number');
    }

    if (!documentData.expiryDate || new Date(documentData.expiryDate) < new Date()) {
      verification.issues.push('Document expired');
    }

    if (verification.issues.length === 0) {
      verification.status = 'verified';
      verification.verifiedAt = new Date().toISOString();
    }

    return verification;
  },

  // ================================================
  // PROFILE BADGES
  // ================================================
  
  assignBadges: function(profile) {
    const badges = [];

    if (profile.verified) {
      badges.push({ name: 'Verified', icon: '✓', color: '#4caf50' });
    }

    if (profile.profileCompletion >= 100) {
      badges.push({ name: 'Complete Profile', icon: '★', color: '#ffc107' });
    }

    if (profile.premiumFeatures && profile.premiumFeatures.length > 0) {
      badges.push({ name: 'Premium Member', icon: '♦', color: '#2196f3' });
    }

    if (profile.profileCompletion >= 80) {
      badges.push({ name: 'Quality Profile', icon: '★★', color: '#ff9800' });
    }

    return badges;
  },

  // ================================================
  // PROFILE VISIBILITY & PRIVACY
  // ================================================
  
  updateProfileVisibility: function(userId, visibility) {
    const settings = {
      userId: userId,
      searchVisible: visibility.searchVisible !== false,
      browseVisible: visibility.browseVisible !== false,
      messageVisible: visibility.messageVisible !== false,
      lastSeenVisible: visibility.lastSeenVisible === true,
      onlineStatusVisible: visibility.onlineStatusVisible === true,
      blockedUsers: visibility.blockedUsers || [],
      reportedUsers: visibility.reportedUsers || [],
      updatedAt: new Date().toISOString()
    };

    return settings;
  },

  // ================================================
  // PROFILE ANALYTICS
  // ================================================
  
  getProfileAnalytics: function(profile) {
    const analytics = {
      profileId: profile.userId,
      views: profile.views || 0,
      likes: profile.likes || 0,
      passes: profile.passes || 0,
      messages: profile.messageCount || 0,
      responseRate: profile.messageResponseRate || 0,
      avgResponseTime: profile.avgResponseTime || null,
      matchRate: profile.matchRate || 0,
      topInterests: profile.topInterests || [],
      mostViewedPhoto: profile.mostViewedPhoto || 0
    };

    return analytics;
  },

  // ================================================
  // PROFILE QUALITY SCORE
  // ================================================
  
  calculateProfileQualityScore: function(profile) {
    let score = 0;

    // Verification bonus
    if (profile.verified) score += 30;

    // Completion bonus
    score += (profile.profileCompletion / 100) * 30;

    // Photo quality
    if (profile.photos && profile.photos.length >= 5) score += 20;
    else if (profile.photos && profile.photos.length >= 3) score += 15;
    else if (profile.photos && profile.photos.length >= 1) score += 10;

    // Bio quality
    if (profile.bio && profile.bio.length > 100) score += 10;
    else if (profile.bio && profile.bio.length > 50) score += 5;

    // Response rate
    if (profile.messageResponseRate > 80) score += 10;
    else if (profile.messageResponseRate > 50) score += 5;

    return Math.min(100, Math.round(score));
  },

  // ================================================
  // SEARCH & FILTER PROFILES
  // ================================================
  
  filterProfiles: function(allProfiles, filters) {
    return allProfiles.filter(profile => {
      // Age filter
      if (filters.ageMin && profile.age < filters.ageMin) return false;
      if (filters.ageMax && profile.age > filters.ageMax) return false;

      // Location filter
      if (filters.location && profile.location !== filters.location) return false;

      // Verification filter
      if (filters.verifiedOnly && !profile.verified) return false;

      // Premium filter
      if (filters.premiumOnly && !profile.premiumFeatures) return false;

      // Interests filter
      if (filters.interests && filters.interests.length > 0) {
        const hasCommonInterest = filters.interests.some(interest =>
          profile.interests && profile.interests.includes(interest)
        );
        if (!hasCommonInterest) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by quality score by default
      const scoreA = this.calculateProfileQualityScore(a);
      const scoreB = this.calculateProfileQualityScore(b);
      return scoreB - scoreA;
    });
  },

  // ================================================
  // PROFILE RECOMMENDATIONS
  // ================================================
  
  getRecommendedProfiles: function(currentProfile, allProfiles) {
    const filtered = this.filterProfiles(allProfiles, {
      ageMin: currentProfile.agePreference?.min || 18,
      ageMax: currentProfile.agePreference?.max || 65,
      location: currentProfile.preferredLocation,
      verifiedOnly: true
    });

    return filtered.slice(0, 20);
  }
};

export default ProfileSystem;
