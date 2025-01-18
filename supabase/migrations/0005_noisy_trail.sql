/*
  # Fix RLS policies for wish list reservations

  1. Changes
    - Drop existing policies
    - Add new policies that properly handle authentication
    - Ensure policies work in both development and production

  2. Security
    - Enable RLS
    - Add policies for:
      - Reading reservations
      - Creating reservations
      - Updating reservations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read reservations" ON wish_list_reservations;
DROP POLICY IF EXISTS "Users can reserve unreserved items" ON wish_list_reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON wish_list_reservations;

-- Read policy: Allow all authenticated users to read all reservations
CREATE POLICY "Anyone can read reservations"
  ON wish_list_reservations
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert policy: Allow authenticated users to reserve unreserved items
CREATE POLICY "Users can reserve unreserved items"
  ON wish_list_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Ensure user is authenticated
    auth.role() = 'authenticated'
    -- Ensure item isn't already reserved
    AND NOT EXISTS (
      SELECT 1 
      FROM wish_list_reservations r
      WHERE r.item_id = wish_list_reservations.item_id
    )
    -- Ensure user_id matches the authenticated user
    AND user_id = auth.uid()
    -- Ensure reserved_by matches the user's email
    AND reserved_by = auth.email()
  );

-- Update policy: Allow users to update their own reservations
CREATE POLICY "Users can update their own reservations"
  ON wish_list_reservations
  FOR UPDATE
  TO authenticated
  USING (
    auth.role() = 'authenticated'
    AND user_id = auth.uid()
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND user_id = auth.uid()
  );