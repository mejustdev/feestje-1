/*
  # Fix sticky notes RLS policies

  1. Changes
    - Drop and recreate RLS policies with proper authentication checks
    - Ensure user_id matches the authenticated user
    - Add better policy names for clarity

  2. Security
    - Enforce strict user authentication checks
    - Ensure users can only manage their own notes
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own notes" ON sticky_notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON sticky_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON sticky_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON sticky_notes;

-- Create new policies with proper authentication checks
CREATE POLICY "Enable read access for authenticated users"
  ON sticky_notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for authenticated users"
  ON sticky_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.uid() = user_id
  );

CREATE POLICY "Enable update access for note owners"
  ON sticky_notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for note owners"
  ON sticky_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);