CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  age SMALLINT NOT NULL CHECK (age BETWEEN 10 AND 100),
  weight_kg NUMERIC(5, 1) NOT NULL CHECK (weight_kg BETWEEN 30 AND 250),
  height_cm NUMERIC(5, 1) NOT NULL CHECK (height_cm BETWEEN 100 AND 250),
  sex VARCHAR(12) NOT NULL CHECK (sex IN ('female', 'male', 'other')),
  activity_level VARCHAR(12) NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active')),
  goal VARCHAR(10) NOT NULL CHECK (goal IN ('loss', 'maintain', 'gain')),
  budget VARCHAR(10) NOT NULL CHECK (budget IN ('low', 'medium', 'high')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 100),
  calories SMALLINT NOT NULL CHECK (calories BETWEEN 1 AND 5000),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS food_logs_user_logged_at_idx
  ON food_logs (user_id, logged_at DESC);
