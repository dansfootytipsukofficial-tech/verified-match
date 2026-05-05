class SearchService {
  constructor() {
    this.filters = {};
    this.results = [];
  }

  setFilters(filterObj) {
    this.filters = { ...this.filters, ...filterObj };
  }

  search(profiles, query = '') {
    let results = profiles || [];

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.bio && p.bio.toLowerCase().includes(q))
      );
    }

    return this.applyFilters(results);
  }

  applyFilters(profiles) {
    let filtered = [...profiles];

    if (this.filters.ageMin) {
      filtered = filtered.filter(p => p.age >= this.filters.ageMin);
    }
    if (this.filters.ageMax) {
      filtered = filtered.filter(p => p.age <= this.filters.ageMax);
    }
    if (this.filters.location) {
      filtered = filtered.filter(p => p.location === this.filters.location);
    }
    if (this.filters.distance) {
      filtered = filtered.filter(p => this.calculateDistance(p.coordinates) <= this.filters.distance);
    }
    if (this.filters.interests) {
      filtered = filtered.filter(p => 
        p.interests && this.filters.interests.some(interest => p.interests.includes(interest))
      );
    }
    if (this.filters.religion) {
      filtered = filtered.filter(p => p.religion === this.filters.religion);
    }
    if (this.filters.verified) {
      filtered = filtered.filter(p => p.verified === true);
    }

    return filtered;
  }

  calculateDistance(coordinates) {
    if (!coordinates) return Infinity;
    const R = 6371;
    const dLat = (coordinates.lat - this.userCoordinates?.lat || 0) * Math.PI / 180;
    const dLon = (coordinates.lon - this.userCoordinates?.lon || 0) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.userCoordinates?.lat * Math.PI / 180) * Math.cos(coordinates.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  sortBy(profiles, sortType = 'compatibility') {
    const sorted = [...profiles];
    switch(sortType) {
      case 'compatibility':
        return sorted.sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
      case 'verified':
        return sorted.sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0));
      case 'recent_activity':
        return sorted.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
      default:
        return sorted;
    }
  }

  getAdvancedMetrics(profile) {
    return {
      profileCompleteness: this.calculateProfileCompleteness(profile),
      engagementScore: this.calculateEngagementScore(profile),
      trustScore: this.calculateTrustScore(profile),
      activityScore: this.calculateActivityScore(profile)
    };
  }

  calculateProfileCompleteness(profile) {
    const fields = ['name', 'bio', 'photos', 'interests', 'location', 'profession'];
    const filled = fields.filter(f => profile[f]).length;
    return Math.round((filled / fields.length) * 100);
  }

  calculateEngagementScore(profile) {
    const visits = profile.profileViews || 0;
    const likes = profile.likes || 0;
    const messages = profile.messagesSent || 0;
    return Math.min(100, (visits * 0.2 + likes * 0.3 + messages * 0.5));
  }

  calculateTrustScore(profile) {
    let score = 50;
    if (profile.verified) score += 25;
    if (profile.photosVerified) score += 15;
    if (profile.identity_verified) score += 10;
    return Math.min(100, score);
  }

  calculateActivityScore(profile) {
    const lastActive = new Date(profile.lastActive);
    const now = new Date();
    const daysDiff = (now - lastActive) / (1000 * 60 * 60 * 24);
    if (daysDiff < 1) return 100;
    if (daysDiff < 7) return 75;
    if (daysDiff < 30) return 50;
    return 25;
  }

  getMatchingProfiles(userProfile, allProfiles) {
    return allProfiles
      .filter(p => p.id !== userProfile.id)
      .map(p => ({
        ...p,
        compatibilityScore: this.calculateCompatibility(userProfile, p)
      }))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  calculateCompatibility(user1, user2) {
    let score = 50;
    const ageGap = Math.abs(user1.age - user2.age);
    if (ageGap <= 5) score += 15;
    else if (ageGap <= 10) score += 10;
    const commonInterests = (user1.interests || []).filter(i => (user2.interests || []).includes(i)).length;
    score += commonInterests * 3;
    if (user2.verified) score += 10;
    return Math.min(100, score);
  }

  saveSearch(searchName, filters) {
    if (!localStorage.getItem('savedSearches')) {
      localStorage.setItem('savedSearches', JSON.stringify([]));
    }
    const searches = JSON.parse(localStorage.getItem('savedSearches'));
    searches.push({ name: searchName, filters, createdAt: new Date().toISOString() });
    localStorage.setItem('savedSearches', JSON.stringify(searches));
  }

  getSavedSearches() {
    return JSON.parse(localStorage.getItem('savedSearches') || '[]');
  }

  deleteSavedSearch(searchName) {
    const searches = this.getSavedSearches();
    const filtered = searches.filter(s => s.name !== searchName);
    localStorage.setItem('savedSearches', JSON.stringify(filtered));
  }
}

const searchService = new SearchService();
export { searchService, SearchService };
