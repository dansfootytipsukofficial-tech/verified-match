// ============================================
// VERIFIED MATCH - Supabase Client Wrapper
// Handles all database operations via Supabase
// ============================================

// Load Supabase JS client from CDN
function loadSupabaseClient(url) {
  return new Promise((resolve, reject) => {
    if (window.supabase && window.supabase.createClient) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Supabase client'));
    document.head.appendChild(script);
  });
}

// Initialize Supabase client
const SupabaseService = {
  client: null,
  initialized: false,
  initializing: false,

  async init() {
    if (this.initialized) return this.client;
    if (this.initializing) {
      // Wait for initialization to complete
      while (this.initializing) {
        await new Promise(r => setTimeout(r, 100));
      }
      return this.client;
    }

    this.initializing = true;

    try {
      // Load Supabase client from CDN if not already loaded
      const config = window.Config || {};
      const supabaseUrl = config.SUPABASE_URL || 'https://kufsulefrcrqqvxfobdm.supabase.co';
      const supabaseKey = config.SUPABASE_ANON_KEY || '';

      if (!supabaseKey || supabaseKey === 'ANON_KEY_PLACEHOLDER') {
        console.warn('Supabase anon key not configured. Please set SUPABASE_ANON_KEY in config.js');
        // Fall back to local mode for development
        this.initializing = false;
        return null;
      }

      await loadSupabaseClient();

      // Create Supabase client
      this.client = window.supabase.createClient(supabaseUrl, supabaseKey);
      this.initialized = true;
      this.initializing = false;

      // Set up auth state listener
      this.client.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN') {
          localStorage.setItem('auth_token', session.access_token);
          localStorage.setItem('user_id', session.user.id);
          if (typeof Auth !== 'undefined' && Auth.init) {
            Auth.init();
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_id');
        }
      });

      console.log('Supabase client initialized successfully');
      return this.client;

    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      this.initializing = false;
      return null;
    }
  },

  getClient() {
    return this.client;
  },

  isReady() {
    return this.initialized && this.client !== null;
  },

  // Auth Helpers
  async signUp(email, password, userData) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  async signIn(email, password) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const { error } = await this.client.auth.signOut();
    return { error };
  },

  async getSession() {
    if (!this.isReady()) return { data: null };
    const { data, error } = await this.client.auth.getSession();
    return { data, error };
  },

  async getUser() {
    if (!this.isReady()) return { data: null };
    const { data, error } = await this.client.auth.getUser();
    return { data, error };
  },

  async resetPasswordForEmail(email) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const { error } = await this.client.auth.resetPasswordForEmail(email);
    return { error };
  },

  // Database Helpers
  async query(table, options = {}) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    let query = this.client.from(table);

    if (options.select) query = query.select(options.select);
    if (options.filter) query = query.filter(...options.filter);
    if (options.orderBy) query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending });
    if (options.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    return { data, error };
  },

  async insert(table, data) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const { data: result, error } = await this.client.from(table).insert(data).select();
    return { data: result, error };
  },

  async update(table, data, filter) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    let query = this.client.from(table).update(data).select();
    if (filter) query = query[filter.op](filter.field, filter.value);
    const { data: result, error } = await query;
    return { data: result, error };
  },

  async delete(table, filter) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    let query = this.client.from(table).delete();
    if (filter) query = query[filter.op](filter.field, filter.value);
    const { error } = await query;
    return { error };
  },

  // Realtime subscription
  subscribe(table, callback) {
    if (!this.isReady()) return null;
    return this.client
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: table }, callback)
      .subscribe();
  },
};

// Initialize on script load
if (typeof window !== 'undefined') {
  window.SupabaseService = SupabaseService;
  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SupabaseService.init());
  } else {
    SupabaseService.init();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SupabaseService;
}
