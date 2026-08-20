const express = require('express');
const router = express.Router();
const { isUuid } = require('../utils/validation');
const { 
  getFoodLogs, 
  getWeeklyFoodHistory,
  addFoodLog, 
  deleteFoodLogItem, 
  clearAllFoodLogs 
} = require('../controllers/foodLogController');

// GET /api/food-log - Retrieve all food items and total calorie summary
router.get('/', getFoodLogs);

// GET /api/food-log/history - Daily totals for the most recent seven days
router.get('/history', getWeeklyFoodHistory);

// POST /api/food-log - Add a new food item to the log
router.post('/', addFoodLog);

// DELETE /api/food-log - Clear all food logs for today
router.delete('/', clearAllFoodLogs);

// DELETE /api/food-log/:id - Remove a specific food log item by its unique ID
router.delete('/:id', (req, res, next) => {
  if (!isUuid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid food item id.' });
  next();
}, deleteFoodLogItem);

module.exports = router;
