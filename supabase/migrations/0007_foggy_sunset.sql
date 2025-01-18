/*
  # Allow direct buying without reservation

  1. Changes
    - Drop the unique constraint on item_id to allow multiple records per item
    - Drop the single reservation trigger as it's no longer needed
    - Update policies to allow direct buying

  2. Security
    - Update RLS policies to handle the new buying flow
    - Maintain user authentication requirements
*/

-- Drop the unique constraint on item_id
ALTER TABLE wish_list_reservations DROP CONSTRAINT IF EXISTS wish_list_reservations_item_id_key;

-- Drop the single reservation trigger as it's no longer needed
DROP TRIGGER IF EXISTS ensure_single_reservation ON wish_list_reservations;
DROP FUNCTION IF EXISTS check_user_reservation_count();

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read reservations" ON wish_list_reservations;
DROP POLICY IF EXISTS "Users can reserve unreserved items" ON wish_list_reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON wish_list_reservations;

-- Create new policies for the updated flow
CREATE POLICY "Anyone can read reservations"
  ON wish_list_reservations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can mark items as bought"
  ON wish_list_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.role() = 'authenticated'
    AND user_id = auth.uid()
    AND reserved_by = auth.email()
  );

CREATE POLICY "Users can update their own records"
  ON wish_list_reservations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());