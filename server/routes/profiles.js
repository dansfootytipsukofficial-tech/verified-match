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

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT id, username, email, bio, photos, age, location, interests, gender, created_at
      FROM users
      WHERE id = ?
    `;
    
    db.query(query, [userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json(results[0]);
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/update', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, location, interests, photos } = req.body;
    
    const query = `
      UPDATE users 
      SET bio = COALESCE(?, bio), 
          location = COALESCE(?, location), 
          interests = COALESCE(?, interests),
          photos = COALESCE(?, photos),
          updated_at = NOW()
      WHERE id = ?
    `;
    
    db.query(query, [bio, location, interests, photos, userId], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to update profile' });
      res.json({ message: 'Profile updated successfully' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users
router.get('/search/query', async (req, res) => {
  try {
    const { q, gender, ageMin, ageMax, location } = req.query;
    
    let query = 'SELECT id, username, bio, photos, age, location, gender FROM users WHERE 1=1';
    const params = [];
    
    if (q) {
      query += ' AND (username LIKE ? OR bio LIKE ? OR location LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    
    if (gender) {
      query += ' AND gender = ?';
      params.push(gender);
    }
    
    if (ageMin) {
      query += ' AND age >= ?';
      params.push(parseInt(ageMin));
    }
    
    if (ageMax) {
      query += ' AND age <= ?';
      params.push(parseInt(ageMax));
    }
    
    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }
    
    query += ' LIMIT 20';
    
    db.query(query, params, (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user statistics
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const matchQuery = 'SELECT COUNT(*) as total_matches FROM matches WHERE user_id = ? AND action = "like"';
    const messageQuery = 'SELECT COUNT(*) as total_messages FROM messages WHERE sender_id = ?';
    const visitQuery = 'SELECT COUNT(*) as total_visits FROM user_visits WHERE visited_user_id = ?';
    
    Promise.all([
      new Promise((resolve, reject) => {
        db.query(matchQuery, [userId], (err, results) => {
          err ? reject(err) : resolve(results[0]);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(messageQuery, [userId], (err, results) => {
          err ? reject(err) : resolve(results[0]);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(visitQuery, [userId], (err, results) => {
          err ? reject(err) : resolve(results[0]);
        });
      })
    ]).then(([matches, messages, visits]) => {
      res.json({ ...matches, ...messages, ...visits });
    }).catch(err => {
      res.status(500).json({ error: 'Database error' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
