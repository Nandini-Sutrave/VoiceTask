/*
  # Create reminders table

  1. New Tables
    - `reminders`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `user_id` (uuid, references auth.users)
      - `remind_at` (timestamp)
      - `reminder_type` (text, notification/email/sms)
      - `message` (text, optional custom message)
      - `sent` (boolean, tracking if sent)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `reminders` table
    - Add policies for users to manage own reminders
*/

CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  remind_at timestamptz NOT NULL,
  reminder_type text DEFAULT 'notification' CHECK (reminder_type IN ('notification', 'email', 'sms')),
  message text,
  sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders"
  ON reminders
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

CREATE POLICY "Users can create their own reminders"
  ON reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON reminders
  FOR UPDATE
  TO authenticated
  USING (uid() = user_id)
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON reminders
  FOR DELETE
  TO authenticated
  USING (uid() = user_id);

-- Add indexes
CREATE INDEX reminders_user_id_idx ON reminders(user_id);
CREATE INDEX reminders_task_id_idx ON reminders(task_id);
CREATE INDEX reminders_remind_at_idx ON reminders(remind_at);