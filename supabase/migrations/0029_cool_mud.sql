/*
  # Add wish list items table
  
  1. New Tables
    - `wish_list_items`
      - `id` (integer, primary key)
      - `item` (text)
      - `description` (text)
      - `link` (text)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS
    - Add policy for public read access
*/

CREATE TABLE wish_list_items (
  id integer PRIMARY KEY,
  item text NOT NULL,
  description text NOT NULL,
  link text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE wish_list_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can read wish list items"
  ON wish_list_items
  FOR SELECT
  USING (true);

-- Insert initial items
INSERT INTO wish_list_items (id, item, description, link) VALUES
  (1, 'Unicorn Plushie', 'A magical unicorn friend', 'https://www.bol.com/nl/nl/s/?searchtext=unicorn+plush'),
  (2, 'Art Set', 'For creating masterpieces', 'https://www.bol.com/nl/nl/s/?searchtext=kids+art+set'),
  (3, 'Science Kit', 'To explore and discover', 'https://www.bol.com/nl/nl/s/?searchtext=kids+science+kit'),
  (4, 'Books', 'Adventures in reading', 'https://www.bol.com/nl/nl/s/?searchtext=children+books'),
  (5, 'Rainbow Sneakers', 'For jumping higher', 'https://www.bol.com/nl/nl/s/?searchtext=kids+rainbow+shoes');