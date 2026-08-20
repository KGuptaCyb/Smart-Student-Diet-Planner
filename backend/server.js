require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const profileRoutes = require('./routes/profileRoutes');
const foodLogRoutes = require('./routes/foodLogRoutes');
const { isUuid } = require('./utils/validation');

const app = express();
const PORT = Number(process.env.PORT) || 5001;
const allowedOrigins = new Set((process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean));

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('This origin is not allowed by CORS.'));
  },
  methods: ['GET', 'POST', 'DELETE']
}));
app.use(express.json({ limit: '10kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 150, standardHeaders: 'draft-7', legacyHeaders: false }));

app.use('/api', (req, res, next) => {
  const userId = req.get('x-user-id');
  if (!isUuid(userId)) return res.status(400).json({ success: false, message: 'A valid x-user-id header is required.' });
  req.userId = userId;
  next();
});

app.get('/health', async (req, res, next) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ success: true, status: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.get('/', (req, res) => res.json({
  name: 'Smart Student Diet Planner API',
  version: '1.0.0',
  health: '/health'
}));

app.use('/api/profile', profileRoutes);
app.use('/api/food-log', foodLogRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => console.log(`API listening on port ${PORT}`));
}

module.exports = app;
