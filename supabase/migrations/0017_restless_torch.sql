/*
  # Update notes policies for public read access

  1. Changes
    - Drop existing policies
    - Add new policy to allow anyone to read all notes
    - Recreate write policies for authenticated users

  2. Security
    - Public read access for all notes
    - Write operations still require authentication
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read their own notes" ON notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

-- Create new policies with updated names and permissions
CREATE POLICY "Public read access"
  ON notes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create notes"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Note owners can update"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Note owners can delete"
  ON notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);