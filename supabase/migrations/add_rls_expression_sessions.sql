-- Migration: Add RLS policies for expression_sessions table
-- Date: 2026-03-18
-- Description: Add Row Level Security policies to expression_sessions table

-- Enable RLS on expression_sessions table
ALTER TABLE expression_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow INSERT without authentication check (app manages access control)
CREATE POLICY insert_expression_sessions ON expression_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow SELECT without authentication check (app manages access control)
CREATE POLICY select_expression_sessions ON expression_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Allow UPDATE without authentication check (app manages access control)
CREATE POLICY update_expression_sessions ON expression_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow DELETE without authentication check (app manages access control)
CREATE POLICY delete_expression_sessions ON expression_sessions
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'expression_sessions';
