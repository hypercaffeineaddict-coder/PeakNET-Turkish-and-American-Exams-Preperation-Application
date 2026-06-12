-- Add is_creator and is_admin columns for admin/creator features
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_creator BOOLEAN DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set the app creator
UPDATE public.profiles 
SET is_creator = true, is_admin = true 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'hypercaffeineaddict@gmail.com'
);
