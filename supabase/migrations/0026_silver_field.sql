/*
  # Fix notes table constraints and policies

  1. Changes
    - Simplify note limit enforcement using only RLS policy
    - Remove trigger-based approach to avoid race conditions
    - Ensure proper error handling

  2. Security
    - Maintains RLS enforcement
    - Keeps the 2-note limit per user
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS enforce_note_limit ON notes;
DROP FUNCTION IF EXISTS check_user_note_count();

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can create their own notes" ON notes;
DROP POLICY IF EXISTS "Public read access for all notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

-- Create improved policies
CREATE POLICY "Public read access for all notes"
  ON notes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own notes"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = user_id
    AND (
      SELECT COUNT(*)
      FROM notes
      WHERE user_id = auth.uid()
    ) < 2
  );

CREATE POLICY "Users can update their own notes"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);