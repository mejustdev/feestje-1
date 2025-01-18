/*
  # Update wish list reservation policies for bought items

  1. Changes
    - Add policy to prevent reserving bought items
    - Update existing policies to handle bought status

  2. Security
    - Ensure users can only mark their own reservations as bought
    - Prevent reserving items that are already bought
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can mark items as bought" ON wish_list_reservations;

-- Create new insert policy that prevents reserving bought items
CREATE POLICY "Users can mark items as bought"
  ON wish_list_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.role() = 'authenticated'
    AND user_id = auth.uid()
    AND reserved_by = auth.email()
    -- Prevent reserving if item is already bought
    AND NOT EXISTS (
      SELECT 1 
      FROM wish_list_reservations r
      WHERE r.item_id = wish_list_reservations.item_id
      AND r.bought = true
    )
  );