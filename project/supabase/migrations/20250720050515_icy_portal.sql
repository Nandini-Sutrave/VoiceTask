/*
  # Create task categories table

  1. New Tables
    - `task_categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text, unique per user)
      - `color` (text, hex color)
      - `icon` (text, icon name)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `task_categories` table
    - Add policies for users to manage own categories
*/

CREATE TABLE IF NOT EXISTS task_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#6366f1',
  icon text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own task categories"
  ON task_categories
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

CREATE POLICY "Users can create own task categories"
  ON task_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can update own task categories"
  ON task_categories
  FOR UPDATE
  TO authenticated
  USING (uid() = user_id);

CREATE POLICY "Users can delete own task categories"
  ON task_categories
  FOR DELETE
  TO authenticated
  USING (uid() = user_id);

-- Add indexes
CREATE INDEX task_categories_user_id_idx ON task_categories(user_id);