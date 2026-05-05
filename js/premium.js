// ================================================
// VERIFIED MATCH - Premium Features & Subscriptions
// Premium membership tiers and feature management
// ================================================

const PremiumSystem = {
  // ================================================
  // SUBSCRIPTION TIERS
  // ================================================
  
  subscriptionTiers: {
    free: {
      tier: 'Free',
      price: 0,
      currency: 'GBP',
      features: {
        likes: 5,
        superLikes: 0,
        messages: 10,
        profileViews: 20,
        filters: false,
        noAds: false,
        verification: false,
        premiumProfiles: false,
        rewind: false,
        incognito: false
      }
    },
    plus: {
      tier: 'Plus',
      price: 9.99,
      billing: 'monthly',
      features: {
        likes: 'unlimited',
        superLikes: 5,
        messages: 'unlimited',
        profileViews: 'unlimited',
        filters: true,
        noAds: true,
        verification: false,
        premiumProfiles: true,
        rewind: true,
        incognito: false
      }
    },
    gold: {
      tier: 'Gold',
      price: 19.99,
      billing: 'monthly',
      features: {
        likes: 'unlimited',
        superLikes: 'unlimited',
        messages: 'unlimited',
        profileViews: 'unlimited',
        filters: true,
        noAds: true,
        verification: true,
        premiumProfiles: true,
        rewind: true,
        incognito: true,
        prioritySupport: true,
        boosts: 2
      }
    },
    platinum: {
      tier: 'Platinum',
      price: 49.99,
      billing: 'monthly',
      features: {
        likes: 'unlimited',
        superLikes: 'unlimited',
        messages: 'unlimited',
        profileViews: 'unlimited',
        filters: true,
        noAds: true,
        verification: true,
        premiumProfiles: 'all',
        rewind: 'unlimited',
        incognito: true,
        prioritySupport: true,
        boosts: 10,
        concierge: true,
        profileReviews: true
      }
    }
  },

  // ================================================
  // CREATE SUBSCRIPTION
  // ================================================
  
  createSubscription: function(userId, tierName, paymentMethod) {
    const tier = this.subscriptionTiers[tierName];
    if (!tier) return { success: false, error: 'Invalid tier' };

    const subscription = {
      subscriptionId: 'sub_' + Date.now(),
      userId: userId,
      tier: tierName,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: this.calculateEndDate(tier),
      autoRenew: true,
      paymentMethod: paymentMethod,
      price: tier.price,
      nextBillingDate: this.calculateNextBillingDate(tier)
    };

    return { success: true, subscription: subscription };
  },

  // ================================================
  // CALCULATE END DATE
  // ================================================
  
  calculateEndDate: function(tier) {
    const endDate = new Date();
    if (tier.billing === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    return endDate.toISOString();
  },

  // ================================================
  // CALCULATE NEXT BILLING DATE
  // ================================================
  
  calculateNextBillingDate: function(tier) {
    const nextDate = new Date();
    if (tier.billing === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    return nextDate.toISOString();
  },

  // ================================================
  // CHECK FEATURE ACCESS
  // ================================================
  
  checkFeatureAccess: function(userId, feature, userSubscription) {
    const tier = this.subscriptionTiers[userSubscription.tier];
    
    if (!tier) return false;
    
    const featureValue = tier.features[feature];
    
    if (featureValue === true) return true;
    if (featureValue === false) return false;
    if (featureValue === 'unlimited') return true;
    if (typeof featureValue === 'number' && featureValue > 0) return true;
    
    return false;
  },

  // ================================================
  // GET REMAINING USAGE
  // ================================================
  
  getRemainingUsage: function(feature, userUsage, subscription) {
    const tier = this.subscriptionTiers[subscription.tier];
    const limit = tier.features[feature];

    if (limit === 'unlimited') return { remaining: 'unlimited', limit: 'unlimited' };
    if (limit === true || limit === false) return { limited: false };
    if (typeof limit === 'number') {
      return {
        remaining: Math.max(0, limit - (userUsage[feature] || 0)),
        limit: limit,
        used: userUsage[feature] || 0
      };
    }

    return { remaining: 0, limit: 0 };
  },

  // ================================================
  // BOOST PROFILE
  // ================================================
  
  boostProfile: function(userId, subscription, durationHours = 24) {
    const tier = this.subscriptionTiers[subscription.tier];
    const boosts = tier.features.boosts || 0;

    if (boosts === 0) return { success: false, error: 'No boosts available' };

    const boost = {
      boostId: 'boost_' + Date.now(),
      userId: userId,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString(),
      visibility: 'top_10',
      searchPriority: 'high',
      matchesPriority: 'high'
    };

    return { success: true, boost: boost };
  },

  // ================================================
  // SEND SUPER LIKE
  // ================================================
  
  sendSuperLike: function(userId, targetUserId, subscription) {
    const tier = this.subscriptionTiers[subscription.tier];
    const superLikes = tier.features.superLikes || 0;

    if (superLikes === 0) return { success: false, error: 'No super likes available' };

    const superLike = {
      superLikeId: 'sl_' + Date.now(),
      senderId: userId,
      recipientId: targetUserId,
      timestamp: new Date().toISOString(),
      notification: true
    };

    return { success: true, superLike: superLike };
  },

  // ================================================
  // INCOGNITO MODE
  // ================================================
  
  enableIncognitoMode: function(userId, subscription) {
    if (!this.checkFeatureAccess(userId, 'incognito', subscription)) {
      return { success: false, error: 'Feature not available in this tier' };
    }

    return {
      success: true,
      incognito: {
        userId: userId,
        enabled: true,
        browsesHidden: true,
        likesHidden: true,
        enabledAt: new Date().toISOString()
      }
    };
  },

  // ================================================
  // PROFILE REVIEW SERVICE
  // ================================================
  
  requestProfileReview: function(userId, subscription) {
    if (!this.checkFeatureAccess(userId, 'profileReviews', subscription)) {
      return { success: false, error: 'Feature not available in this tier' };
    }

    return {
      success: true,
      review: {
        reviewId: 'review_' + Date.now(),
        userId: userId,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        suggestedImprovements: [],
        reviewedAt: null
      }
    };
  },

  // ================================================
  // UPGRADE SUBSCRIPTION
  // ================================================
  
  upgradeSubscription: function(currentSubscription, newTier) {
    const oldTier = this.subscriptionTiers[currentSubscription.tier];
    const newTierData = this.subscriptionTiers[newTier];

    if (!newTierData) return { success: false, error: 'Invalid tier' };

    const prorateCredit = this.calculateProrate(currentSubscription, oldTier);

    return {
      success: true,
      upgrade: {
        fromTier: currentSubscription.tier,
        toTier: newTier,
        prorateCredit: prorateCredit,
        newPrice: newTierData.price,
        newEndDate: this.calculateEndDate(newTierData),
        effectiveDate: new Date().toISOString()
      }
    };
  },

  // ================================================
  // CALCULATE PRORATE
  // ================================================
  
  calculateProrate: function(subscription, tier) {
    const endDate = new Date(subscription.endDate);
    const now = new Date();
    const daysRemaining = (endDate - now) / (1000 * 60 * 60 * 24);
    const monthlyPrice = tier.price;
    const dailyPrice = monthlyPrice / 30;
    
    return parseFloat((daysRemaining * dailyPrice).toFixed(2));
  },

  // ================================================
  // CANCEL SUBSCRIPTION
  // ================================================
  
  cancelSubscription: function(subscriptionId) {
    return {
      subscriptionId: subscriptionId,
      status: 'cancelled',
      cancellationDate: new Date().toISOString(),
      refund: null
    };
  }
};

export default PremiumSystem;
