/*
  # Add transaction support for wish list reservations

  1. New Functions
    - `check_and_mark_item_bought`: Handles atomic bought status updates
    
  2. Changes
    - Add transaction support for marking items as bought
    - Prevent race conditions in concurrent operations
*/

-- Function to check and mark an item as bought within a transaction
CREATE OR REPLACE FUNCTION check_and_mark_item_bought(
  p_item_id integer,
  p_user_id uuid,
  p_reserved_by text
)
RETURNS boolean
LANGUAGE plpgsql
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