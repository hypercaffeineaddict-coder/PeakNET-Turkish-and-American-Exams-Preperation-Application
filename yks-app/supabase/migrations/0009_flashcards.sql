-- ============================================================
-- Tekrar kartları (flashcards) — Anki tarzı aralıklı tekrar (SM-2).
-- Supabase SQL Editor'da çalıştır. Idempotent.
-- ============================================================

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text references public.topics(id) on delete set null,
  subject_name text,
  topic_name text,
  front text not null,           -- ön yüz (soru/kavram)
  back text not null,            -- arka yüz (cevap/açıklama)
  ease real default 2.5,         -- SM-2 kolaylık faktörü
  interval_days int default 0,   -- mevcut tekrar aralığı
  repetitions int default 0,     -- ardışık doğru tekrar sayısı
  next_review_at date default current_date,
  created_at timestamptz default now()
);

create index if not exists flashcards_user_due_idx
  on public.flashcards (user_id, next_review_at);

alter table public.flashcards enable row level security;

do $do$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'flashcards' and policyname = 'own flashcards'
  ) then
    create policy "own flashcards" on public.flashcards for all
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $do$;
