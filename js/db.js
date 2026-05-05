class DatabaseService {
  constructor() {
    this.db = null;
    this.initDB();
  }

  initDB() {
    const request = indexedDB.open('VerifiedMatchDB', 1);
    request.onerror = () => console.error('DB init failed');
    request.onupgradeneeded = (e) => {
      this.db = e.target.result;
      if (!this.db.objectStoreNames.contains('users')) {
        this.db.createObjectStore('users', { keyPath: 'id' });
      }
      if (!this.db.objectStoreNames.contains('matches')) {
        this.db.createObjectStore('matches', { keyPath: 'id' });
      }
      if (!this.db.objectStoreNames.contains('messages')) {
        this.db.createObjectStore('messages', { keyPath: 'id' });
      }
      if (!this.db.objectStoreNames.contains('profiles')) {
        this.db.createObjectStore('profiles', { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => {
      this.db = e.target.result;
    };
  }

  async addUser(user) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      const request = store.add(user);
      request.onsuccess = () => resolve(user);
      request.onerror = () => reject(request.error);
    });
  }

  async getUser(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllUsers() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addMatch(match) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('matches', 'readwrite');
      const store = tx.objectStore('matches');
      const request = store.add(match);
      request.onsuccess = () => resolve(match);
      request.onerror = () => reject(request.error);
    });
  }

  async getMatches(userId) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('matches', 'readonly');
      const store = tx.objectStore('matches');
      const request = store.getAll();
      request.onsuccess = () => {
        const matches = request.result.filter(m => m.userId === userId || m.matchId === userId);
        resolve(matches);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addMessage(message) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('messages', 'readwrite');
      const store = tx.objectStore('messages');
      const request = store.add(message);
      request.onsuccess = () => resolve(message);
      request.onerror = () => reject(request.error);
    });
  }

  async getMessages(conversationId) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('messages', 'readonly');
      const store = tx.objectStore('messages');
      const request = store.getAll();
      request.onsuccess = () => {
        const messages = request.result.filter(m => m.conversationId === conversationId);
        resolve(messages.sort((a, b) => a.timestamp - b.timestamp));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addProfile(profile) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('profiles', 'readwrite');
      const store = tx.objectStore('profiles');
      const request = store.add(profile);
      request.onsuccess = () => resolve(profile);
      request.onerror = () => reject(request.error);
    });
  }

  async getProfile(userId) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('profiles', 'readonly');
      const store = tx.objectStore('profiles');
      const request = store.get(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateProfile(userId, updates) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('profiles', 'readwrite');
      const store = tx.objectStore('profiles');
      const getRequest = store.get(userId);
      getRequest.onsuccess = () => {
        const profile = getRequest.result || { id: userId };
        const updated = { ...profile, ...updates, lastUpdated: new Date().toISOString() };
        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve(updated);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async clearAllData() {
    return new Promise((resolve, reject) => {
      const storeNames = ['users', 'matches', 'messages', 'profiles'];
      const tx = this.db.transaction(storeNames, 'readwrite');
      let completed = 0;
      storeNames.forEach(storeName => {
        const store = tx.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => {
          completed++;
          if (completed === storeNames.length) resolve();
        };
      });
      tx.onerror = () => reject(tx.error);
    });
  }
}

const dbService = new DatabaseService();
export { dbService, DatabaseService };
