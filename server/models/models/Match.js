const mongoose = require('mongoose');

// Match Schema for Verified Match
const matchSchema = new mongoose.Schema({
  // Users involved in the match
  user1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Match Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending'
  },

  // Interaction History
  user1Action: {
    type: String,
    enum: ['like', 'pass', 'superlike'],
    required: true
  },
  user2Action: {
    type: String,
    enum: ['like', 'pass', 'superlike', null],
    default: null
  },

  // Match Information
  compatibility: {
    score: { type: Number, min: 0, max: 100 },
    factors: [{
      name: String,
      value: Number
    }]
  },

  // Connection Info
  firstMessageAt: Date,
  lastMessageAt: Date,
  unreadCount: { type: Number, default: 0 },

  // Timestamps
  matchedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  blockedAt: Date,
  unmatchedAt: Date
});

// Indexes for efficient queries
matchSchema.index({ user1Id: 1, status: 1 });
matchSchema.index({ user2Id: 1, status: 1 });
matchSchema.index({ matchedAt: -1 });

// Method to check if it's a mutual match
matchSchema.methods.isMutualMatch = function() {
  return this.user1Action === 'like' && this.user2Action === 'like';
};

// Method to get other user ID
matchSchema.methods.getOtherUserId = function(userId) {
  return userId.toString() === this.user1Id.toString() ? this.user2Id : this.user1Id;
};

module.exports = mongoose.model('Match', matchSchema);
