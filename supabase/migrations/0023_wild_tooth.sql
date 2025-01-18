/*
  # Clean up notes data and update policies
  
  1. Changes
    - Delete all existing notes data
    - Update policies to ensure proper access control
    - Add index for better query performance
  
  2. Security
    - Maintain RLS policies for proper access control
    - Ensure public read access
    - Restrict write operations to authenticated users
*/

-- Delete all records from notes table
DELETE FROM notes;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS notes_user_id_position_idx ON notes(user_id, position);

-- Refresh policies
DROP POLICY IF EXISTS "Public read access for all notes" ON notes;
CREATE POLICY "Public read access for all notes"
  ON notes
  FOR SELECT
  USING (true);

-- Add position bounds check
ALTER TABLE notes DROP CONSTRAINT IF EXISTS check_position_bounds;
ALTER TABLE notes ADD CONSTRAINT check_position_bounds 
  CHECK (position >= 0 AND position <= 1000000);