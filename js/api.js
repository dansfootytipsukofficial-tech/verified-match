// VERIFIED MATCH - Comprehensive API Integration Layer
// Frontend to Backend Communication Service
// Supports all dating platform features with error handling and token management

const API = {
  // Configuration
  BASE_URL: 'http://localhost:5000/api', // Change to your deployed backend URL
  AUTH_TOKEN: localStorage.getItem('auth_token') || null,

  // ==================== AUTH ENDPOINTS ====================
  auth: {
    register: async (email, password, username, gender, age, bio) => {
      try {
        const response = await fetch(`${API.BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, username, gender, age, bio })
        });
        const data = await response.json();
        if (data.token) {
          API.AUTH_TOKEN = data.token;
          localStorage.setItem('auth_token', data.token);
        }
        return data;
      } catch (error) {
        console.error('Register error:', error);
        return { error: error.message };
      }
    },

    login: async (email, password) => {
      try {
        const response = await fetch(`${API.BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.token) {
          API.AUTH_TOKEN = data.token;
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_id', data.userId);
        }
        return data;
      } catch (error) {
        console.error('Login error:', error);
        return { error: error.message };
      }
    },

    logout: () => {
      API.AUTH_TOKEN = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      window.location.href = '/pages/index.html';
    },

    verifyEmail: async (token) => {
      try {
        const response = await fetch(`${API.BASE_URL}/auth/verify/${token}`, {
          method: 'POST'
        });
        return await response.json();
      } catch (error) {
        console.error('Verify email error:', error);
        return { error: error.message };
      }
    }
  },

  // ==================== PROFILE ENDPOINTS ====================
  profiles: {
    getProfile: async (userId) => {
      try {
        const response = await fetch(`${API.BASE_URL}/profiles/${userId}`);
        return await response.json();
      } catch (error) {
        console.error('Get profile error:', error);
        return { error: error.message };
      }
    },

    updateProfile: async (bio, location, interests, photos) => {
      try {
        const response = await fetch(`${API.BASE_URL}/profiles/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API.AUTH_TOKEN}`
          },
          body: JSON.stringify({ bio, location, interests, photos })
        });
        return await response.json();
      } catch (error) {
        console.error('Update profile error:', error);
        return { error: error.message };
      }
    },

    searchUsers: async (query, gender, ageMin, ageMax, location) => {
      try {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (gender) params.append('gender', gender);
        if (ageMin) params.append('ageMin', ageMin);
        if (ageMax) params.append('ageMax', ageMax);
        if (location) params.append('location', location);

        const response = await fetch(`${API.BASE_URL}/profiles/search/query?${params}`);
        return await response.json();
      } catch (error) {
        console.error('Search users error:', error);
        return { error: error.message };
      }
    },

    getStats: async (userId) => {
      try {
        const response = await fetch(`${API.BASE_URL}/profiles/${userId}/stats`);
        return await response.json();
      } catch (error) {
        console.error('Get stats error:', error);
        return { error: error.message };
      }
    }
  },

  // ==================== MATCHES ENDPOINTS ====================
  matches: {
    getPotentialMatches: async () => {
      try {
        const response = await fetch(`${API.BASE_URL}/matches/potential`, {
          headers: { 'Authorization': `Bearer ${API.AUTH_TOKEN}` }
        });
        return await response.json();
      } catch (error) {
        console.error('Get potential matches error:', error);
        return { error: error.message };
      }
    },

    createMatch: async (matchedUserId, action) => {
      try {
        const response = await fetch(`${API.BASE_URL}/matches/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API.AUTH_TOKEN}`
          },
          body: JSON.stringify({ matched_user_id: matchedUserId, action })
        });
        return await response.json();
      } catch (error) {
        console.error('Create match error:', error);
        return { error: error.message };
      }
    },

    getMyMatches: async () => {
      try {
        const response = await fetch(`${API.BASE_URL}/matches/my-matches`, {
          headers: { 'Authorization': `Bearer ${API.AUTH_TOKEN}` }
        });
        return await response.json();
      } catch (error) {
        console.error('Get my matches error:', error);
        return { error: error.message };
      }
    },

    deleteMatch: async (matchId) => {
      try {
        const response = await fetch(`${API.BASE_URL}/matches/${matchId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${API.AUTH_TOKEN}` }
        });
        return await response.json();
      } catch (error) {
        console.error('Delete match error:', error);
        return { error: error.message };
      }
    }
  },

  // ==================== MESSAGES ENDPOINTS ====================
  messages: {
    sendMessage: async (recipientId, content) => {
      try {
        const response = await fetch(`${API.BASE_URL}/messages/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API.AUTH_TOKEN}`
          },
          body: JSON.stringify({ recipient_id: recipientId, content })
        });
        return await response.json();
      } catch (error) {
        console.error('Send message error:', error);
        return { error: error.message };
      }
    },

    getConversation: async (userId) => {
      try {
        const response = await fetch(`${API.BASE_URL}/messages/conversation/${userId}`, {
          headers: { 'Authorization': `Bearer ${API.AUTH_TOKEN}` }
        });
        return await response.json();
      } catch (error) {
        console.error('Get conversation error:', error);
        return { error: error.message };
      }
    },

    getConversations: async () => {
      try {
        const response = await fetch(`${API.BASE_URL}/messages/conversations`, {
          headers: { 'Authorization': `Bearer ${API.AUTH_TOKEN}` }
        });
        return await response.json();
      } catch (error) {
        console.error('Get conversations error:', error);
        return { error: error.message };
      }
    },

    markAsRead: async (messageId) => {
      try {
        const response = await fetch(`${API.BASE_URL}/messages/${messageId}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${API.AUTH_TOKEN}` }
        });
        return await response.json();
      } catch (error) {
        console.error('Mark as read error:', error);
        return { error: error.message };
      }
    }
  },

  // ==================== UTILITY FUNCTIONS ====================
  isAuthenticated: () => {
    return API.AUTH_TOKEN !== null;
  },

  getUserId: () => {
    return localStorage.getItem('user_id');
  },

  setBaseUrl: (url) => {
    API.BASE_URL = url;
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
