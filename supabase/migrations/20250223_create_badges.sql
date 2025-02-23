-- Create badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  criteria_type VARCHAR(50) NOT NULL,
  criteria_value INTEGER NOT NULL,
  icon_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_badges table for tracking earned badges
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  badge_id UUID NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Insert default badges
INSERT INTO badges (name, description, criteria_type, criteria_value, icon_name) VALUES
('Streak Master', 'Practice for 7 days in a row', 'streak', 7, 'medal'),
('Clarity Champion', 'Achieve 90% clarity score in any tongue twister', 'clarity', 90, 'star'),
('Practice Pro', 'Complete 50 practice sessions', 'sessions', 50, 'award'),
('Speed Demon', 'Complete a tongue twister in under 5 seconds with 80% accuracy', 'speed', 5, 'zap'),
('Perfect Score', 'Get 100% accuracy on any tongue twister', 'accuracy', 100, 'target'),
('Dedication', 'Practice for a total of 60 minutes', 'time', 60, 'clock');

-- Add RLS policies
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by all users"
  ON badges FOR SELECT
  USING (true);

CREATE POLICY "User badges are viewable by owner"
  ON user_badges FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "User badges can be inserted by owner"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
