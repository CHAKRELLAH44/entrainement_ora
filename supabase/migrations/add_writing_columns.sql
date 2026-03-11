-- Migration: Add writing columns to sessions table
-- Date: 2026-03-11
-- Description: Adds 'text' and 'correction' columns for writing feature

-- Add 'text' column if it doesn't exist
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS text TEXT;

-- Add 'correction' column if it doesn't exist
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS correction TEXT;

-- Verify columns were created
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sessions'
ORDER BY ordinal_position;