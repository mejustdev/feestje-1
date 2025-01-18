/*
  # Add note content length check and user note limit

  1. Changes
    - Add check constraint for note content length
    - Add trigger to enforce max 2 notes per user

  2. Security
    - Ensures note content cannot exceed 150 characters
    - Prevents users from creating more than 2 notes
*/

-- Add check constraint for content length
ALTER TABLE notes ADD CONSTRAINT check_content_length 
  CHECK (length(content) <= 150);

-- Create function to check note count
CREATE OR REPLACE FUNCTION check_user_note_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM notes
    WHERE user_id = NEW.user_id
  ) >= 2 THEN
    RAISE EXCEPTION 'Users can only create up to 2 notes';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce note limit
CREATE TRIGGER enforce_note_limit
  BEFORE INSERT ON notes
  FOR EACH ROW
  EXECUTE FUNCTION check_user_note_count();