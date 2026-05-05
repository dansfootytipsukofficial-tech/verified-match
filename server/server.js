// Verified Match Backend Server - Express API
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/verified-match';

// Security Middleware
app.use(helmet());

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8000',
    'https://dansfootytipsukofficial-tech.github.io'
  ],
  credentials: true
};
app.use(cors(corsOptions));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('DB Error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Verified Match API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'Verified Match API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      matches: '/api/matches',
      messages: '/api/messages'
    }
  });
});

// Auth Endpoints
app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Register - Coming soon' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login - Coming soon' });
});

// Matches Endpoints
app.get('/api/matches/browse', (req, res) => {
  res.json({ message: 'Browse matches - Coming soon' });
});

app.post('/api/matches/like', (req, res) => {
  res.json({ message: 'Like match - Coming soon' });
});

app.post('/api/matches/pass', (req, res) => {
  res.json({ message: 'Pass match - Coming soon' });
});

// Error Handlers
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Verified Match API Running on http://localhost:${PORT}`);
  console.log(`📚 Docs: http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health\n`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    mongoose.connection.close(false);
    process.exit(0);
  });
});

module.exports = app;
