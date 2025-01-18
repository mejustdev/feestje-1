/*
  # Add voting system

  1. New Tables
    - `votes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `choice` (boolean, true for yes, false for no)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `votes` table
    - Add policies for authenticated users to:
      - Read all votes
      - Create/update their own vote
*/

-- Create votes table
CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  choice boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_votes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_votes_updated_at
  BEFORE UPDATE
  ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_votes_updated_at();

-- Create policies
CREATE POLICY "Anyone can read all votes"
  ON votes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own vote"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update their own vote"
  ON votes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);