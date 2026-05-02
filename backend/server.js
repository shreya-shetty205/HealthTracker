// server.js  — HealthTracker backend entry point
// ─────────────────────────────────────────────────────────────────────────────
// Required .env variables:
//   PORT            — default 5000
//   MONGO_URI       — MongoDB Atlas connection string
//   JWT_SECRET      — secret for signing tokens
//   EDAMAM_APP_ID   — Edamam Food Database API app id
//   EDAMAM_APP_KEY  — Edamam Food Database API app key
//   CLIENT_URL      — frontend origin for CORS (e.g. https://your-app.netlify.app)
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
// In production: set CLIENT_URL env var to your Netlify/Vercel URL
// In development: allows localhost:3000 and localhost:5173 (Vite)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, same-origin)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
const mealRoutes = require('./routes/meals');
const authRoutes = require('./routes/auth'); // your existing auth routes

app.use('/api', authRoutes);
app.use('/api', mealRoutes);

// Health check endpoint (useful for Render/Railway)
app.get('/api/ping', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ── MongoDB connection ────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
