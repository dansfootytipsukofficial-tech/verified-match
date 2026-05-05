// ============================================
// VERIFIED MATCH - Configuration
// ============================================

// SUPABASE CONFIGURATION
// Get these values from your Supabase project:
// 1. Go to https://supabase.com/dashboard
// 2. Click on your verified-match project
// 3. Go to Settings > API
// 4. Copy the URL and anon key below

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';

// Initialize Supabase
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// APP CONFIGURATION
// ============================================

const APP_CONFIG = {
  name: 'Verified Match',
  version: '1.0.0',
  description: 'Premium UK Dating Platform',
  
  // User Settings
  user: {
    minAge: 18,
    maxAge: 100,
    minBioLength: 50,
    maxBioLength: 500,
    maxPhotoUploadMB: 5,
    requiredPhotos: 2,
  },
  
  // Matching Algorithm Settings
  matching: {
    minCompatibilityScore: 50,
    weightedFactors: {
      agePreference: 0.20,
      location: 0.25,
      interests: 0.30,
      personality: 0.15,
      values: 0.10,
    },
    maxDistance: 50, // kilometers
  },
  
  // Premium Features
  premium: {
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    features: ['unlimited_messages', 'priority_matches', 'verified_badge', 'advanced_filters'],
  },
  
  // Verification Settings
  verification: {
    requiresEmail: true,
    requiresPhone: false,
    requiresIDUpload: true,
    requiresPhotoVerification: true,
  },
};

// ============================================
// API ENDPOINTS
// ============================================

const API = {
  auth: {
    signup: async (email, password) => {
      return await supabase.auth.signUp({ email, password });
    },
    login: async (email, password) => {
      return await supabase.auth.signInWithPassword({ email, password });
    },
    logout: async () => {
      return await supabase.auth.signOut();
    },
    getCurrentUser: async () => {
      return await supabase.auth.getUser();
    },
  },
  
  users: {
    getProfile: async (userId) => {
      return await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    },
    updateProfile: async (userId, data) => {
      return await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', userId);
    },
    createProfile: async (userId, data) => {
      return await supabase
        .from('profiles')
        .insert([{ user_id: userId, ...data }]);
    },
  },
  
  matches: {
    getMatches: async (userId) => {
      return await supabase
        .from('matches')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'matched');
    },
    getAllPotentialMatches: async (userId) => {
      return await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', userId);
    },
    likeProfile: async (userId, likedId) => {
      return await supabase
        .from('matches')
        .insert([{
          user_id: userId,
          matched_user_id: likedId,
          status: 'interested',
        }]);
    },
  },
  
  messages: {
    getConversation: async (userId, matchedUserId) => {
      return await supabase
        .from('messages')
        .select('*')
        .or(`and(user_id.eq.${userId},recipient_id.eq.${matchedUserId}),and(user_id.eq.${matchedUserId},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true });
    },
    sendMessage: async (userId, recipientId, message) => {
      return await supabase
        .from('messages')
        .insert([{
          user_id: userId,
          recipient_id: recipientId,
          message: message,
          created_at: new Date(),
        }]);
    },
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
  // Calculate age from birthdate
  calculateAge: (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  },
  
  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
  
  // Format date nicely
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },
  
  // Validate email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Get stored user from localStorage
  getStoredUser: () => {
    const stored = localStorage.getItem('verified_match_user');
    return stored ? JSON.parse(stored) : null;
  },
  
  // Store user in localStorage
  storeUser: (user) => {
    localStorage.setItem('verified_match_user', JSON.stringify(user));
  },
  
  // Clear stored user
  clearStoredUser: () => {
    localStorage.removeItem('verified_match_user');
  },
};

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUPABASE_URL, SUPABASE_ANON_KEY, APP_CONFIG, API, Utils, supabase };
}
