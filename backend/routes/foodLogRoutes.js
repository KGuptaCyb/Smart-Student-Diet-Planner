const express = require('express');
const router = express.Router();
const { 
  getFoodLogs, 
  addFoodLog, 
  deleteFoodLogItem, 
  clearAllFoodLogs 
} = require('../controllers/foodLogController');

// GET /api/food-log - Retrieve all food items and total calorie summary
router.get('/', getFoodLogs);

// POST /api/food-log - Add a new food item to the log
router.post('/', addFoodLog);

// DELETE /api/food-log - Clear all food logs for today
router.delete('/', clearAllFoodLogs);

// DELETE /api/food-log/:id - Remove a specific food log item by its unique ID
router.delete('/:id', deleteFoodLogItem);

module.exports = router;
