/*
  # Update Notes Table Policies

  1. Changes
    - Safely drop and recreate the public read policy
    - Ensure idempotent policy creation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read all notes" ON notes;
DROP POLICY IF EXISTS "Public read access for all notes" ON notes;

-- Create new public read policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notes' 
    AND policyname = 'Public read access for all notes'
  ) THEN
    CREATE POLICY "Public read access for all notes"
      ON notes
      FOR SELECT
      USING (true);
  END IF;
END $$;