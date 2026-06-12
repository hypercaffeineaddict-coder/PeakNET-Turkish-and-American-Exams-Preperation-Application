ALTER TABLE mistakes ADD COLUMN photo_url text;

INSERT INTO storage.buckets (id, name, public) VALUES ('mistakes_photos', 'mistakes_photos', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'mistakes_photos');
CREATE POLICY "Users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mistakes_photos' AND auth.uid() = owner);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_creator BOOLEAN DEFAULT false;
