// ================================================
// VERIFIED MATCH - Messaging System
// Real-time messaging with content moderation
// ================================================

const MessagingSystem = {
  // ================================================
  // SEND MESSAGE
  // ================================================
  
  sendMessage: function(senderId, recipientId, content) {
    const message = {
      messageId: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      conversationId: this.generateConversationId(senderId, recipientId),
      senderId: senderId,
      recipientId: recipientId,
      content: content,
      timestamp: new Date().toISOString(),
      isRead: false,
      readAt: null,
      attachments: [],
      isModerated: false,
      moderationStatus: 'pending',
      reactions: []
    };

    return message;
  },

  // ================================================
  // GENERATE CONVERSATION ID
  // ================================================
  
  generateConversationId: function(userId1, userId2) {
    return 'conv_' + [userId1, userId2].sort().join('_');
  },

  // ================================================
  // GET CONVERSATION THREAD
  // ================================================
  
  getConversationThread: function(conversationId, messages) {
    return messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  // ================================================
  // MARK MESSAGE AS READ
  // ================================================
  
  markAsRead: function(messageId, message) {
    message.isRead = true;
    message.readAt = new Date().toISOString();
    return message;
  },

  // ================================================
  // CONTENT MODERATION
  // ================================================
  
  moderateContent: function(messageContent) {
    const moderation = {
      isApproved: true,
      violations: [],
      confidence: 0.95,
      categories: {
        offensive: false,
        spam: false,
        harassment: false,
        adult: false,
        contact: false
      }
    };

    // Check for suspicious patterns
    const forbiddenPatterns = [
      /phone|whatsapp|telegram|contact/i,
      /payment|money|bitcoin|crypto/i,
      /www\.|http|ftp/i
    ];

    forbiddenPatterns.forEach((pattern, index) => {
      if (pattern.test(messageContent)) {
        moderation.isApproved = false;
        moderation.violations.push(Object.keys(moderation.categories)[index]);
      }
    });

    // Check message length
    if (messageContent.length > 5000) {
      moderation.isApproved = false;
      moderation.violations.push('message_too_long');
    }

    return moderation;
  },

  // ================================================
  // GET INBOX
  // ================================================
  
  getInbox: function(userId, messages) {
    const conversations = new Map();

    messages
      .filter(msg => msg.senderId === userId || msg.recipientId === userId)
      .forEach(msg => {
        const convId = msg.conversationId;
        if (!conversations.has(convId)) {
          conversations.set(convId, {
            conversationId: convId,
            otherUserId: msg.senderId === userId ? msg.recipientId : msg.senderId,
            lastMessage: msg,
            unreadCount: 0,
            messages: []
          });
        }

        const conv = conversations.get(convId);
        conv.messages.push(msg);
        if (msg.recipientId === userId && !msg.isRead) {
          conv.unreadCount++;
        }
        conv.lastMessage = msg;
      });

    return Array.from(conversations.values())
      .sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
  },

  // ================================================
  // TYPE NOTIFICATIONS
  // ================================================
  
  sendTypingNotification: function(userId, conversationId) {
    return {
      type: 'typing',
      userId: userId,
      conversationId: conversationId,
      timestamp: new Date().toISOString()
    };
  },

  // ================================================
  // MESSAGE REACTIONS
  // ================================================
  
  addReaction: function(messageId, userId, reaction) {
    return {
      messageId: messageId,
      userId: userId,
      reaction: reaction,
      timestamp: new Date().toISOString()
    };
  },

  // ================================================
  // BLOCK USER
  // ================================================
  
  blockUser: function(userId, blockedUserId) {
    const block = {
      userId: userId,
      blockedUserId: blockedUserId,
      blockedAt: new Date().toISOString(),
      reason: null,
      reportedForViolation: false
    };

    return block;
  },

  // ================================================
  // UNBLOCK USER
  // ================================================
  
  unblockUser: function(userId, blockedUserId, blocks) {
    return blocks.filter(block => 
      !(block.userId === userId && block.blockedUserId === blockedUserId)
    );
  },

  // ================================================
  // CHECK IF BLOCKED
  // ================================================
  
  isUserBlocked: function(userId, targetUserId, blocks) {
    return blocks.some(block =>
      (block.userId === userId && block.blockedUserId === targetUserId) ||
      (block.userId === targetUserId && block.blockedUserId === userId)
    );
  },

  // ================================================
  // REPORT MESSAGE
  // ================================================
  
  reportMessage: function(reporterId, messageId, reason) {
    const report = {
      reportId: 'report_' + Date.now(),
      reporterId: reporterId,
      messageId: messageId,
      reason: reason,
      reportedAt: new Date().toISOString(),
      status: 'pending',
      reviewedAt: null,
      reviewedBy: null,
      action: null
    };

    return report;
  },

  // ================================================
  // AUTO-DELETE CONVERSATIONS
  // ================================================
  
  autoDeleteConversations: function(conversations, daysOld = 90) {
    const deleteDate = new Date();
    deleteDate.setDate(deleteDate.getDate() - daysOld);

    return conversations.filter(conv => {
      return new Date(conv.lastMessage.timestamp) > deleteDate;
    });
  },

  // ================================================
  // MESSAGE STATISTICS
  // ================================================
  
  getMessageStats: function(userId, messages) {
    const userMessages = messages.filter(msg => msg.senderId === userId);
    const receivedMessages = messages.filter(msg => msg.recipientId === userId);

    return {
      totalSent: userMessages.length,
      totalReceived: receivedMessages.length,
      averageResponseTime: this.calculateAverageResponseTime(messages, userId),
      unreadCount: receivedMessages.filter(msg => !msg.isRead).length,
      blockedCount: 0,
      reportedCount: 0
    };
  },

  // ================================================
  // CALCULATE AVERAGE RESPONSE TIME
  // ================================================
  
  calculateAverageResponseTime: function(messages, userId) {
    const responseTimes = [];
    const sorted = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].senderId === userId && sorted[i-1].recipientId === userId) {
        const responseTime = new Date(sorted[i].timestamp) - new Date(sorted[i-1].timestamp);
        responseTimes.push(responseTime);
      }
    }

    if (responseTimes.length === 0) return null;
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    return Math.round(avgTime / 1000 / 60); // Return in minutes
  }
};

export default MessagingSystem;
