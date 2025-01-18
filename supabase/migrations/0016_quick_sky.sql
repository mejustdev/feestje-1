/*
  # Create notes table with position tracking

  1. New Tables
    - `notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `position` (integer)
      - `background_color` (text)
      - `text_color` (text)
      - `emoji` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Functions
    - `update_note_positions`: Function to bulk update note positions

  3. Security
    - Enable RLS
    - Add policies for CRUD operations
*/

-- Create notes table
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  content text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  background_color text NOT NULL DEFAULT '#FFE4B5',
  text_color text NOT NULL DEFAULT '#000000',
  emoji text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE
  ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_notes_updated_at();

-- Create function to update note positions
CREATE OR REPLACE FUNCTION update_note_positions(position_updates jsonb[])
RETURNS void AS $$
BEGIN
  FOR i IN 1..array_length(position_updates, 1) LOOP
    UPDATE notes
    SET position = (position_updates[i]->>'position')::integer
    WHERE id = (position_updates[i]->>'id')::uuid;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create policies
CREATE POLICY "Users can read their own notes"
  ON notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);