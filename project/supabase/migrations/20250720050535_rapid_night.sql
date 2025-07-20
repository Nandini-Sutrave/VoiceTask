/*
  # Create focus sessions table

  1. New Tables
    - `focus_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `task_id` (uuid, optional, references tasks)
      - `start_time` (timestamp)
      - `end_time` (timestamp, optional)
      - `duration_minutes` (integer)
      - `session_type` (text, pomodoro/deep_work/break/custom)
      - `interruptions` (integer, count of interruptions)
      - `notes` (text, optional session notes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `focus_sessions` table
    - Add policies for users to manage own sessions
*/

CREATE TABLE IF NOT EXISTS focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration_minutes integer,
  session_type text DEFAULT 'pomodoro' CHECK (session_type IN ('pomodoro', 'deep_work', 'break', 'custom')),
  interruptions integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own focus sessions"
  ON focus_sessions
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

CREATE POLICY "Users can create own focus sessions"
  ON focus_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can update own focus sessions"
  ON focus_sessions
  FOR UPDATE
  TO authenticated
  USING (uid() = user_id)
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can delete own focus sessions"
  ON focus_sessions
  FOR DELETE
  TO authenticated
  USING (uid() = user_id);

-- Add indexes
CREATE INDEX focus_sessions_user_id_idx ON focus_sessions(user_id);
CREATE INDEX focus_sessions_task_id_idx ON focus_sessions(task_id);
CREATE INDEX focus_sessions_start_time_idx ON focus_sessions(start_time);
CREATE INDEX focus_sessions_session_type_idx ON focus_sessions(session_type);