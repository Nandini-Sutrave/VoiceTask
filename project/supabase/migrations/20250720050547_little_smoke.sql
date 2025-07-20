/*
  # Create analytics table

  1. New Tables
    - `analytics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date, unique per user per day)
      - `tasks_created` (integer, daily count)
      - `tasks_completed` (integer, daily count)
      - `voice_tasks_created` (integer, daily count)
      - `focus_minutes` (integer, total focus time)
      - `productivity_score` (real, calculated score)
      - `mood_rating` (integer, 1-5 scale)
      - `notes` (text, daily notes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `analytics` table
    - Add policy for users to view own analytics
*/

CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  tasks_created integer DEFAULT 0,
  tasks_completed integer DEFAULT 0,
  voice_tasks_created integer DEFAULT 0,
  focus_minutes integer DEFAULT 0,
  productivity_score real,
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 5),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

-- Add indexes
CREATE INDEX analytics_user_id_idx ON analytics(user_id);
CREATE INDEX analytics_date_idx ON analytics(date);