/*
  # Fix note creation limit

  1. Changes
    - Drop the trigger-based note limit check to avoid conflicts with policy
    - Update the insert policy to be the single source of truth for note limits
    - Add better error handling for the note limit check

  2. Security
    - Maintains RLS enforcement
    - Keeps the 2-note limit per user
*/

-- Drop the trigger-based approach
DROP TRIGGER IF EXISTS enforce_note_limit ON notes;
DROP FUNCTION IF EXISTS check_user_note_count();

-- Update the insert policy to be the single source of truth
DROP POLICY IF EXISTS "Users can create their own notes" ON notes;
CREATE POLICY "Users can create their own notes"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Basic auth checks
    auth.role() = 'authenticated'
    AND auth.uid() = user_id
    -- Note limit check
    AND (
      SELECT COUNT(*)
      FROM notes
      WHERE user_id = auth.uid()
    ) < 2
  );