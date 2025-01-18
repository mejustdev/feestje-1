/*
  # Fix RLS policies for marking items as bought

  1. Changes
    - Add SECURITY DEFINER to the check_and_mark_item_bought function
    - Update RLS policies to properly handle bought items
    
  2. Security
    - Function runs with elevated privileges to bypass RLS
    - RLS policies still protect direct table access
*/

-- Drop existing function
DROP FUNCTION IF EXISTS check_and_mark_item_bought;

-- Recreate function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION check_and_mark_item_bought(
  p_item_id integer,
  p_user_id uuid,
  p_reserved_by text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_bought boolean;
BEGIN
  -- Start transaction with serializable isolation
  BEGIN
    -- Check if item is already bought
    SELECT bought INTO v_is_bought
    FROM wish_list_reservations
    WHERE item_id = p_item_id
    FOR UPDATE;

    IF v_is_bought THEN
      RETURN false;
    END IF;

    -- Insert new reservation with bought status
    INSERT INTO wish_list_reservations (
      item_id,
      user_id,
      reserved_by,
      bought,
      bought_at
    ) VALUES (
      p_item_id,
      p_user_id,
      p_reserved_by,
      true,
      CURRENT_TIMESTAMP
    );

    RETURN true;
  EXCEPTION
    WHEN unique_violation THEN
      RETURN false;
  END;
END;
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can mark items as bought" ON wish_list_reservations;
DROP POLICY IF EXISTS "Anyone can read reservations" ON wish_list_reservations;

-- Recreate policies with proper checks
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
    -- Only allow insert if item is not already bought
    AND NOT EXISTS (
      SELECT 1 
      FROM wish_list_reservations r
      WHERE r.item_id = wish_list_reservations.item_id
      AND r.bought = true
    )
  );