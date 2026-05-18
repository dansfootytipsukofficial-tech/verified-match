// ============================================
// VERIFIED MATCH – Authentication System (Supabase)
// Leverages Supabase Auth for login, signup, and session management
// ============================================

const Auth = {
  currentUser: null,
  isAuthenticated: false,

  // Initialize authentication on page load using Supabase session
  init: async function() {
    if (!window.SupabaseService || !window.SupabaseService.isReady()) {
      // Supabase not ready yet, check localStorage as fallback
      const stored = Utils.getStoredUser();
      if (stored) {
        this.currentUser = stored;
        this.isAuthenticated = true;
        this.updateUI();
      }
      return;
    }

    try {
      // Check for active Supabase session
      const { data: { session }, error } = await window.SupabaseService.auth.getSession();
      if (error || !session) {
        // No active session
        Utils.clearStoredUser();
        return;
      }

      // Active session found – set current user
      const user = session.user;
      let profile = null;
      try {
        profile = await window.dbService.getProfile(user.id);
      } catch (e) {
        // Profile might not exist yet
      }

      this.currentUser = {
        id: user.id,
        email: user.email,
        name: profile?.full_name || user.email?.split('@')[0] || 'User',
        verified: profile?.verified || false,
      };
      this.isAuthenticated = true;
      Utils.storeUser(this.currentUser);
      this.updateUI();
    } catch (error) {
      console.error('Auth init error:', error);
    }
  },

  // Sign up new user using Supabase Auth
  signup: async function(email, password, fullName) {
    try {
      const { data, error } = await window.SupabaseService.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Create user profile in Supabase
      const profile = {
        user_id: data.user.id,
        email: email,
        full_name: fullName,
        created_at: new Date().toISOString(),
        verified: false,
      };
      await window.dbService.addProfile(profile);

      // Login automatically after signup if session exists
      if (data.session) {
        this.currentUser = {
          id: data.user.id,
          email: email,
          name: fullName,
        };
        this.isAuthenticated = true;
        Utils.storeUser(this.currentUser);
        this.updateUI();
      }

      return { success: true, message: 'Account created successfully!' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Login existing user using Supabase Auth
  login: async function(email, password) {
    try {
      const { data, error } = await window.SupabaseService.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        throw new Error(error.message);
      }

      // Get user profile
      let profile = null;
      try {
        profile = await window.dbService.getProfile(data.user.id);
      } catch (e) {
        // Profile might not exist
      }

      this.currentUser = {
        id: data.user.id,
        email: data.user.email,
        name: profile?.full_name || 'User',
        verified: profile?.verified || false,
      };
      this.isAuthenticated = true;
      Utils.storeUser(this.currentUser);
      this.updateUI();

      return { success: true, message: 'Logged in successfully!' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Logout user using Supabase Auth
  logout: async function() {
    try {
      await window.SupabaseService.auth.signOut();
      this.currentUser = null;
      this.isAuthenticated = false;
      Utils.clearStoredUser();
      this.updateUI();
      window.location.href = 'index.html';
      return { success: true, message: 'Logged out successfully!' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Check if user is authenticated
  isLoggedIn: function() {
    return this.isAuthenticated && this.currentUser !== null;
  },

  // Get current user
  getUser: function() {
    return this.currentUser;
  },

  // Update UI based on auth state
  updateUI: function() {
    const authBtn = document.getElementById('auth-btn');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    if (this.isLoggedIn()) {
      if (authBtn) authBtn.style.display = 'none';
      if (userMenu) userMenu.style.display = 'block';
      if (userName) userName.textContent = this.currentUser.name || this.currentUser.email;
    } else {
      if (authBtn) authBtn.style.display = 'block';
      if (userMenu) userMenu.style.display = 'none';
    }
  },

  // Redirect to login if not authenticated
  requireAuth: function(redirectTo = 'login.html') {
    if (!this.isLoggedIn()) {
      window.location.href = redirectTo;
    }
  },

  // Verify email using Supabase Auth
  verifyEmail: async function(token) {
    try {
      const { data, error } = await window.SupabaseService.auth.verifyOtp({
        email: this.currentUser?.email,
        token: token,
        type: 'email',
      });
      if (error) throw new Error(error.message);
      return { success: true, message: 'Email verified successfully!' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reset password using Supabase Auth
  resetPassword: async function(email) {
    try {
      const { error } = await window.SupabaseService.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password.html`
      });
      if (error) throw new Error(error.message);
      return { success: true, message: 'Password reset email sent!' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update password using Supabase Auth
  updatePassword: async function(newPassword) {
    try {
      const { error } = await window.SupabaseService.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      return { success: true, message: 'Password updated successfully!' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current Supabase session
  getSession: async function() {
    if (!window.SupabaseService) return null;
    const { data } = await window.SupabaseService.auth.getSession();
    return data?.session || null;
  },

  // Get current Supabase user
  getSupabaseUser: async function() {
    if (!window.SupabaseService) return null;
    const { data } = await window.SupabaseService.auth.getUser();
    return data?.user || null;
  },

  // Listen for auth state changes
  onAuthChange: function(callback) {
    if (!window.SupabaseService) return;
    window.SupabaseService.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = session.user;
        let profile = null;
        try {
          profile = await window.dbService.getProfile(user.id);
        } catch (e) {}
        Auth.currentUser = {
          id: user.id,
          email: user.email,
          name: profile?.full_name || user.email?.split('@')[0] || 'User',
          verified: profile?.verified || false,
        };
        Auth.isAuthenticated = true;
        Utils.storeUser(Auth.currentUser);
      } else if (event === 'SIGNED_OUT') {
        Auth.currentUser = null;
        Auth.isAuthenticated = false;
        Utils.clearStoredUser();
      }
      Auth.updateUI();
      callback(event, session);
    });
  },
};

// ============================================
// FORM HANDLERS
// ============================================

function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const fullName = document.getElementById('signup-name').value;
  const confirmPassword = document.getElementById('signup-confirm').value;

  // Validation
  if (!email || !password || !fullName || !confirmPassword) {
    showAlert('All fields are required', 'warning');
    return;
  }
  if (!Utils.isValidEmail(email)) {
    showAlert('Please enter a valid email address', 'danger');
    return;
  }
  if (password.length < 8) {
    showAlert('Password must be at least 8 characters long', 'danger');
    return;
  }
  if (password !== confirmPassword) {
    showAlert('Passwords do not match', 'danger');
    return;
  }

  Auth.signup(email, password, fullName).then(result => {
    if (result.success) {
      showAlert(result.message, 'success');
      setTimeout(() => {
        window.location.href = 'profile.html';
      }, 1500);
    } else {
      showAlert(result.error, 'danger');
    }
  });
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showAlert('Email and password are required', 'warning');
    return;
  }
  if (!Utils.isValidEmail(email)) {
    showAlert('Please enter a valid email address', 'danger');
    return;
  }

  Auth.login(email, password).then(result => {
    if (result.success) {
      showAlert(result.message, 'success');
      setTimeout(() => {
        window.location.href = 'browse.html';
      }, 1500);
    } else {
      showAlert(result.error, 'danger');
    }
  });
}

function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    Auth.logout();
  }
}

// ============================================
// UI HELPERS
// ============================================

function showAlert(message, type = 'info') {
  const alertsContainer = document.getElementById('alerts-container');
  if (!alertsContainer) return;
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="close" data-dismiss="alert">&times;</button>
  `;
  alertsContainer.appendChild(alertDiv);
  setTimeout(() => { alertDiv.remove(); }, 5000);
}

// Initialize auth when page loads
document.addEventListener('DOMContentLoaded', function() {
  Auth.init();
});
