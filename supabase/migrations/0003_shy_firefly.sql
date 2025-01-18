/*
  # Update wish list schema

  1. Changes
    - Add reserved_by column to wish_list_reservations
    - Update RLS policies to handle reservations properly

  2. Security
    - Maintain existing RLS policies
    - Add policy for updating reservations
*/

-- Add reserved_by column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wish_list_reservations' 
    AND column_name = 'reserved_by'
  ) THEN
    ALTER TABLE wish_list_reservations ADD COLUMN reserved_by text;
  END IF;
END $$;

-- Update policies to handle reserved_by
CREATE POLICY "Users can update their own reservations"
  ON wish_list_reservations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);