// Verified Match - Shared JavaScript Utilities
// This file provides common functionality across all pages

'use strict';

/**
 * Verified Match Utilities
 * Collection of helper functions for the dating platform
 */
const VerifiedMatch = {
    /**
     * Initialize common functionality on page load
     */
    init: function() {
        this.setupNavigation();
        this.setupFormValidation();
        this.setupEventListeners();
        console.log('Verified Match initialized');
    },

    /**
     * Setup navigation functionality
     */
    setupNavigation: function() {
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    },

    /**
     * Setup form validation
     */
    setupFormValidation: function() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });
        });
    },

    /**
     * Validate form inputs
     * @param {HTMLFormElement} form - The form to validate
     * @returns {boolean} - Whether the form is valid
     */
    validateForm: function(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showError(input, 'This field is required');
                isValid = false;
            } else if (input.type === 'email' && !this.isValidEmail(input.value)) {
                this.showError(input, 'Please enter a valid email address');
                isValid = false;
            } else if (input.type === 'password' && input.value.length < 8) {
                this.showError(input, 'Password must be at least 8 characters');
                isValid = false;
            } else {
                this.clearError(input);
            }
        });
        
        return isValid;
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean}
     */
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Show error message for input
     * @param {HTMLElement} input - The input element
     * @param {string} message - Error message
     */
    showError: function(input, message) {
        input.classList.add('is-invalid');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        input.parentElement.appendChild(errorDiv);
    },

    /**
     * Clear error message for input
     * @param {HTMLElement} input - The input element
     */
    clearError: function(input) {
        input.classList.remove('is-invalid');
        const errorDiv = input.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners: function() {
        // Close mobile menu on link click
        const menuLinks = document.querySelectorAll('nav a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Setup mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
    },

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu: function() {
        const nav = document.querySelector('nav');
        if (nav) {
            nav.classList.toggle('is-open');
        }
    },

    /**
     * Close mobile menu
     */
    closeMobileMenu: function() {
        const nav = document.querySelector('nav');
        if (nav) {
            nav.classList.remove('is-open');
        }
    },

    /**
     * Show notification/toast message
     * @param {string} message - Message to display
     * @param {string} type - 'success', 'error', 'info', 'warning'
     * @param {number} duration - Duration in milliseconds
     */
    showNotification: function(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${this.getToastColor(type)};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * Get toast color based on type
     * @param {string} type - Toast type
     * @returns {string} - Color code
     */
    getToastColor: function(type) {
        const colors = {
            'success': '#00d084',
            'error': '#ff6b6b',
            'warning': '#ffa502',
            'info': '#00a8ff'
        };
        return colors[type] || colors['info'];
    },

    /**
     * Store data in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     */
    setStorage: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    },

    /**
     * Get data from localStorage
     * @param {string} key - Storage key
     * @returns {*} - Retrieved value or null
     */
    getStorage: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    removeStorage: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    },

    /**
     * Make API request
     * @param {string} url - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise} - Promise resolving to response
     */
    apiRequest: function(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        return fetch(url, { ...defaultOptions, ...options })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`API Error: ${response.statusText}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('API Request Error:', error);
                this.showNotification('An error occurred. Please try again.', 'error');
                throw error;
            });
    },

    /**
     * Debounce function for performance
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated: function() {
        const token = this.getStorage('authToken');
        return !!token;
    },

    /**
     * Logout user
     */
    logout: function() {
        this.removeStorage('authToken');
        this.removeStorage('userData');
        window.location.href = 'login.html';
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        VerifiedMatch.init();
    });
} else {
    VerifiedMatch.init();
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VerifiedMatch;
}
