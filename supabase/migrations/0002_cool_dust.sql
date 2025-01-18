/*
  # Add bought status to wish list reservations

  1. Changes
    - Add `bought` boolean column to `wish_list_reservations`
    - Add `bought_at` timestamp column
    - Add policy for users to mark items as bought

  2. Security
    - Only the user who reserved an item can mark it as bought
*/

-- Add bought status columns
ALTER TABLE wish_list_reservations 
ADD COLUMN bought boolean DEFAULT false,
ADD COLUMN bought_at timestamptz;

-- Allow users to update their own reservations to mark as bought
CREATE POLICY "Users can mark their reservations as bought"
  ON wish_list_reservations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);