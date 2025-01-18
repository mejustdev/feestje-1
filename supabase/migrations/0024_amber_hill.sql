/*
  # Update notes table constraints and policies

  1. Changes
    - Add trigger to enforce 2 notes per user limit
    - Update insert policy to check note limit
    - Add proper error message for limit exceeded

  2. Security
    - Maintains existing RLS policies
    - Adds additional validation layer
*/

-- Drop existing note limit trigger and function if they exist
DROP TRIGGER IF EXISTS enforce_note_limit ON notes;
DROP FUNCTION IF EXISTS check_user_note_count();

-- Create improved note limit check function
CREATE OR REPLACE FUNCTION check_user_note_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM notes
    WHERE user_id = NEW.user_id
  ) >= 2 THEN
    RAISE EXCEPTION 'You can only create up to 2 notes' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce note limit
CREATE TRIGGER enforce_note_limit
  BEFORE INSERT ON notes
  FOR EACH ROW
  EXECUTE FUNCTION check_user_note_count();

-- Update the insert policy to include the limit check in the policy itself
DROP POLICY IF EXISTS "Users can create their own notes" ON notes;
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