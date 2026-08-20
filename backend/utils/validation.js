const ALLOWED_SEX = new Set(['female', 'male', 'other']);
const ALLOWED_ACTIVITY = new Set(['sedentary', 'light', 'moderate', 'active']);
const ALLOWED_GOALS = new Set(['loss', 'maintain', 'gain']);
const ALLOWED_BUDGETS = new Set(['low', 'medium', 'high']);

function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validateProfile(body = {}) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const age = Number(body.age);
  const weight = Number(body.weight);
  const height = Number(body.height);

  if (!name || name.length > 80 || !Number.isInteger(age) || age < 10 || age > 100 ||
      !Number.isFinite(weight) || weight < 30 || weight > 250 ||
      !Number.isFinite(height) || height < 100 || height > 250 ||
      !ALLOWED_SEX.has(body.sex) || !ALLOWED_ACTIVITY.has(body.activityLevel) ||
      !ALLOWED_GOALS.has(body.goal) || !ALLOWED_BUDGETS.has(body.budget)) {
    return { error: 'Please provide valid profile details.' };
  }

  return { value: { name, age, weight, height, sex: body.sex, activityLevel: body.activityLevel, goal: body.goal, budget: body.budget } };
}

function validateFoodLog(body = {}) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const calories = Number(body.calories);
  if (!name || name.length > 100 || !Number.isInteger(calories) || calories < 1 || calories > 5000) {
    return { error: 'Provide a food name and whole-number calories between 1 and 5000.' };
  }
  return { value: { name, calories } };
}

module.exports = { isUuid, validateProfile, validateFoodLog };
