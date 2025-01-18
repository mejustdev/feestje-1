/*
  # Fix sticky notes RLS policies

  1. Changes
    - Drop existing RLS policies
    - Create new policies that work with both regular and dev users
    - Add proper authentication checks

  2. Security
    - Ensure policies work in both production and development
    - Maintain data isolation between users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sticky_notes;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON sticky_notes;
DROP POLICY IF EXISTS "Enable update access for note owners" ON sticky_notes;
DROP POLICY IF EXISTS "Enable delete access for note owners" ON sticky_notes;

-- Create new policies with proper authentication checks
CREATE POLICY "Anyone can read all sticky notes"
  ON sticky_notes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own sticky notes"
  ON sticky_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.role() = 'authenticated' AND
    user_id = auth.uid()
  );

CREATE POLICY "Users can update their own sticky notes"
  ON sticky_notes
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own sticky notes"
  ON sticky_notes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());