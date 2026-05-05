-- Verified Match Database Schema
-- Premium UK Dating Platform

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  age INT,
  bio TEXT,
  location VARCHAR(255),
  interests JSON,
  photos JSON,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP NULL,
  profile_completed BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gender (gender),
  INDEX idx_location (location),
  INDEX idx_age (age),
  INDEX idx_verified (verified)
);

CREATE TABLE matches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  matched_user_id INT NOT NULL,
  action ENUM('like', 'pass') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (matched_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_match (user_id, matched_user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_matched_user_id (matched_user_id)
);

CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  recipient_id INT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sender_id (sender_id),
  INDEX idx_recipient_id (recipient_id),
  INDEX idx_conversation (sender_id, recipient_id)
);

CREATE TABLE user_visits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  visitor_user_id INT NOT NULL,
  visited_user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (visited_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_visitor (visitor_user_id),
  INDEX idx_visited (visited_user_id)
);

CREATE TABLE user_blocks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  blocker_id INT NOT NULL,
  blocked_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_block (blocker_id, blocked_id),
  INDEX idx_blocker (blocker_id)
);
