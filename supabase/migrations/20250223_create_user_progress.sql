-- Alter user_progress table to add new columns and update types
ALTER TABLE user_progress
  ADD COLUMN practice_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN total_sessions INTEGER NOT NULL DEFAULT 0,
  ALTER COLUMN user_id TYPE TEXT,
  ALTER COLUMN clarity_score TYPE INTEGER USING (clarity_score::INTEGER);

-- Add RLS policies for user_progress if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_progress' AND policyname = 'Users can view their own progress'
  ) THEN
    CREATE POLICY "Users can view their own progress"
      ON user_progress
      FOR SELECT
      USING (auth.uid()::text = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_progress' AND policyname = 'Users can update their own progress'
  ) THEN
    CREATE POLICY "Users can update their own progress"
      ON user_progress
      FOR UPDATE
      USING (auth.uid()::text = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_progress' AND policyname = 'Users can insert their own progress'
  ) THEN
    CREATE POLICY "Users can insert their own progress"
      ON user_progress
      FOR INSERT
      WITH CHECK (auth.uid()::text = user_id);
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
