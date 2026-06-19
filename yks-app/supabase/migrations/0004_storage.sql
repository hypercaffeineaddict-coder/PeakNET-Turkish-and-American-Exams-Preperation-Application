-- Storage bucket: kişisel kaynak dosyaları (PDF, doc, resim)
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

-- Kullanıcılar sadece kendi user_id'leriyle başlayan path'lere yazabilir / okuyabilir / silebilir
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

-- topic_resources tablosuna storage path tutmak için kolonlar
alter table public.topic_resources
  add column if not exists storage_path text,
  add column if not exists mime_type text,
  add column if not exists file_size bigint;
