const express = require('express');
const router = express.Router();
const { getProfile, saveProfile } = require('../controllers/profileController');

// GET /api/profile - Retrieves the current user profile
router.get('/', getProfile);

// POST /api/profile - Saves/Updates the user profile
router.post('/', saveProfile);

module.exports = router;
