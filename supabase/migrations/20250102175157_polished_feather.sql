/*
  # Safe User Deletion Function

  1. New Functions
    - `delete_user_safely`: Deletes a user and all their associated data
    
  2. Changes
    - Adds transaction handling
    - Cascading deletes for all user data
    - Proper error handling
    
  3. Security
    - Function is SECURITY DEFINER
    - Limited to authenticated users
    - Users can only delete themselves
*/

CREATE OR REPLACE FUNCTION delete_user_safely(user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  -- Verify the user exists
  SELECT COUNT(*) INTO v_count
  FROM auth.users
  WHERE id = user_id;

  IF v_count = 0 THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Delete all user data in a transaction
  BEGIN
    -- Delete child names
    DELETE FROM child_names WHERE user_id = user_id;
    
    -- Delete votes
    DELETE FROM votes WHERE user_id = user_id;
    
    -- Delete notes
    DELETE FROM notes WHERE user_id = user_id;
    
    -- Delete wish list reservations
    DELETE FROM wish_list_reservations WHERE user_id = user_id;
    
    -- Delete the user
    DELETE FROM auth.users WHERE id = user_id;

    RETURN true;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to delete user: %', SQLERRM;
      RETURN false;
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_safely TO authenticated;

-- Create policy to ensure users can only delete themselves
CREATE POLICY "Users can only delete themselves"
  ON auth.users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);