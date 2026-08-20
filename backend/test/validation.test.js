const test = require('node:test');
const assert = require('node:assert/strict');
const { isUuid, validateProfile, validateFoodLog } = require('../utils/validation');

const validProfile = {
  name: 'Jane Student', age: 20, weight: 60, height: 165,
  sex: 'female', activityLevel: 'moderate', goal: 'maintain', budget: 'low'
};

test('accepts a complete valid profile', () => {
  const result = validateProfile(validProfile);
  assert.equal(result.error, undefined);
  assert.equal(result.value.name, 'Jane Student');
});

test('rejects invalid profile values', () => {
  assert.ok(validateProfile({ ...validProfile, age: 9 }).error);
  assert.ok(validateProfile({ ...validProfile, goal: 'fast' }).error);
});

test('validates food logs', () => {
  assert.deepEqual(validateFoodLog({ name: '  Apple ', calories: 95 }).value, { name: 'Apple', calories: 95 });
  assert.ok(validateFoodLog({ name: '', calories: 95 }).error);
  assert.ok(validateFoodLog({ name: 'Apple', calories: 95.5 }).error);
});

test('recognizes UUID v4 values', () => {
  assert.equal(isUuid('550e8400-e29b-41d4-a716-446655440000'), true);
  assert.equal(isUuid('not-a-uuid'), false);
});
