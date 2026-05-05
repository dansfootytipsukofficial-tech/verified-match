const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema for Verified Match
const userSchema = new mongoose.Schema({
  // Basic Info
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  phone: {
    type: String,
    default: null
  },

  // Profile Info
  age: {
    type: Number,
    required: [true, 'Please provide your age'],
    min: 18,
    max: 100
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
    required: true
  },
  lookingFor: {
    type: String,
    enum: ['Male', 'Female', 'Both'],
    required: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  location: {
    city: String,
    postcode: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number]
    }
  },

  // Profile Photos
  profilePhotos: [
    {
      url: String,
      isMain: { type: Boolean, default: false },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],

  // Preferences
  preferences: {
    minAge: { type: Number, default: 18 },
    maxAge: { type: Number, default: 60 },
    maxDistance: { type: Number, default: 50 },
    interests: [String]
  },

  // Account Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpire: Date,

  // Verification
  identityVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String,
    uploadedAt: Date
  }],

  // Matches & Interactions
  likes: [{
    userId: mongoose.Schema.Types.ObjectId,
    likedAt: { type: Date, default: Date.now }
  }],
  passes: [{
    userId: mongoose.Schema.Types.ObjectId,
    passedAt: { type: Date, default: Date.now }
  }],
  matches: [{
    userId: mongoose.Schema.Types.ObjectId,
    matchedAt: { type: Date, default: Date.now }
  }],

  // Premium Status
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpires: Date,
  stripeCustomerId: String,

  // Activity
  lastActive: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location-based queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObj = this.toObject();
  delete userObj.password;
  delete userObj.verificationToken;
  delete userObj.stripeCustomerId;
  return userObj;
};

module.exports = mongoose.model('User', userSchema);
