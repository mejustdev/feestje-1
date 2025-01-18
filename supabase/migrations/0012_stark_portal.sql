/*
  # Fix sticky notes position columns

  1. Changes
    - Change position columns from integer to double precision to support decimal values
    - Add check constraints to ensure positions are valid numbers

  2. Security
    - Maintain existing RLS policies
*/

-- Change position columns to double precision
ALTER TABLE sticky_notes 
  ALTER COLUMN position_x TYPE double precision,
  ALTER COLUMN position_y TYPE double precision;

-- Add check constraints for valid positions
ALTER TABLE sticky_notes
  ADD CONSTRAINT check_valid_position 
  CHECK (
    position_x >= 0 AND 
    position_y >= 0 AND 
    position_x <= 10000 AND  -- reasonable max width
    position_y <= 10000      -- reasonable max height
  );