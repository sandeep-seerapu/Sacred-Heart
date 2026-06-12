const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const apiRoutes = require('./routes/api.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins in dev, configure for production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    res.status(200).json({
      success: true,
      status: 'healthy',
      database: 'connected',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'degraded',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date()
    });
  }
});

// Main API Routes
app.use('/api', apiRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.url}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server. Please try again later.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start the Server
const server = app.listen(PORT, async () => {
  console.log(`🏥 HMS Backend API Server running on port ${PORT}`);
  console.log(`🚀 Health Check: http://localhost:${PORT}/health`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);

  // Sync seeded passwords with correct bcrypt hashes for 'admin123'
  try {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const correctHash = await bcrypt.hash('admin123', salt);
    
    await db.query(
      'UPDATE users SET password = $1 WHERE email IN ($2, $3, $4, $5)',
      [correctHash, 'admin@hospital.com', 'doctor@hospital.com', 'house@hospital.com', 'patient@hospital.com']
    );
    console.log('🛡️  HMS Seed user passwords synchronized to "admin123" successfully.');
  } catch (err) {
    console.error('⚠️  Failed to sync seed passwords:', err.message);
  }
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    db.pool.end(() => {
      console.log('Database pool drained');
      process.exit(0);
    });
  });
});
