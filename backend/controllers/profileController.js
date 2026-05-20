/**
 * Profile Controller
 * Handles user profile retrieval and updates in-memory.
 */

// Temporary in-memory data store for the user profile
// Initialized with null or a default object.
let userProfile = null;

/**
 * @desc    Get user profile details
 * @route   GET /api/profile
 * @access  Public
 */
const getProfile = (req, res) => {
  try {
    // If no profile exists, return a 404 or a clear message
    if (!userProfile) {
      return res.status(200).json({ 
        success: true, 
        message: "No profile found. Please set up your profile.",
        data: null 
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: userProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error retrieving profile",
      error: error.message
    });
  }
};

/**
 * @desc    Save/Update user profile details
 * @route   POST /api/profile
 * @access  Public
 */
const saveProfile = (req, res) => {
  try {
    const { name, age, weight, height, goal, budget } = req.body;

    // Simple validation
    if (!name || !age || !weight || !height || !goal || !budget) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, age, weight, height, goal, budget"
      });
    }

    // Save profile to our in-memory variable
    userProfile = {
      name,
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      goal,
      budget,
      updatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      message: "Profile saved successfully!",
      data: userProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error saving profile",
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  saveProfile
};
