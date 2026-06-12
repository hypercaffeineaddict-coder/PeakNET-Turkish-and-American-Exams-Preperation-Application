-- Add api_keys JSONB column for Bring Your Own Key (BYOK) functionality
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS api_keys JSONB DEFAULT '{}'::jsonb;
