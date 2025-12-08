-- Create user_schedules table to store each user's schedule data
CREATE TABLE public.user_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_key TEXT NOT NULL,
  day INTEGER NOT NULL,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_key, day)
);

-- Enable RLS
ALTER TABLE public.user_schedules ENABLE ROW LEVEL SECURITY;

-- Users can only view their own schedules
CREATE POLICY "Users can view their own schedules"
ON public.user_schedules
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own schedules
CREATE POLICY "Users can insert their own schedules"
ON public.user_schedules
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own schedules
CREATE POLICY "Users can update their own schedules"
ON public.user_schedules
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own schedules
CREATE POLICY "Users can delete their own schedules"
ON public.user_schedules
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for fast lookups
CREATE INDEX idx_user_schedules_user_month ON public.user_schedules(user_id, month_key);

-- Create trigger for updated_at
CREATE TRIGGER update_user_schedules_updated_at
BEFORE UPDATE ON public.user_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();