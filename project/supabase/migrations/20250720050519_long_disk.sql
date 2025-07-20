/*
  # Create tasks table

  1. New Tables
    - `tasks`
      - Core fields: id, title, description, user_id
      - Status: status, completed_at, created_at, updated_at
      - Scheduling: due_date, due_time, priority
      - Voice/AI: voice_created, voice_confidence, ai_suggested
      - Organization: category, tags, location, notes
      - Time tracking: estimated_duration, actual_duration

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for users to manage own tasks
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Status and timing
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed_at timestamptz,
  due_date date,
  due_time text,
  
  -- Voice and AI features
  voice_created boolean DEFAULT false,
  voice_confidence real,
  ai_suggested boolean DEFAULT false,
  
  -- Organization
  category text,
  tags text[] DEFAULT '{}',
  location text,
  notes text,
  
  -- Time tracking
  estimated_duration integer, -- in minutes
  actual_duration integer, -- in minutes
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (uid() = user_id)
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (uid() = user_id);

-- Add indexes for better performance
CREATE INDEX tasks_user_id_idx ON tasks(user_id);
CREATE INDEX tasks_status_idx ON tasks(status);
CREATE INDEX tasks_priority_idx ON tasks(priority);
CREATE INDEX tasks_due_date_idx ON tasks(due_date);
CREATE INDEX tasks_created_at_idx ON tasks(created_at);
CREATE INDEX tasks_updated_at_idx ON tasks(updated_at);
CREATE INDEX tasks_completed_at_idx ON tasks(completed_at);
CREATE INDEX tasks_category_idx ON tasks(category);
CREATE INDEX tasks_voice_created_idx ON tasks(voice_created);
CREATE INDEX tasks_ai_suggested_idx ON tasks(ai_suggested);

-- Add trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();