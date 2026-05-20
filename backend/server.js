/**
 * Vitality Health Dashboard Backend
 * Core Server File
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express App
const app = express();

// Define Port
const PORT = process.env.PORT || 5001;

/* ==========================================
   MIDDLEWARE CONFIGURATION
   ========================================== */

// 1. Enable CORS (Cross-Origin Resource Sharing)
// This is critical to allow your frontend (running on another port/file protocol) 
// to make fetch requests to this backend.
app.use(cors());

// 2. Body Parser Middleware
// Allows the server to read JSON payload data sent in the request bodies (e.g., req.body)
app.use(express.json());

// 3. Form URL-encoded data middleware (optional but useful)
app.use(express.urlencoded({ extended: false }));

/* ==========================================
   API ROUTE MOUNTING
   ========================================== */

// Import Route modules
const profileRoutes = require('./routes/profileRoutes');
const foodLogRoutes = require('./routes/foodLogRoutes');

// Mount routes onto base path endpoints
app.use('/api/profile', profileRoutes);
app.use('/api/food-log', foodLogRoutes);

// Welcome Root Route (Good for testing if server is running)
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Welcome to the Vitality Health Dashboard API!",
    endpoints: {
      profile: {
        get: "GET /api/profile",
        save: "POST /api/profile"
      },
      foodLog: {
        get: "GET /api/food-log",
        add: "POST /api/food-log",
        deleteItem: "DELETE /api/food-log/:id",
        clearAll: "DELETE /api/food-log"
      }
    }
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server!",
    error: err.message
  });
});

/* ==========================================
   SERVER INITIALIZATION
   ========================================== */
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  Vitality Health Backend is running on port ${PORT}`);
  console.log(`  API Root: http://localhost:${PORT}/`);
  console.log(`===================================================`);
});

