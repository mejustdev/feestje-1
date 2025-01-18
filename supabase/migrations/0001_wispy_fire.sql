/*
  # Create wish list reservations table

  1. New Tables
    - `wish_list_reservations`
      - `id` (uuid, primary key)
      - `item_id` (integer, not null)
      - `user_id` (uuid, not null, references auth.users)
      - `created_at` (timestamp with time zone, default: now())
  
  2. Security
    - Enable RLS on `wish_list_reservations` table
    - Add policies for:
      - Users can read all reservations
      - Users can only reserve items for themselves that aren't already reserved
*/

CREATE TABLE wish_list_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id integer NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(item_id)
);

ALTER TABLE wish_list_reservations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read reservations
CREATE POLICY "Users can read all reservations"
  ON wish_list_reservations
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can only reserve items for themselves and only if not already reserved
CREATE POLICY "Users can reserve unreserved items"
  ON wish_list_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 
      FROM wish_list_reservations existing
      WHERE existing.item_id = item_id
    )
  );