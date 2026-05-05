// ============================================
// VERIFIED MATCH - Authentication System
// Handles user login, signup, and session management
// ============================================

const Auth = {
  currentUser: null,
  isAuthenticated: false,

  // Initialize authentication on page load
  init: async function() {
    const stored = Utils.getStoredUser();
    if (stored) {
      this.currentUser = stored;
      this.isAuthenticated = true;
      this.updateUI();
    }
  },

  // Sign up new user
  signup: async function(email, password, fullName) {
    try {
      const { data, error } = await API.auth.signup(email, password);
      
      if (error) {
        throw new Error(error.message);
      }

      // Create user profile
      const profile = {
        user_id: data.user.id,
        email: email,
        full_name: fullName,
        created_at: new Date(),
        verified: false,
      };

      const { error: profileError } = await API.users.createProfile(data.user.id, profile);
      if (profileError) throw new Error(profileError.message);

      // Login automatically after signup
      this.currentUser = { id: data.user.id, email: email, name: fullName };
      this.isAuthenticated = true;
      Utils.storeUser(this.currentUser);
      this.updateUI();

      return { success: true, message: 'Account created successfully!' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Login existing user
  login: async function(email, password) {
    try {
      const { data, error } = await API.auth.login(email, password);
      
      if (error) {
        throw new Error(error.message);
      }

      // Get user profile
      const { data: profile, error: profileError } = await API.users.getProfile(data.user.id);
      if (profileError) throw new Error(profileError.message);

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

  // Logout user
  logout: async function() {
    try {
      await API.auth.logout();
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

  // Verify email
  verifyEmail: async function(token) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: this.currentUser.email,
        token: token,
        type: 'email',
      });

      if (error) throw new Error(error.message);
      return { success: true, message: 'Email verified successfully!' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reset password
  resetPassword: async function(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw new Error(error.message);
      return { success: true, message: 'Password reset email sent!' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update password
  updatePassword: async function(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      return { success: true, message: 'Password updated successfully!' };
    } catch (error) {
      return { success: false, error: error.message };
    }
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
    <span>${message}</span>
    <button class="close-btn" onclick="this.parentElement.remove()">×</button>
  `;

  alertsContainer.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Initialize auth when page loads
document.addEventListener('DOMContentLoaded', function() {
  Auth.init();
});
