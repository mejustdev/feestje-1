/*
  # Fix Wishlist Functionality

  1. Changes
    - Drop existing wishlist table and recreate with proper structure
    - Add proper RLS policies
    - Create functions for marking items as bought
    - Insert initial wishlist items

  2. Security
    - Enable RLS
    - Add policies for read/update access
    - Functions use SECURITY DEFINER for proper access control
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS wishlist CASCADE;

-- Create wishlist table
CREATE TABLE wishlist (
  id SERIAL PRIMARY KEY,
  item TEXT NOT NULL,
  description TEXT NOT NULL,
  link TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  reserved_by TEXT,
  reserved_at TIMESTAMPTZ,
  bought_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (status IN ('available', 'reserved', 'bought'))
);

-- Enable RLS
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read wishlist"
  ON wishlist
  FOR SELECT
  USING (true);

CREATE POLICY "Users can mark items as bought"
  ON wishlist
  FOR UPDATE
  TO authenticated
  USING (
    status = 'available' 
    OR (status = 'reserved' AND user_id = auth.uid())
  )
  WITH CHECK (
    (
      -- Marking as reserved
      status = 'reserved' 
      AND user_id = auth.uid()
      AND reserved_by = auth.email()
      AND reserved_at IS NOT NULL
    ) OR (
      -- Marking as bought
      status = 'bought'
      AND user_id = auth.uid()
      AND bought_at IS NOT NULL
    )
  );

-- Function to mark item as bought
CREATE OR REPLACE FUNCTION mark_item_as_bought(
  p_item_id INTEGER,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item_exists BOOLEAN;
BEGIN
  -- Check if item exists and is available
  SELECT EXISTS (
    SELECT 1 
    FROM wishlist 
    WHERE id = p_item_id 
    AND status = 'available'
  ) INTO v_item_exists;

  IF NOT v_item_exists THEN
    RETURN false;
  END IF;

  -- Mark item as bought
  UPDATE wishlist
  SET 
    status = 'bought',
    user_id = p_user_id,
    reserved_by = (SELECT email FROM auth.users WHERE id = p_user_id),
    bought_at = now()
  WHERE 
    id = p_item_id 
    AND status = 'available';

  RETURN true;
END;
$$;

-- Insert initial items
INSERT INTO wishlist (item, description, link) VALUES
  ('Unicorn Plushie', 'A magical unicorn friend', 'https://www.bol.com/nl/nl/s/?searchtext=unicorn+plush'),
  ('Art Set', 'For creating masterpieces', 'https://www.bol.com/nl/nl/s/?searchtext=kids+art+set'),
  ('Science Kit', 'To explore and discover', 'https://www.bol.com/nl/nl/s/?searchtext=kids+science+kit'),
  ('Books', 'Adventures in reading', 'https://www.bol.com/nl/nl/s/?searchtext=children+books'),
  ('Rainbow Sneakers', 'For jumping higher', 'https://www.bol.com/nl/nl/s/?searchtext=kids+rainbow+shoes')
ON CONFLICT DO NOTHING;