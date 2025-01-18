/*
  # Add Child Names Table with Safe Policy Creation

  1. New Tables
    - `child_names`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text, max 50 chars)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for read/write access
    - Add length constraint on name
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
      name text NOT NULL CHECK (char_length(name) <= 50),
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
  DROP POLICY IF EXISTS "Users can set their own child name" ON child_names;
  DROP POLICY IF EXISTS "Users can update their own child name" ON child_names;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create new policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'child_names' 
    AND policyname = 'Anyone can read child names'
  ) THEN
    CREATE POLICY "Anyone can read child names"
      ON child_names
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'child_names' 
    AND policyname = 'Users can set their own child name'
  ) THEN
    CREATE POLICY "Users can set their own child name"
      ON child_names
      FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() = user_id
        AND char_length(name) <= 50
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'child_names' 
    AND policyname = 'Users can update their own child name'
  ) THEN
    CREATE POLICY "Users can update their own child name"
      ON child_names
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (
        auth.uid() = user_id
        AND char_length(name) <= 50
      );
  END IF;
END $$;