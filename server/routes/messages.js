const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Send a message
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { recipient_id, content } = req.body;
    const sender_id = req.user.id;
    
    if (!recipient_id || !content) {
      return res.status(400).json({ error: 'Missing recipient or content' });
    }
    
    const query = 'INSERT INTO messages (sender_id, recipient_id, content, created_at) VALUES (?, ?, ?, NOW())';
    db.query(query, [sender_id, recipient_id, content], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to send message' });
      res.json({ message: 'Message sent', messageId: result.insertId, createdAt: new Date() });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages with a user
router.get('/conversation/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    const query = `
      SELECT m.id, m.sender_id, m.recipient_id, m.content, m.is_read, m.created_at,
             u.username, u.email
      FROM messages m
      JOIN users u ON (m.sender_id = u.id OR m.recipient_id = u.id)
      WHERE (m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?)
      ORDER BY m.created_at ASC
    `;
    
    db.query(query, [currentUserId, userId, userId, currentUserId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all conversations
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT DISTINCT 
        CASE 
          WHEN m.sender_id = ? THEN m.recipient_id
          ELSE m.sender_id
        END as user_id,
        u.username, u.email, u.photos,
        (SELECT content FROM messages 
         WHERE (sender_id = ? AND recipient_id = u.id) OR (sender_id = u.id AND recipient_id = ?)
         ORDER BY created_at DESC LIMIT 1) as last_message,
        MAX(m.created_at) as last_message_time
      FROM messages m
      JOIN users u ON (m.sender_id = u.id OR m.recipient_id = u.id)
      WHERE m.sender_id = ? OR m.recipient_id = ?
      GROUP BY user_id
      ORDER BY last_message_time DESC
    `;
    
    db.query(query, [userId, userId, userId, userId, userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark message as read
router.put('/:messageId/read', verifyToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    
    const query = 'UPDATE messages SET is_read = 1 WHERE id = ? AND recipient_id = ?';
    db.query(query, [messageId, userId], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to mark as read' });
      res.json({ message: 'Message marked as read' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
