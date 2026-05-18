// ==============================================
// VERIFIED MATCH – Database Service (Supabase)
// Replaces IndexedDB with Supabase backend
// ==============================================

/**
 * DatabaseService – Unified data access layer
 * Uses SupabaseService under the hood
 * Maintains same API as original IndexedDB version
 */
const DatabaseService = {
  isReady() {
    return window.SupabaseService && window.SupabaseService.isReady();
  },

  // --------- USERS ---------
  async addUser(user) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const { data, error } = await window.SupabaseService
      .insert('users', user);
    if (error) throw error;
    return data[0];
  },

  async getUser(id) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const { data, error } = await window.SupabaseService
      .select('users', { filter: { op: 'eq', field: 'id', value: id }, single: true });
    if (error) throw error;
    return data;
  },

  async getAllUsers() {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const { data, error } = await window.SupabaseService
      .select('users');
    if (error) throw error;
    return data || [];
  },

  async updateUser(id, updates) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const { data, error } = await window.SupabaseService
      .update('users', updates, { filter: { op: 'eq', field: 'id', value: id } });
    if (error) throw error;
    return data;
  },

  // --------- MATCHES ---------
  async addMatch(match) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const { data, error } = await window.SupabaseService
      .insert('matches', match);
    if (error) throw error;
    return data[0];
  },

  async getMatches(userId) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const { data, error } = await window.SupabaseService
      .select('matches');
    if (error) throw error;
    // Filter locally: matches where user is either userId or matchId
    return (data || []).filter(m =>
      m.userId === userId || m.matchId === userId
    );
  },

  // --------- MESSAGES ---------
  async addMessage(message) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const { data, error } = await window.SupabaseService
      .insert('messages', message);
    if (error) throw error;
    return data[0];
  },

  async getMessages(conversationId) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const { data, error } = await window.SupabaseService
      .select('messages');
    if (error) throw error;
    // Filter locally by conversationId, sort by timestamp
    return (data || [])
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  // --------- PROFILES ---------
  async addProfile(profile) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const { data, error } = await window.SupabaseService
      .insert('profiles', profile);
    if (error) throw error;
    return data[0];
  },

  async getProfile(userId) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const { data, error } = await window.SupabaseService
      .select('profiles', { filter: { op: 'eq', field: 'user_id', value: userId }, single: true });
    if (error) throw error;
    return data;
  },

  async updateProfile(userId, updates) {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const existing = await this.getProfile(userId);
    const updated = {
      ...existing,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    const { data, error } = await window.SupabaseService
      .update('profiles', updated, { filter: { op: 'eq', field: 'user_id', value: userId } });
    if (error) throw error;
    return data;
  },

  // --------- UTILITY ---------
  async clearAllData() {
    if (!this.isReady()) throw new Error('Supabase not initialized');
    const tables = ['users', 'matches', 'messages', 'profiles'];
    await Promise.all(tables.map(t => window.SupabaseService.delete(t)));
  }
};

// Expose globally for other modules
if (typeof window !== 'undefined') {
  window.dbService = DatabaseService;
}

export { DatabaseService };
export default DatabaseService;
