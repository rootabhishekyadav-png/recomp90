const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config(); // fallback to cwd .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const nutritionRoutes = require('./routes/nutrition');
const measurementsRoutes = require('./routes/measurements');
const workoutRoutes = require('./routes/workouts');
const photoRoutes = require('./routes/photos');
const excelRoutes = require('./routes/excel');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitness_recomp_db';

// ============================================================================
// 🔒 STRICT SECURITY HEADERS & CORS RESTRICTIONS
// ============================================================================

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Parse allowed client URLs from environment variable
const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...clientUrls,
  'http://localhost:5000',
  'http://localhost:5173',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5173'
];

// Strict CORS Configuration - Blocks all unknown/unauthorized domains
app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (server-to-server health checks, curl, mobile apps)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');

    // Allow exact matches in allowedOrigins
    const isDirectMatch = allowedOrigins.includes(cleanOrigin);

    // If CLIENT_URL is on vercel.app, also allow associated vercel preview branches
    const isVercelPreview =
      cleanOrigin.endsWith('.vercel.app') &&
      allowedOrigins.some((url) => url.includes('.vercel.app'));

    if (isDirectMatch || isVercelPreview) {
      return callback(null, true);
    }

    console.warn(`[SECURITY WARNING] Blocked unauthorized CORS origin attempt: ${origin}`);
    return callback(new Error(`Blocked by CORS security policy. Origin not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/measurements', measurementsRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/excel', excelRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: '90-Day Body Recomposition Master System',
    time: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    security: 'strict-cors-active'
  });
});

// Serve frontend static build if available (Express 5 compatible)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// Connect Database and Start Server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
    app.listen(PORT, () => {
      console.log(`⚡ Fitness OS Server running on http://localhost:${PORT}`);
      console.log(`🔒 Active CORS Allowed Origins: ${allowedOrigins.join(', ')}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    app.listen(PORT, () => {
      console.log(`⚠️ Server running with DB warning on http://localhost:${PORT}`);
    });
  });
