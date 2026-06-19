-- ============================================================
-- Built-in (hazır) sorular — her konu için AI üretimi ÖZGÜN sorular.
-- Genel içerik: herkes okur, kimse yazamaz (seed migration ile dolar).
-- TELİF: İçerik AI üretimi özgün sorulardır; ÖSYM/MEB sorusu KOPYALANMAZ.
-- Supabase SQL Editor'da çalıştır. Idempotent.
-- ============================================================

create table if not exists public.builtin_questions (
  topic_id text primary key references public.topics(id) on delete cascade,
  subject_name text,
  topic_name text,
  questions jsonb not null,  -- [{stem, options:{A..E}, answer, explanation}]
  created_at timestamptz default now()
);

alter table public.builtin_questions enable row level security;

do $do$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'builtin_questions' and policyname = 'public read builtin'
  ) then
    create policy "public read builtin" on public.builtin_questions for select using (true);
  end if;
end $do$;
