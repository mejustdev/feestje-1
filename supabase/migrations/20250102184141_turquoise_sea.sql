/*
  # Update child names table
  
  1. Changes
    - Ensures child_names table exists with proper structure
    - Refreshes policies to ensure proper access control
  
  2. Security
    - Maintains RLS
    - Updates policies for proper access control
*/

-- Safely create table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'child_names'
  ) THEN
    CREATE TABLE child_names (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id),
      name text NOT NULL,
      created_at timestamptz DEFAULT now(),
      UNIQUE(user_id)
    );
    
    -- Enable RLS
    ALTER TABLE child_names ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can read child names" ON child_names;
  DROP POLICY IF EXISTS "Users can insert their own child name" ON child_names;
  DROP POLICY IF EXISTS "Users can update their own child name" ON child_names;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Recreate policies
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