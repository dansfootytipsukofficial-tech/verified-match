// ============================================
// VERIFIED MATCH - App Configuration
// Supabase & API settings for the dating platform
// ============================================

const Config = {
  // App Info
  APP_NAME: 'Verified Match',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Premium UK Dating Platform',

  // Supabase Configuration
  // Replace ANON_KEY_PLACEHOLDER with your actual anon key from Supabase dashboard
  SUPABASE_URL: 'https://kufsulefrcrqqvxfobdm.supabase.co',
  SUPABASE_ANON_KEY: 'ANON_KEY_PLACEHOLDER',

  // Auth Settings
  MIN_AGE: 18,
  MAX_AGE: 99,
  MIN_PASSWORD_LENGTH: 8,
  ALLOWED_GENDERS: ['male', 'female', 'other'],
  DEFAULT_LOCATION: 'London',

  // Swiping Limits (Free vs Premium)
  FREE_DAILY_SWIPES: 20,
  FREE_DAILY_SUPER_LIKES: 5,
  PREMIUM_DAILY_SWIPES: -1, // unlimited
  PREMIUM_DAILY_SUPER_LIKES: 20,

  // Premium Pricing (GBP)
  PRICING: {
    FREE: { price: 0, period: 'month', label: 'Free' },
    GOLD: { price: 9.99, period: 'month', label: 'Premium Gold' },
    GOLD_YEARLY: { price: 5.99, billed: 'yearly', label: 'Premium Gold (Yearly)' },
    PLATINUM: { price: 19.99, period: 'month', label: 'Premium Platinum' },
    PLATINUM_YEARLY: { price: 9.99, billed: 'yearly', label: 'Premium Platinum (Yearly)' },
  },

  // Profile Requirements
  REQUIRED_PROFILE_FIELDS: ['username', 'email', 'gender', 'age', 'bio', 'location'],
  PROFILE_COMPLETION_WEIGHTS: {
    photo: 25,
    bio: 20,
    interests: 20,
    verification: 20,
    preferences: 15,
  },

  // Matching Algorithm
  MATCHING: {
    MIN_COMPATIBILITY_SCORE: 40,
    INTEREST_MATCH_BONUS: 10,
    AGE_RANGE_TOLERANCE: 5,
    DISTANCE_WEIGHT: 0.3,
    INTEREST_WEIGHT: 0.4,
    ACTIVITY_WEIGHT: 0.2,
    VERIFICATION_WEIGHT: 0.1,
  },

  // Verification Levels
  VERIFICATION_LEVELS: {
    NONE: 0,
    EMAIL: 1,
    PHOTO: 2,
    IDENTITY: 3,
    VIDEO: 4,
  },

  // UI Settings
  DEFAULT_THEME: 'light',
  LOADING_TIMEOUT: 10000,
  API_TIMEOUT: 8000,
  MAX_PROFILE_PHOTOS: 6,

  // Notification Types
  NOTIFICATION_TYPES: ['match', 'message', 'like', 'visit', 'verification', 'promotion'],

  // Interest Categories
  INTERESTS: [
    'Travel', 'Music', 'Fitness', 'Cooking', 'Art', 'Gaming',
    'Reading', 'Hiking', 'Photography', 'Fashion', 'Films',
    'Yoga', 'Running', 'Cycling', 'Vegan', 'Brunch', 'Wine',
    'Theatre', 'Cinema', 'Netflix', 'Tech', 'Dogs', 'Cats',
    'Dancing', 'Sports', 'Photography', 'Hiking',
  ],

  // Ice Breaker Categories
  ICEBREAKER_CATEGORIES: ['Fun', 'Deep', 'Travel', 'Food', 'Music', 'Movies', 'Adventure'],

  // Date Idea Filters
  DATE_FILTERS: {
    budgets: ['Free', 'Under GBP20', 'Under GBP50', 'Under GBP100', 'Luxury'],
    types: ['Outdoor', 'Indoor', 'Active', 'Relaxed', 'Romantic', 'Social'],
    vibes: ['Casual', 'Romantic', 'Adventurous', 'Chill', 'Classic'],
  },

  // Utility Functions
  isDev: () => window.location.hostname.includes('localhost'),
  isProd: () => window.location.hostname.includes('github.io'),

  // Get Supabase config as object
  getSupabaseConfig: () => ({
    url: Config.SUPABASE_URL,
    key: Config.SUPABASE_ANON_KEY,
  }),
};

if (typeof window !== 'undefined') {
  window.Config = Config;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Config;
}
