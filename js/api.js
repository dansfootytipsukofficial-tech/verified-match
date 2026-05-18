// ==============================================
// VERIFIED MATCH – API Service Layer (Supabase)
// Replaces REST endpoints with Supabase-backed calls
// Maintains same API surface for existing code
// ==============================================

/**
 * API – Unified service layer using dbService (Supabase-backed)
 * Replaces fetch() calls with direct dbService calls
 * Keeps backward-compatible method signatures
 */
const API = {
  // Configuration – BASE_URL no longer needed with Supabase
  BASE_URL: null,
  AUTH_TOKEN: localStorage.getItem('auth_token') || null,

  // ==================== AUTH ENDPOINTS ====================
  auth: {
    register: async (email, password, username, gender, age, bio) => {
      try {
        // Create user in Supabase auth
        const { data, error } = await window.SupabaseService.auth
          .signUp({ email, password, options: { data: { username, gender, age, bio } } });
        if (error) {
          console.error('Register error:', error);
          return { error: error.message };
        }
        if (data.session) {
          API.AUTH_TOKEN = data.session.access_token;
          localStorage.setItem('auth_token', data.session.access_token);
          localStorage.setItem('user_id', data.user.id);
        }
        return data;
      } catch (error) {
        console.error('Register error:', error);
        return { error: error.message };
      }
    },

    login: async (email, password) => {
      try {
        const { data, error } = await window.SupabaseService.auth
          .signInWithPassword({ email, password });
        if (error) {
          console.error('Login error:', error);
          return { error: error.message };
        }
        if (data.session) {
          API.AUTH_TOKEN = data.session.access_token;
          localStorage.setItem('auth_token', data.session.access_token);
          localStorage.setItem('user_id', data.user.id);
        }
        return data;
      } catch (error) {
        console.error('Login error:', error);
        return { error: error.message };
      }
    },

    logout: () => {
      window.SupabaseService.auth.signOut().then(() => {
        API.AUTH_TOKEN = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        window.location.href = '/pages/index.html';
      });
    },

    verifyEmail: async (token) => {
      try {
        const { data, error } = await window.SupabaseService.auth
          .verifyOtp({ token_hash: token, type: 'email' });
        if (error) return { error: error.message };
        return data;
      } catch (error) {
        console.error('Verify email error:', error);
        return { error: error.message };
      }
    },

    getCurrentUser: async () => {
      const { data, error } = await window.SupabaseService.auth.getUser();
      if (error) return null;
      return data.user;
    },

    resetPassword: async (email) => {
      const { error } = await window.SupabaseService.auth
        .resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password.html` });
      if (error) return { error: error.message };
      return { success: true };
    }
  },

  // ==================== PROFILE ENDPOINTS ====================
  profiles: {
    getProfile: async (userId) => {
      try {
        return await window.dbService.getProfile(userId);
      } catch (error) {
        console.error('Get profile error:', error);
        return { error: error.message };
      }
    },

    updateProfile: async (bio, location, interests, photos, userId) => {
      try {
        const targetId = userId || API.getUserId();
        const updates = { bio, location, interests, photos };
        return await window.dbService.updateProfile(targetId, updates);
      } catch (error) {
        console.error('Update profile error:', error);
        return { error: error.message };
      }
    },

    searchUsers: async (query, gender, ageMin, ageMax, location) => {
      try {
        const { data, error } = await window.SupabaseService
          .select('profiles');
        if (error) throw error;
        // Filter locally
        let results = data || [];
        if (query) results = results.filter(p =>
          (p.username || '').toLowerCase().includes(query.toLowerCase())
        );
        if (gender) results = results.filter(p => p.gender === gender);
        if (ageMin) results = results.filter(p => p.age >= parseInt(ageMin));
        if (ageMax) results = results.filter(p => p.age <= parseInt(ageMax));
        if (location) results = results.filter(p =>
          (p.location || '').toLowerCase().includes(location.toLowerCase())
        );
        return results;
      } catch (error) {
        console.error('Search users error:', error);
        return { error: error.message };
      }
    },

    getStats: async (userId) => {
      try {
        const profile = await window.dbService.getProfile(userId);
        const matches = await window.dbService.getMatches(userId);
        return {
          profileViews: profile?.views || 0,
          matchesCount: matches.length,
          messagesSent: 0,
          likesReceived: 0
        };
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
        const currentUserId = API.getUserId();
        const existingMatches = await window.dbService.getMatches(currentUserId);
        const matchedIds = new Set(existingMatches.map(m =>
          m.userId === currentUserId ? m.matchId : m.userId
        ));
        const allUsers = await window.dbService.getAllUsers();
        return allUsers.filter(u => u.id !== currentUserId && !matchedIds.has(u.id));
      } catch (error) {
        console.error('Get potential matches error:', error);
        return { error: error.message };
      }
    },

    createMatch: async (matchedUserId, action) => {
      try {
        const currentUserId = API.getUserId();
        if (action === 'like') {
          const match = {
            userId: currentUserId,
            matchId: matchedUserId,
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          return await window.dbService.addMatch(match);
        }
        return { error: 'Invalid action' };
      } catch (error) {
        console.error('Create match error:', error);
        return { error: error.message };
      }
    },

    getMyMatches: async () => {
      try {
        const currentUserId = API.getUserId();
        return await window.dbService.getMatches(currentUserId);
      } catch (error) {
        console.error('Get my matches error:', error);
        return { error: error.message };
      }
    },

    deleteMatch: async (matchId) => {
      try {
        const { error } = await window.SupabaseService
          .delete('matches', { filter: { op: 'eq', field: 'id', value: matchId } });
        if (error) throw error;
        return { success: true };
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
        const currentUserId = API.getUserId();
        const message = {
          senderId: currentUserId,
          recipientId: recipientId,
          content: content,
          read: false,
          conversationId: [currentUserId, recipientId].sort().join('_'),
          timestamp: new Date().toISOString()
        };
        return await window.dbService.addMessage(message);
      } catch (error) {
        console.error('Send message error:', error);
        return { error: error.message };
      }
    },

    getConversation: async (userId) => {
      try {
        const currentUserId = API.getUserId();
        const conversationId = [currentUserId, userId].sort().join('_');
        return await window.dbService.getMessages(conversationId);
      } catch (error) {
        console.error('Get conversation error:', error);
        return { error: error.message };
      }
    },

    getConversations: async () => {
      try {
        const currentUserId = API.getUserId();
        const allMessages = await window.SupabaseService
          .select('messages');
        if (allMessages.error) throw allMessages.error;
        // Group messages by conversation
        const convos = {};
        (allMessages.data || []).forEach(m => {
          if (m.senderId === currentUserId || m.recipientId === currentUserId) {
            const otherId = m.senderId === currentUserId ? m.recipientId : m.senderId;
            if (!convos[otherId]) convos[otherId] = [];
            convos[otherId].push(m);
          }
        });
        return Object.entries(convos).map(([userId, msgs]) => ({
          userId: userId,
          lastMessage: msgs[msgs.length - 1],
          unreadCount: msgs.filter(m => !m.read && m.recipientId === currentUserId).length
        }));
      } catch (error) {
        console.error('Get conversations error:', error);
        return { error: error.message };
      }
    },

    markAsRead: async (messageId) => {
      try {
        const { error } = await window.SupabaseService
          .update('messages', { read: true }, { filter: { op: 'eq', field: 'id', value: messageId } });
        if (error) throw error;
        return { success: true };
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
