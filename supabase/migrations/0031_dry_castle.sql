/*
  # Update wish list constraints and policies

  1. Changes
    - Add partial unique index for bought items
    - Add check constraint for bought_at timestamp
    - Update RLS policies for better control

  2. Security
    - Ensure only one person can mark an item as bought
    - Allow reading all reservations
    - Restrict updates to own reservations
*/

-- Drop existing constraints if they exist
DROP INDEX IF EXISTS unique_bought_item_idx;

-- Create partial unique index for bought items
CREATE UNIQUE INDEX unique_bought_item_idx 
  ON wish_list_reservations(item_id) 
  WHERE bought = true;

-- Add check constraint for bought_at
ALTER TABLE wish_list_reservations
  ADD CONSTRAINT check_bought_at
  CHECK (
    (bought = true AND bought_at IS NOT NULL) OR
    (bought = false AND bought_at IS NULL)
  );

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read reservations" ON wish_list_reservations;
DROP POLICY IF EXISTS "Users can mark items as bought" ON wish_list_reservations;
DROP POLICY IF EXISTS "Users can update their own records" ON wish_list_reservations;
DROP POLICY IF EXISTS "Users can delete their own records" ON wish_list_reservations;

-- Create new policies
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
    -- Basic auth checks
    auth.role() = 'authenticated'
    AND user_id = auth.uid()
    AND reserved_by = auth.email()
    -- Ensure item isn't already bought
    AND NOT EXISTS (
      SELECT 1 
      FROM wish_list_reservations r
      WHERE r.item_id = wish_list_reservations.item_id
      AND r.bought = true
    )
  );

CREATE POLICY "Users can delete their own reservations"
  ON wish_list_reservations
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
  );