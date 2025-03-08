-- Add best_clarity_score column to user_progress table
ALTER TABLE user_progress ADD COLUMN best_clarity_score INTEGER DEFAULT 0;

-- Update existing records to set best_clarity_score based on the highest clarity_score in practice_sessions
UPDATE user_progress up
SET best_clarity_score = (
  SELECT COALESCE(MAX(ps.clarity_score), up.clarity_score)
  FROM practice_sessions ps
  WHERE ps.user_id = up.user_id
);