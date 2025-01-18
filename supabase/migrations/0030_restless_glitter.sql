/*
  # Add foreign key constraint to wish_list_reservations

  1. Changes
    - Add foreign key constraint from wish_list_reservations.item_id to wish_list_items.id
    - Add NOT NULL constraint to item_id
    - Add index on item_id for better performance

  2. Security
    - No changes to RLS policies
*/

-- Add foreign key constraint
ALTER TABLE wish_list_reservations
  ADD CONSTRAINT fk_wish_list_item
  FOREIGN KEY (item_id)
  REFERENCES wish_list_items(id)
  ON DELETE RESTRICT;

-- Ensure item_id is NOT NULL
ALTER TABLE wish_list_reservations
  ALTER COLUMN item_id SET NOT NULL;

-- Add index for better join performance
CREATE INDEX IF NOT EXISTS wish_list_reservations_item_id_idx
  ON wish_list_reservations(item_id);