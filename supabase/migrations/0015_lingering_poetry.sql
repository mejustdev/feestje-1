/*
  # Fix Sticky Notes RLS Policies

  1. Changes
    - Drop existing policies
    - Create new policies with proper authentication checks
    - Ensure users can only manage their own notes
    - Allow reading all notes for authenticated users

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Ensure proper user_id checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read all sticky notes" ON sticky_notes;
DROP POLICY IF EXISTS "Users can create their own sticky notes" ON sticky_notes;
DROP POLICY IF EXISTS "Users can update their own sticky notes" ON sticky_notes;
DROP POLICY IF EXISTS "Users can delete their own sticky notes" ON sticky_notes;

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
    auth.uid() = user_id
  );

CREATE POLICY "Users can update their own sticky notes"
  ON sticky_notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sticky notes"
  ON sticky_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);