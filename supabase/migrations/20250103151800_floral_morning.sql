-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can mark items as bought" ON wishlist;
  DROP POLICY IF EXISTS "Users can revert bought items" ON wishlist;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create policy for marking items as bought
CREATE POLICY "Users can mark items as bought"
  ON wishlist
  FOR UPDATE
  TO authenticated
  USING (
    status = 'available' 
    AND auth.role() = 'authenticated'
  )
  WITH CHECK (
    status = 'bought'
    AND user_id = auth.uid()
    AND reserved_by = auth.email()
    AND bought_at IS NOT NULL
  );

-- Create policy for reverting bought items
CREATE POLICY "Users can revert bought items"
  ON wishlist
  FOR UPDATE
  TO authenticated
  USING (
    status = 'bought'
    AND user_id = auth.uid()
    AND auth.role() = 'authenticated'
  )
  WITH CHECK (
    status = 'available'
    AND user_id IS NULL
    AND reserved_by IS NULL
    AND reserved_at IS NULL
    AND bought_at IS NULL
  );