/*
  # Add Optimistic Locking
  
  Adds version column and trigger to prevent concurrent updates
*/

-- Add version column for optimistic locking
ALTER TABLE wishlist 
ADD COLUMN version bigint NOT NULL DEFAULT 1;

-- Create function to handle version increments
CREATE OR REPLACE FUNCTION increment_version()
RETURNS trigger AS $$
BEGIN
  IF OLD.version != NEW.version THEN
    RAISE EXCEPTION 'Concurrent modification detected';
  END IF;
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for version increments
CREATE TRIGGER tr_increment_version
  BEFORE UPDATE ON wishlist
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();