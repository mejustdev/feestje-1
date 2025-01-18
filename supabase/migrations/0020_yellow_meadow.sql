/*
  # Fix notes table and policies

  1. Changes
    - Add indexes for better performance
    - Update policies to ensure proper access control
    - Add position constraint to prevent negative values

  2. Security
    - Maintain RLS
    - Update policies for better security
*/

-- Add indexes for user_id and position for better performance
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_position_idx ON notes(position);

-- Add constraint for position to prevent negative values
ALTER TABLE notes ADD CONSTRAINT check_position_non_negative 
  CHECK (position >= 0);

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON notes;
DROP POLICY IF EXISTS "Authenticated users can create notes" ON notes;
DROP POLICY IF EXISTS "Note owners can update" ON notes;
DROP POLICY IF EXISTS "Note owners can delete" ON notes;

-- Create new policies with proper security
CREATE POLICY "Anyone can read all notes"
  ON notes
  FOR SELECT
  TO authenticated
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
  WITH CHECK (
    auth.uid() = user_id
    AND length(content) <= 150
  );

CREATE POLICY "Users can delete their own notes"
  ON notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);