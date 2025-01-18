/*
  # Improve Wishlist Schema

  1. Changes
    - Add status enum for better state management
    - Add validation for reservation status transitions
    - Add trigger to prevent multiple reservations
    - Add function to safely handle reservation state changes

  2. Security
    - Maintain RLS policies
    - Add additional validation checks
*/

-- Create reservation status enum
CREATE TYPE reservation_status AS ENUM ('available', 'reserved', 'bought');

-- Create new combined table
CREATE TABLE wishlist (
  id SERIAL PRIMARY KEY,
  item TEXT NOT NULL,
  description TEXT NOT NULL,
  link TEXT NOT NULL,
  status reservation_status NOT NULL DEFAULT 'available',
  reserved_by TEXT,
  reserved_at TIMESTAMPTZ,
  bought_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add status transition validation
CREATE OR REPLACE FUNCTION validate_wishlist_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate status transitions
  IF OLD.status = 'bought' AND NEW.status != 'bought' THEN
    RAISE EXCEPTION 'Cannot change status of bought items';
  END IF;

  -- Set timestamps based on status
  IF NEW.status = 'reserved' AND OLD.status = 'available' THEN
    NEW.reserved_at = now();
  ELSIF NEW.status = 'bought' THEN
    NEW.bought_at = now();
  END IF;

  -- Clear reservation data when item becomes available
  IF NEW.status = 'available' THEN
    NEW.reserved_by = NULL;
    NEW.reserved_at = NULL;
    NEW.bought_at = NULL;
    NEW.user_id = NULL;
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wishlist_status_validation
  BEFORE UPDATE ON wishlist
  FOR EACH ROW
  EXECUTE FUNCTION validate_wishlist_status();

-- Enable RLS
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read wishlist"
  ON wishlist
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can reserve available items"
  ON wishlist
  FOR UPDATE
  TO authenticated
  USING (status = 'available')
  WITH CHECK (
    auth.role() = 'authenticated'
    AND status = 'reserved'
    AND user_id = auth.uid()
    AND reserved_by = auth.email()
  );

CREATE POLICY "Users can update their reservations"
  ON wishlist
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND status = 'reserved'
  )
  WITH CHECK (
    user_id = auth.uid()
    AND (status = 'bought' OR status = 'available')
  );

-- Function to safely reserve an item
CREATE OR REPLACE FUNCTION reserve_wishlist_item(
  p_item_id INTEGER,
  p_user_id UUID,
  p_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE wishlist
  SET 
    status = 'reserved',
    user_id = p_user_id,
    reserved_by = p_email
  WHERE 
    id = p_item_id 
    AND status = 'available';
    
  RETURN FOUND;
END;
$$;

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
BEGIN
  UPDATE wishlist
  SET status = 'bought'
  WHERE 
    id = p_item_id 
    AND user_id = p_user_id
    AND status = 'reserved';
    
  RETURN FOUND;
END;
$$;

-- Migrate existing data
INSERT INTO wishlist (id, item, description, link)
SELECT id, item, description, link
FROM wish_list_items;

UPDATE wishlist w
SET 
  status = CASE 
    WHEN r.bought THEN 'bought'::reservation_status
    ELSE 'reserved'::reservation_status
  END,
  reserved_by = r.reserved_by,
  user_id = r.user_id,
  reserved_at = r.created_at,
  bought_at = r.bought_at
FROM wish_list_reservations r
WHERE w.id = r.item_id;

-- Drop old tables
DROP TABLE wish_list_reservations CASCADE;
DROP TABLE wish_list_items CASCADE;