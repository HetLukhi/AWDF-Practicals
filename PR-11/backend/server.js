const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Step 2 of Practical 10: Initialize event listeners module
require('./listeners');

const logger = require('./middleware/logger');
const responseTiming = require('./middleware/responseTiming');
const requireJsonContentType = require('./middleware/requireJsonContentType');
const errorHandler = require('./middleware/errorHandler');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const cache = require('./utils/cache');
const taskEvents = require('./events');

const app = express();

// Middleware pipeline
app.use(cors());
app.use(express.json());
app.use(responseTiming);
app.use(logger);
app.use(requireJsonContentType);

// Public Health & Container Metadata endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Practical 11: Containerization with Docker and Docker Compose',
    containerStatus: 'RUNNING',
    hostname: require('os').hostname(),
    platform: process.platform,
    service: 'backend (Node/Express)',
    port: PORT,
    database: {
      connected: mongoose.connection.readyState === 1,
      uri: MONGO_URI
    },
    caching: {
      enabled: process.env.ENABLE_CACHE !== 'false',
      ttl: `${process.env.CACHE_TTL || 60} seconds`
    },
    dockerComposeStack: {
      frontend: 'http://localhost:5173 (React/Vite)',
      backend: 'http://localhost:5000 (Express API)',
      mongodb: 'mongodb://mongodb:27017 (Container internal)'
    }
  });
});

// Public Cache Health & Metrics preview endpoint
app.get('/cache/stats', (req, res) => {
  res.status(200).json({
    success: true,
    data: cache.getMetrics()
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Task routes (protected by auth middleware)
app.use('/tasks', taskRoutes);
app.use('/api/tasks', taskRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.originalUrl}`
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tasksDB_prac10';

// Connect to MongoDB and start HTTP server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully to', MONGO_URI);
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` Prac 10 Server running on http://localhost:${PORT}`);
      console.log(` Architecture : Asynchronous Event-Driven Architecture`);
      console.log(` Native Engine: Node.js EventEmitter (events.js)`);
      console.log(` Async Delay  : ${process.env.NOTIFICATION_DELAY_MS || 2000}ms simulated background work`);
      console.log(` Caching      : In-memory node-cache (TTL: ${process.env.CACHE_TTL || 60}s)`);
      console.log(`====================================================`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
