/**
 * Food Log & Calorie Controller
 * Handles food tracking operations and calorie calculations in-memory.
 */

// Temporary in-memory array to store food log items
let foodLogs = [];

/**
 * @desc    Get all food logs and total calories
 * @route   GET /api/food-log
 * @access  Public
 */
const getFoodLogs = (req, res) => {
  try {
    // Calculate total calories consumed from the food logs array
    const totalCalories = foodLogs.reduce((sum, item) => sum + item.calories, 0);

    res.status(200).json({
      success: true,
      count: foodLogs.length,
      totalCalories: totalCalories,
      data: foodLogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error fetching food logs",
      error: error.message
    });
  }
};

/**
 * @desc    Add a new food item to the log
 * @route   POST /api/food-log
 * @access  Public
 */
const addFoodLog = (req, res) => {
  try {
    const { name, calories } = req.body;

    // Simple validation
    if (!name || calories === undefined || calories === null) {
      return res.status(400).json({
        success: false,
        message: "Please provide food name and calories."
      });
    }

    const parsedCalories = parseInt(calories);
    if (isNaN(parsedCalories) || parsedCalories < 0) {
      return res.status(400).json({
        success: false,
        message: "Calories must be a valid non-negative number."
      });
    }

    // Create a new log item with a unique ID and timestamp
    const newLogItem = {
      id: Date.now(), // Unique ID using timestamp
      name: name.trim(),
      calories: parsedCalories,
      loggedAt: new Date()
    };

    // Add to in-memory array
    foodLogs.push(newLogItem);

    // Calculate new total calories
    const totalCalories = foodLogs.reduce((sum, item) => sum + item.calories, 0);

    res.status(201).json({
      success: true,
      message: "Food item logged successfully!",
      data: newLogItem,
      totalCalories: totalCalories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error adding food log",
      error: error.message
    });
  }
};

/**
 * @desc    Delete a single food item from the log
 * @route   DELETE /api/food-log/:id
 * @access  Public
 */
const deleteFoodLogItem = (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);

    // Find if the item exists
    const itemIndex = foodLogs.findIndex(item => item.id === parsedId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Food item not found."
      });
    }

    // Remove the item from array
    const deletedItem = foodLogs.splice(itemIndex, 1)[0];

    // Calculate new total calories
    const totalCalories = foodLogs.reduce((sum, item) => sum + item.calories, 0);

    res.status(200).json({
      success: true,
      message: `Removed '${deletedItem.name}' from logs.`,
      deletedItem: deletedItem,
      totalCalories: totalCalories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error deleting food log item",
      error: error.message
    });
  }
};

/**
 * @desc    Clear all food log items for the day
 * @route   DELETE /api/food-log
 * @access  Public
 */
const clearAllFoodLogs = (req, res) => {
  try {
    foodLogs = []; // Empty the array

    res.status(200).json({
      success: true,
      message: "All food logs have been cleared successfully.",
      totalCalories: 0,
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error clearing food logs",
      error: error.message
    });
  }
};

module.exports = {
  getFoodLogs,
  addFoodLog,
  deleteFoodLogItem,
  clearAllFoodLogs
};
