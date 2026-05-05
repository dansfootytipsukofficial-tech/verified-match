// ================================================
// VERIFIED MATCH - Analytics & Notifications
// User engagement tracking and push notifications
// ================================================

const AnalyticsSystem = {
  // ================================================
  // TRACK USER EVENT
  // ================================================
  
  trackEvent: function(userId, eventType, eventData) {
    const event = {
      eventId: 'evt_' + Date.now(),
      userId: userId,
      eventType: eventType,
      data: eventData,
      timestamp: new Date().toISOString(),
      platform: 'web',
      sessionId: eventData.sessionId || null
    };

    return event;
  },

  // ================================================
  // USER DASHBOARD METRICS
  // ================================================
  
  getUserDashboard: function(userId, userData, stats) {
    return {
      userId: userId,
      profile: {
        name: userData.displayName,
        verified: userData.verified,
        qualityScore: userData.qualityScore,
        photos: userData.photos ? userData.photos.length : 0
      },
      stats: {
        profileViews: stats.profileViews || 0,
        likes: stats.likes || 0,
        matches: stats.matches || 0,
        messages: stats.messages || 0,
        responseRate: stats.responseRate || 0,
        popularity: this.calculatePopularity(stats)
      },
      recommendations: {
        profileImprovement: this.getProfileImprovements(userData),
        suggestedMatches: stats.suggestedMatches || 0,
        newLikes: stats.newLikes || 0
      },
      dashboard: {
        updatedAt: new Date().toISOString(),
        period: 'last_7_days'
      }
    };
  },

  // ================================================
  // CALCULATE POPULARITY SCORE
  // ================================================
  
  calculatePopularity: function(stats) {
    let score = 0;
    
    if (stats.profileViews) score += Math.min(stats.profileViews / 10, 20);
    if (stats.likes) score += Math.min(stats.likes / 10, 20);
    if (stats.matches) score += Math.min(stats.matches / 5, 20);
    if (stats.messageCount) score += Math.min(stats.messageCount / 20, 20);
    if (stats.responseRate) score += (stats.responseRate / 100) * 20;

    return Math.round(Math.min(score, 100));
  },

  // ================================================
  // GET PROFILE IMPROVEMENTS
  // ================================================
  
  getProfileImprovements: function(userData) {
    const suggestions = [];

    if (!userData.verified) {
      suggestions.push({
        priority: 'high',
        suggestion: 'Complete identity verification to increase matches',
        impact: 'Get 3x more matches'
      });
    }

    if (!userData.photos || userData.photos.length < 5) {
      suggestions.push({
        priority: 'high',
        suggestion: 'Add at least 5 photos to your profile',
        impact: 'Increase profile views by 40%'
      });
    }

    if (!userData.bio || userData.bio.length < 100) {
      suggestions.push({
        priority: 'medium',
        suggestion: 'Write a detailed bio (100+ characters)',
        impact: 'Improve match quality'
      });
    }

    if (!userData.interests || userData.interests.length < 3) {
      suggestions.push({
        priority: 'medium',
        suggestion: 'Add at least 3 interests to your profile',
        impact: 'Better match suggestions'
      });
    }

    return suggestions;
  },

  // ================================================
  // NOTIFICATIONS SYSTEM
  // ================================================
  
  createNotification: function(userId, type, data) {
    const notifications = {
      like: {
        title: 'New Like',
        message: `${data.senderName} likes you!`,
        icon: '\u2665'
      },
      message: {
        title: 'New Message',
        message: `${data.senderName}: ${data.messagePreview}`,
        icon: '\u270d'
      },
      match: {
        title: 'New Match',
        message: `You matched with ${data.matchName}!`,
        icon: '\u2728'
      },
      superLike: {
        title: 'Super Like',
        message: `${data.senderName} super liked you!`,
        icon: '\u2b50'
      },
      visitor: {
        title: 'Profile Visitor',
        message: `${data.visitorName} viewed your profile`,
        icon: '\u1f441'
      }
    };

    const notification = notifications[type];
    if (!notification) return null;

    return {
      notificationId: 'notif_' + Date.now(),
      userId: userId,
      type: type,
      title: notification.title,
      message: notification.message,
      icon: notification.icon,
      data: data,
      timestamp: new Date().toISOString(),
      isRead: false,
      actionUrl: data.actionUrl || null
    };
  },

  // ================================================
  // SEND PUSH NOTIFICATION
  // ================================================
  
  sendPushNotification: function(notification, userSettings) {
    if (userSettings && !userSettings.pushNotificationsEnabled) {
      return { success: false, reason: 'User disabled notifications' };
    }

    return {
      success: true,
      sentAt: new Date().toISOString(),
      notificationId: notification.notificationId,
      delivered: true,
      pushService: 'FCM'
    };
  },

  // ================================================
  // USER ENGAGEMENT METRICS
  // ================================================
  
  getEngagementMetrics: function(userId, events) {
    const userEvents = events.filter(e => e.userId === userId);
    
    return {
      userId: userId,
      totalSessions: new Set(userEvents.map(e => e.sessionId)).size,
      lastActive: userEvents.length > 0 ? userEvents[userEvents.length - 1].timestamp : null,
      averageSessionDuration: this.calculateAverageSessionDuration(userEvents),
      activeDevices: new Set(userEvents.map(e => e.platform)).size,
      engagement: {
        browsingTime: userEvents.filter(e => e.eventType === 'browse').length,
        messagingTime: userEvents.filter(e => e.eventType === 'message').length,
        likingActivity: userEvents.filter(e => e.eventType === 'like').length
      },
      trend: this.calculateEngagementTrend(userEvents)
    };
  },

  // ================================================
  // CALCULATE ENGAGEMENT TREND
  // ================================================
  
  calculateEngagementTrend: function(events) {
    if (events.length < 2) return 'neutral';
    
    const lastWeek = events.filter(e => {
      const eventDate = new Date(e.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return eventDate > weekAgo;
    });

    const twoWeeksAgo = events.filter(e => {
      const eventDate = new Date(e.timestamp);
      const twoWeeks = new Date();
      twoWeeks.setDate(twoWeeks.getDate() - 14);
      return eventDate > twoWeeks && eventDate <= new Date();
    });

    if (lastWeek.length > twoWeeksAgo.length) return 'increasing';
    if (lastWeek.length < twoWeeksAgo.length) return 'decreasing';
    return 'stable';
  },

  // ================================================
  // CALCULATE AVERAGE SESSION DURATION
  // ================================================
  
  calculateAverageSessionDuration: function(events) {
    if (events.length === 0) return 0;
    return Math.round(events.length * 5); // Approximate duration
  },

  // ================================================
  // SAFETY REPORT
  // ================================================
  
  generateSafetyReport: function(userId, reports) {
    const userReports = reports.filter(r => r.reportedUserId === userId || r.reporterId === userId);

    return {
      userId: userId,
      trustScore: 95,
      safetyStatus: 'verified',
      reports: {
        againstUser: userReports.filter(r => r.reportedUserId === userId).length,
        byUser: userReports.filter(r => r.reporterId === userId).length
      },
      warnings: [],
      lastReviewDate: new Date().toISOString(),
      accountStatus: 'good_standing'
    };
  },

  // ================================================
  // SEND WEEKLY DIGEST
  // ================================================
  
  generateWeeklyDigest: function(userId, stats) {
    return {
      digestId: 'digest_' + Date.now(),
      userId: userId,
      period: 'last_7_days',
      summary: {
        viewCount: stats.profileViews || 0,
        likeCount: stats.likes || 0,
        messageCount: stats.messages || 0,
        matchCount: stats.matches || 0
      },
      highlights: {
        topMatch: stats.topMatch || null,
        mostActive: stats.mostActiveHour || 'evening'
      },
      recommendations: stats.recommendations || [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
};

export default AnalyticsSystem;
