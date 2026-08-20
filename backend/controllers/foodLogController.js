const { randomUUID } = require('crypto');
const db = require('../db');
const { validateFoodLog } = require('../utils/validation');

const todayClause = "logged_at >= date_trunc('day', NOW()) AND logged_at < date_trunc('day', NOW()) + INTERVAL '1 day'";

const getFoodLogs = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, name, calories, logged_at AS "loggedAt" FROM food_logs
       WHERE user_id = $1 AND ${todayClause} ORDER BY logged_at DESC`,
      [req.userId]
    );
    const totalCalories = rows.reduce((sum, item) => sum + item.calories, 0);
    res.json({ success: true, count: rows.length, totalCalories, data: rows });
  } catch (error) {
    next(error);
  }
};

const getWeeklyFoodHistory = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT TO_CHAR(days.day, 'YYYY-MM-DD') AS date,
              COALESCE(SUM(food_logs.calories), 0)::INTEGER AS calories
       FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS days(day)
       LEFT JOIN food_logs ON food_logs.user_id = $1
         AND food_logs.logged_at >= days.day
         AND food_logs.logged_at < days.day + INTERVAL '1 day'
       GROUP BY days.day
       ORDER BY days.day`,
      [req.userId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

const addFoodLog = async (req, res, next) => {
  const result = validateFoodLog(req.body);
  if (result.error) return res.status(400).json({ success: false, message: result.error });

  try {
    const { rows } = await db.query(
      `INSERT INTO food_logs (id, user_id, name, calories) VALUES ($1, $2, $3, $4)
       RETURNING id, name, calories, logged_at AS "loggedAt"`,
      [randomUUID(), req.userId, result.value.name, result.value.calories]
    );
    res.status(201).json({ success: true, data: rows[0], message: 'Food item logged successfully.' });
  } catch (error) {
    next(error);
  }
};

const deleteFoodLogItem = async (req, res, next) => {
  try {
    const { rowCount } = await db.query(
      `DELETE FROM food_logs WHERE id = $1 AND user_id = $2 AND ${todayClause}`,
      [req.params.id, req.userId]
    );
    if (!rowCount) return res.status(404).json({ success: false, message: 'Food item not found.' });
    res.json({ success: true, message: 'Food item deleted.' });
  } catch (error) {
    next(error);
  }
};

const clearAllFoodLogs = async (req, res, next) => {
  try {
    await db.query(`DELETE FROM food_logs WHERE user_id = $1 AND ${todayClause}`, [req.userId]);
    res.json({ success: true, message: "Today's food log cleared." });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFoodLogs, getWeeklyFoodHistory, addFoodLog, deleteFoodLogItem, clearAllFoodLogs };
