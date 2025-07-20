/*
  # Helper Functions and Triggers

  1. Helper Functions
    - `uid()` - Get current user ID
    - `update_updated_at_column()` - Auto-update timestamps
    - `handle_new_user()` - Create profile on user signup
    - `create_default_categories()` - Create default task categories

  2. Security
    - Enable RLS on auth.users if needed
*/

-- Helper function to get current user ID
CREATE OR REPLACE FUNCTION uid() RETURNS uuid AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE;

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, now(), now());
  
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, now(), now());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.task_categories (user_id, name, color, icon) VALUES
    (NEW.id, 'Work', '#4f46e5', 'briefcase'),
    (NEW.id, 'Personal', '#22c55e', 'user'),
    (NEW.id, 'Health', '#ef4444', 'heart'),
    (NEW.id, 'Shopping', '#f59e0b', 'shopping-cart'),
    (NEW.id, 'Education', '#8b5cf6', 'book');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();