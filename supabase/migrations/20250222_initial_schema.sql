-- Create enum for difficulty levels
CREATE TYPE difficulty_level AS ENUM ('Easy', 'Intermediate', 'Advanced');

-- Create tongue_twisters table
CREATE TABLE tongue_twisters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    difficulty difficulty_level NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_progress table
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    practice_frequency JSONB NOT NULL DEFAULT '{"daily": 0, "weekly": 0, "monthly": 0}'::JSONB,
    clarity_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_practice_time INTEGER NOT NULL DEFAULT 0, -- stored in seconds
    badges JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE (user_id)
);

-- Create practice_sessions table for detailed tracking
CREATE TABLE practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    tongue_twister_id UUID NOT NULL REFERENCES tongue_twisters(id),
    clarity_score DECIMAL(5,2) NOT NULL,
    duration INTEGER NOT NULL, -- stored in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    FOREIGN KEY (user_id) REFERENCES user_progress(user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_tongue_twisters_difficulty ON tongue_twisters(difficulty);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_created_at ON practice_sessions(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at
CREATE TRIGGER update_tongue_twisters_updated_at
    BEFORE UPDATE ON tongue_twisters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
