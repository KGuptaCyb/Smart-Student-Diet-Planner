const db = require('../db');
const { validateProfile } = require('../utils/validation');

const getProfile = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT user_id, name, age, weight_kg AS weight, height_cm AS height,
              sex, activity_level AS "activityLevel", goal, budget
       FROM profiles WHERE user_id = $1`,
      [req.userId]
    );
    res.json({ success: true, data: rows[0] || null });
  } catch (error) {
    next(error);
  }
};

const saveProfile = async (req, res, next) => {
  const result = validateProfile(req.body);
  if (result.error) return res.status(400).json({ success: false, message: result.error });

  const { name, age, weight, height, sex, activityLevel, goal, budget } = result.value;
  try {
    const { rows } = await db.query(
      `INSERT INTO profiles (user_id, name, age, weight_kg, height_cm, sex, activity_level, goal, budget)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id) DO UPDATE SET
         name = EXCLUDED.name, age = EXCLUDED.age, weight_kg = EXCLUDED.weight_kg,
         height_cm = EXCLUDED.height_cm, sex = EXCLUDED.sex, activity_level = EXCLUDED.activity_level,
         goal = EXCLUDED.goal, budget = EXCLUDED.budget, updated_at = NOW()
       RETURNING user_id, name, age, weight_kg AS weight, height_cm AS height,
                 sex, activity_level AS "activityLevel", goal, budget`,
      [req.userId, name, age, weight, height, sex, activityLevel, goal, budget]
    );
    res.status(200).json({ success: true, data: rows[0], message: 'Profile saved successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, saveProfile };
