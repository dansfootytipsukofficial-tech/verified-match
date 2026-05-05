// VERIFIED MATCH - API Integration Layer
// Supabase & Backend API Communication

const API = {
  BASE_URL: 'https://verified-match-api.com/api/v1',
  AUTH_TOKEN: null,

  registerUser: async function(email, password, userData) {
    return fetch(`${this.BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ...userData })
    }).then(r => r.json());
  },

  loginUser: async function(email, password) {
    const response = await fetch(`${this.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(r => r.json());
    this.AUTH_TOKEN = response.token;
    return response;
  },

  getProfile: async function(userId) {
    return fetch(`${this.BASE_URL}/profiles/${userId}`, {
      headers: { 'Authorization': `Bearer ${this.AUTH_TOKEN}` }
    }).then(r => r.json());
  },

  updateProfile: async function(userId, profileData) {
    return fetch(`${this.BASE_URL}/profiles/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.AUTH_TOKEN}`
      },
      body: JSON.stringify(profileData)
    }).then(r => r.json());
  },

  getRecommendations: async function(userId) {
    return fetch(`${this.BASE_URL}/matches/recommendations/${userId}`, {
      headers: { 'Authorization': `Bearer ${this.AUTH_TOKEN}` }
    }).then(r => r.json());
  },

  swipeLike: async function(userId, targetUserId) {
    return fetch(`${this.BASE_URL}/matches/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.AUTH_TOKEN}`
      },
      body: JSON.stringify({ userId, targetUserId })
    }).then(r => r.json());
  },

  sendMessage: async function(userId, recipientId, content) {
    return fetch(`${this.BASE_URL}/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.AUTH_TOKEN}`
      },
      body: JSON.stringify({ userId, recipientId, content })
    }).then(r => r.json());
  },

  getInbox: async function(userId) {
    return fetch(`${this.BASE_URL}/messages/inbox/${userId}`, {
      headers: { 'Authorization': `Bearer ${this.AUTH_TOKEN}` }
    }).then(r => r.json());
  },

  trackEvent: async function(userId, eventType, eventData) {
    return fetch(`${this.BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.AUTH_TOKEN}`
      },
      body: JSON.stringify({ userId, eventType, eventData, timestamp: new Date().toISOString() })
    }).catch(e => console.log('Analytics tracking'));
  },

  setAuthToken: function(token) {
    this.AUTH_TOKEN = token;
    localStorage.setItem('auth_token', token);
  },

  isAuthenticated: function() {
    return !!this.AUTH_TOKEN || !!localStorage.getItem('auth_token');
  }
};

export default API;
