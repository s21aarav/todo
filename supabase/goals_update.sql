-- Add start_date column to goals table if it doesn't exist
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
