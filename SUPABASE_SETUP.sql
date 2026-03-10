-- Create plays table
CREATE TABLE plays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  formation TEXT NOT NULL,
  routes JSONB NOT NULL DEFAULT '[]',
  ball_sequence JSONB NOT NULL DEFAULT '[]',
  players JSONB NOT NULL,
  ball JSONB NOT NULL,
  offside_line FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX plays_user_id_idx ON plays(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;

-- Create policy: users can only see their own plays
CREATE POLICY "Users can view their own plays"
  ON plays
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: users can insert their own plays
CREATE POLICY "Users can insert their own plays"
  ON plays
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: users can update their own plays
CREATE POLICY "Users can update their own plays"
  ON plays
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: users can delete their own plays
CREATE POLICY "Users can delete their own plays"
  ON plays
  FOR DELETE
  USING (auth.uid() = user_id);
