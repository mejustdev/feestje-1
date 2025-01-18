/*
  # One item per user constraint

  1. Changes
    - Add trigger to enforce one item per user rule
    - Update policies to maintain data integrity

  2. Security
    - Maintains existing RLS policies
    - Adds trigger-based validation for reservations
*/

-- Create function to check reservation count
CREATE OR REPLACE FUNCTION check_user_reservation_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM wish_list_reservations
    WHERE user_id = NEW.user_id
  ) > 0 THEN
    RAISE EXCEPTION 'User can only reserve one item';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce one reservation per user
DROP TRIGGER IF EXISTS ensure_single_reservation ON wish_list_reservations;
CREATE TRIGGER ensure_single_reservation
  BEFORE INSERT ON wish_list_reservations
  FOR EACH ROW
  EXECUTE FUNCTION check_user_reservation_count();

-- Update the insert policy to include the one-item check
DROP POLICY IF EXISTS "Users can reserve unreserved items" ON wish_list_reservations;

CREATE POLICY "Users can reserve unreserved items"
  ON wish_list_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Ensure user is authenticated
    auth.role() = 'authenticated'
    -- Ensure item isn't already reserved
    AND NOT EXISTS (
      SELECT 1 
      FROM wish_list_reservations r
      WHERE r.item_id = wish_list_reservations.item_id
    )
    -- Ensure user_id matches the authenticated user
    AND user_id = auth.uid()
    -- Ensure reserved_by matches the user's email
    AND reserved_by = auth.email()
  );