-- Drop existing foreign key constraints
ALTER TABLE practice_sessions DROP CONSTRAINT practice_sessions_user_id_fkey;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_user_progress_user_id;
DROP INDEX IF EXISTS idx_practice_sessions_user_id;

-- Modify user_id column type in user_progress table
ALTER TABLE user_progress 
  ALTER COLUMN user_id TYPE TEXT,
  ALTER COLUMN user_id SET NOT NULL;

-- Modify user_id column type in practice_sessions table
ALTER TABLE practice_sessions 
  ALTER COLUMN user_id TYPE TEXT,
  ALTER COLUMN user_id SET NOT NULL;

-- Recreate foreign key constraint
ALTER TABLE practice_sessions 
  ADD CONSTRAINT practice_sessions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_progress(user_id);

-- Recreate indexes
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
