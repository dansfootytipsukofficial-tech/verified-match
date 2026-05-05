const mongoose = require('mongoose');

// Message Schema for Verified Match
const messageSchema = new mongoose.Schema({
  // Participants
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Message Content
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },

  // Message Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,

  // Media Attachments
  attachments: [
    {
      type: String,
      url: String,
      mimeType: String
    }
  ],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: Date
});

// Index for efficient message retrieval
messageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });
messageSchema.index({ recipientId: 1, isRead: 1 });

// Method to mark message as read
messageSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

module.exports = mongoose.model('Message', messageSchema);
