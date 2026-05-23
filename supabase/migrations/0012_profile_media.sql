-- ============================================================
-- Profil medyası: avatar, banner, bio + public 'avatars' storage bucket.
-- Supabase SQL Editor'da çalıştır. Idempotent.
-- ============================================================

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists banner_url text,
  add column if not exists bio text;

-- Public bucket: profil görselleri (avatar + banner). Herkese okunur.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'avatars',
    'avatars',
    true,
    5242880, -- 5 MB
    array['image/png','image/jpeg','image/webp','image/gif']
  )
  on conflict (id) do update set
    public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Politikalar: herkes okur; kullanıcı yalnızca kendi user_id'siyle başlayan
-- path'lere yazar/günceller/siler (avatars/{uid}/...).
do $do$
begin
  if not exists (select 1 from pg_policies where tablename = 'objects' and schemaname = 'storage' and policyname = 'public read avatars') then
    create policy "public read avatars" on storage.objects for select
      using (bucket_id = 'avatars');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'objects' and schemaname = 'storage' and policyname = 'own avatars insert') then
    create policy "own avatars insert" on storage.objects for insert
      with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'objects' and schemaname = 'storage' and policyname = 'own avatars update') then
    create policy "own avatars update" on storage.objects for update
      using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'objects' and schemaname = 'storage' and policyname = 'own avatars delete') then
    create policy "own avatars delete" on storage.objects for delete
      using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $do$;
