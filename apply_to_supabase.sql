-- ==========================================
-- EKSİK VERİTABANI GÜNCELLEMELERİ
-- (Lütfen bu kodu kopyalayıp Supabase Dashboard > SQL Editor'e yapıştırın ve RUN'a basın)
-- ==========================================

-- 1. YANLIŞ DEFTERİ FOTOĞRAF ÖZELLİĞİ (0021_mistakes_photo)
alter table public.mistakes
  add column if not exists photo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'mistakes',
    'mistakes',
    false,
    5242880, -- 5 MB
    array['image/png', 'image/jpeg', 'image/webp']
  )
  on conflict (id) do update set
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

do $do$
begin
  if not exists (select 1 from pg_policies where tablename = 'objects' and schemaname = 'storage' and policyname = 'own mistakes delete') then
    create policy "own mistakes delete" on storage.objects for delete
      using (bucket_id = 'mistakes' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'objects' and schemaname = 'storage' and policyname = 'own mistakes insert') then
    create policy "own mistakes insert" on storage.objects for insert
      with check (bucket_id = 'mistakes' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'objects' and schemaname = 'storage' and policyname = 'own mistakes read') then
    create policy "own mistakes read" on storage.objects for select
      using (bucket_id = 'mistakes' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $do$;


-- 2. KAYNAKLAR (DOSYA YÜKLEME) BUCKET'I (0004_storage)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'resources',
    'resources',
    false,
    52428800, -- 50 MB
    array['application/pdf','image/png','image/jpeg','image/webp','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  )
  on conflict (id) do update set
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

do $do$
begin
  if not exists (select 1 from pg_policies where tablename = 'objects' and schemaname = 'storage' and policyname = 'own resources read') then
    create policy "own resources read" on storage.objects for select
      using (bucket_id = 'resources' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'objects' and schemaname = 'storage' and policyname = 'own resources insert') then
    create policy "own resources insert" on storage.objects for insert
      with check (bucket_id = 'resources' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'objects' and schemaname = 'storage' and policyname = 'own resources delete') then
    create policy "own resources delete" on storage.objects for delete
      using (bucket_id = 'resources' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $do$;


-- 3. KENDİ API KEY'İNİ KULLANMA ÖZELLİĞİ (0020_byok_api_keys)
alter table public.profiles
  add column if not exists api_keys JSONB DEFAULT '{}'::jsonb;


-- 4. KURUCU / ADMİN YETKİLERİ (0023_admin_creator)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_creator BOOLEAN DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

UPDATE public.profiles 
SET is_creator = true, is_admin = true
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'hypercaffeineaddict@gmail.com'
);


-- 5. KONU İSİMLERİNDEKİ TÜRKÇE KARAKTER BOZUKLUKLARI (0022_fix_turkish_chars)
update public.topics
set name = replace(name, 'Ã¼', 'ü')
where name like '%Ã¼%';

update public.topics
set name = replace(name, 'Ã¶', 'ö')
where name like '%Ã¶%';

update public.topics
set name = replace(name, 'Ã§', 'ç')
where name like '%Ã§%';

update public.topics
set name = replace(name, 'ÄŸ', 'ğ')
where name like '%ÄŸ%';

update public.topics
set name = replace(name, 'Ä±', 'ı')
where name like '%Ä±%';

update public.topics
set name = replace(name, 'ÅŸ', 'ş')
where name like '%ÅŸ%';

update public.topics
set name = replace(name, 'Ãœ', 'Ü')
where name like '%Ãœ%';

update public.topics
set name = replace(name, 'Ã–', 'Ö')
where name like '%Ã–%';

update public.topics
set name = replace(name, 'Ã‡', 'Ç')
where name like '%Ã‡%';

update public.topics
set name = replace(name, 'Äž', 'Ğ')
where name like '%Äž%';

update public.topics
set name = replace(name, 'Ä°', 'İ')
where name like '%Ä°%';

update public.topics
set name = replace(name, 'Åž', 'Ş')
where name like '%Åž%';
