-- Migration: Create expression_sessions table
-- Date: 2026-03-17
-- Description: Creates table for expression sessions (videos/images comments)

-- Create expression_sessions table
CREATE TABLE IF NOT EXISTS expression_sessions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  media_id TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'image')),
  media_url TEXT NOT NULL,
  audio_url TEXT,
  text TEXT,
  correction TEXT,
  timestamp BIGINT NOT NULL,
  user_nickname TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT user_exists FOREIGN KEY (user_nickname) REFERENCES sessions(user_nickname) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_expression_sessions_user ON expression_sessions(user_nickname);
CREATE INDEX IF NOT EXISTS idx_expression_sessions_timestamp ON expression_sessions(timestamp);

-- Verify table was created
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'expression_sessions'
ORDER BY ordinal_position;
