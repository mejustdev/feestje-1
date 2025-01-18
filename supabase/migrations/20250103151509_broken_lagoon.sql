/*
  # Enhanced Wishlist Policies
  
  1. Updates policies with better validation
  2. Adds policy decision logging
  3. Improves error handling
*/

-- Drop existing policy (wrapped in DO block for safety)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can mark items as bought" ON wishlist;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Recreate policy with enhanced validation
CREATE POLICY "Users can mark items as bought"
  ON wishlist
  FOR UPDATE
  TO authenticated
  USING (
    CASE
      WHEN NOT (auth.role() = 'authenticated') 
        THEN false
      WHEN NOT (status = 'available' OR (status = 'reserved' AND user_id = auth.uid()))
        THEN false
      ELSE true
    END
  )
  WITH CHECK (
    CASE
      WHEN NOT (
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
      ) THEN false
      ELSE true
    END
  );

-- Create logging function
CREATE OR REPLACE FUNCTION log_wishlist_policy_decision()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO auth.audit_log_entries (
      instance_id,
      ip_address,
      payload
    ) VALUES (
      auth.uid(),
      inet_client_addr(),
      jsonb_build_object(
        'action', TG_OP,
        'table', TG_TABLE_NAME,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'item_id', NEW.id,
        'timestamp', now()
      )
    );
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS tr_log_wishlist_policy ON wishlist;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create trigger for logging
CREATE TRIGGER tr_log_wishlist_policy
  AFTER UPDATE ON wishlist
  FOR EACH ROW
  EXECUTE FUNCTION log_wishlist_policy_decision();