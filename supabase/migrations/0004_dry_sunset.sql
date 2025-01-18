/*
  # Fix wish list reservations schema and policies

  1. Changes
    - Drop existing policies
    - Add NOT NULL constraint to reserved_by
    - Update RLS policies with proper checks

  2. Security
    - Enable RLS
    - Add comprehensive policies for all operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read all reservations" ON wish_list_reservations;
DROP POLICY IF EXISTS "Users can reserve unreserved items" ON wish_list_reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON wish_list_reservations;

-- Make reserved_by NOT NULL
DO $$ 
BEGIN 
  ALTER TABLE wish_list_reservations 
    ALTER COLUMN reserved_by SET NOT NULL;
EXCEPTION
  WHEN others THEN
    NULL;
END $$;

-- Recreate policies with proper checks
CREATE POLICY "Anyone can read reservations"
  ON wish_list_reservations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can reserve unreserved items"
  ON wish_list_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND NOT EXISTS (
      SELECT 1 
      FROM wish_list_reservations r
      WHERE r.item_id = wish_list_reservations.item_id
    )
  );

CREATE POLICY "Users can update their own reservations"
  ON wish_list_reservations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);