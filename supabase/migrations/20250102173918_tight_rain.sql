/*
  # Add child names table
  
  1. New Tables
    - `child_names`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS
    - Add policies for read/write access
*/

CREATE TABLE child_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE child_names ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read child names"
  ON child_names
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own child name"
  ON child_names
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update their own child name"
  ON child_names
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);