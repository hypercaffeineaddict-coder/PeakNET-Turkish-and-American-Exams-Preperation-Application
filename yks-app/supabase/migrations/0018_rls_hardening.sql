-- ============================================================
-- 0018: RLS sertleştirme + eksik tablolar
--   topic_resources ve test_attempts tabloları erken kurulumda elle/oluşum
--   dışı yaratılmış olabilir ve hiçbir migration RLS'lerini açmıyordu.
--   Bu, oturum açmış HERHANGİ bir kullanıcının REST API üzerinden başkalarının
--   kaynaklarını/deneme kayıtlarını okuyup yazabilmesi anlamına gelir.
--   Bu migration İDEMPOTENT ve GÜVENLİDİR:
--     • tablo zaten varsa şeması korunur (create table if not exists),
--     • eksik kolonlar güvenle eklenir (add column if not exists),
--     • RLS + sahip-politikası zaten varsa atlanır.
--   Amaç: her satır yalnızca sahibine (auth.uid() = user_id) görünür/yazılır.
--   Supabase SQL Editor'da çalıştır.
-- ============================================================

-- 1) topic_resources — kullanıcının kaynakları (AI test, not, PDF, link, video)
create table if not exists public.topic_resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text references public.topics(id) on delete set null,
  kind text not null default 'link',
  title text not null default '',
  description text,
  url text,
  content text,
  metadata jsonb,
  storage_path text,
  mime_type text,
  file_size bigint,
  is_favorite boolean default false,
  created_at timestamptz default now()
);

-- Var olan tabloda eksik kolonları tamamla (FK'siz; mevcut veriyi bozmaz).
alter table public.topic_resources
  add column if not exists topic_id text,
  add column if not exists kind text,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists url text,
  add column if not exists content text,
  add column if not exists metadata jsonb,
  add column if not exists storage_path text,
  add column if not exists mime_type text,
  add column if not exists file_size bigint,
  add column if not exists is_favorite boolean default false,
  add column if not exists created_at timestamptz default now();

create index if not exists topic_resources_user_idx
  on public.topic_resources (user_id);
create index if not exists topic_resources_user_topic_idx
  on public.topic_resources (user_id, topic_id);

alter table public.topic_resources enable row level security;

do $tr$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'topic_resources'
      and policyname = 'own topic_resources'
  ) then
    create policy "own topic_resources" on public.topic_resources for all
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $tr$;

-- 2) test_attempts — AI test çözüm denemeleri (skor/cevaplar)
create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid references public.topic_resources(id) on delete cascade,
  topic_id text references public.topics(id) on delete set null,
  answers jsonb,
  score int default 0,
  total int default 0,
  created_at timestamptz default now()
);

alter table public.test_attempts
  add column if not exists resource_id uuid,
  add column if not exists topic_id text,
  add column if not exists answers jsonb,
  add column if not exists score int default 0,
  add column if not exists total int default 0,
  add column if not exists created_at timestamptz default now();

create index if not exists test_attempts_user_idx
  on public.test_attempts (user_id, created_at desc);

alter table public.test_attempts enable row level security;

do $ta$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'test_attempts'
      and policyname = 'own test_attempts'
  ) then
    create policy "own test_attempts" on public.test_attempts for all
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $ta$;
