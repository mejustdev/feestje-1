/*
  # Update bought logic

  1. Changes
    - Add policy to allow users to delete their own records
    
  2. Security
    - Enable delete policy for authenticated users on their own records
*/

-- Add delete policy for users to remove their own records
CREATE POLICY "Users can delete their own records"
  ON wish_list_reservations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());