/*
  # Create AI suggestions table

  1. New Tables
    - `ai_suggestions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `suggestion_type` (text, task/optimization/insight/reminder)
      - `title` (text, suggestion title)
      - `description` (text, suggestion details)
      - `metadata` (jsonb, additional data)
      - `accepted` (boolean, user response)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `ai_suggestions` table
    - Add policies for users to view/update own suggestions
*/

CREATE TABLE IF NOT EXISTS ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_type text NOT NULL CHECK (suggestion_type IN ('task', 'optimization', 'insight', 'reminder')),
  title text NOT NULL,
  description text,
  metadata jsonb,
  accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai suggestions"
  ON ai_suggestions
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

CREATE POLICY "Users can create own ai suggestions"
  ON ai_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can update own ai suggestions"
  ON ai_suggestions
  FOR UPDATE
  TO authenticated
  USING (uid() = user_id)
  WITH CHECK (uid() = user_id);

-- Add indexes
CREATE INDEX ai_suggestions_user_id_idx ON ai_suggestions(user_id);
CREATE INDEX ai_suggestions_type_idx ON ai_suggestions(suggestion_type);
CREATE INDEX ai_suggestions_created_at_idx ON ai_suggestions(created_at);