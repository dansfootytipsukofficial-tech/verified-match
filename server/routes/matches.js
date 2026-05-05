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

// Get potential matches
router.get('/potential', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userGender = req.user.gender;
    
    // Find users with opposite gender, excluding current user and already matched/rejected
    const query = `
      SELECT u.id, u.username, u.email, u.bio, u.photos, u.age, u.location, u.interests
      FROM users u
      WHERE u.id != ? AND u.gender != ? AND u.id NOT IN (
        SELECT matched_user_id FROM matches WHERE user_id = ?
      )
      LIMIT 10
    `;
    
    db.query(query, [userId, userGender, userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a match
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { matched_user_id, action } = req.body;
    const userId = req.user.id;
    
    if (!matched_user_id || !['like', 'pass'].includes(action)) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    
    const query = 'INSERT INTO matches (user_id, matched_user_id, action, created_at) VALUES (?, ?, ?, NOW())';
    db.query(query, [userId, matched_user_id, action], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to create match' });
      res.json({ message: 'Match recorded', matchId: result.insertId });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my matches
router.get('/my-matches', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT u.id, u.username, u.email, u.bio, u.photos, u.age, u.location
      FROM users u
      INNER JOIN matches m1 ON u.id = m1.matched_user_id AND m1.user_id = ?
      INNER JOIN matches m2 ON u.id = m2.user_id AND m2.matched_user_id = ?
      WHERE m1.action = 'like' AND m2.action = 'like'
    `;
    
    db.query(query, [userId, userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a match
router.delete('/:matchId', verifyToken, async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;
    
    const query = 'DELETE FROM matches WHERE id = ? AND user_id = ?';
    db.query(query, [matchId, userId], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to delete match' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Match not found' });
      res.json({ message: 'Match deleted' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
