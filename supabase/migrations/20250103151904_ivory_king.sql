-- Create our own audit log table
CREATE TABLE IF NOT EXISTS wishlist_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  item_id integer NOT NULL,
  old_status text,
  new_status text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE wishlist_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own audit logs
CREATE POLICY "Users can read their own audit logs"
  ON wishlist_audit_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Update the logging function to use our new table
CREATE OR REPLACE FUNCTION log_wishlist_policy_decision()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO wishlist_audit_log (
      user_id,
      action,
      item_id,
      old_status,
      new_status
    ) VALUES (
      auth.uid(),
      TG_OP,
      NEW.id,
      OLD.status,
      NEW.status
    );
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS tr_log_wishlist_policy ON wishlist;
CREATE TRIGGER tr_log_wishlist_policy
  AFTER UPDATE ON wishlist
  FOR EACH ROW
  EXECUTE FUNCTION log_wishlist_policy_decision();