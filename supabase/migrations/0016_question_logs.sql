-- ============================================================
-- 0016: Soru takibi (TUDU tarzı günlük soru çözüm kaydı)
-- Kullanıcı ders bazlı çözdüğü soruları (D/Y/B) günlük kaydeder.
-- ============================================================

create table if not exists public.question_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  subject text not null,
  topic_id text,
  correct int not null default 0,
  wrong int not null default 0,
  blank int not null default 0,
  created_at timestamptz default now()
);

create index if not exists question_logs_user_date_idx
  on public.question_logs (user_id, log_date desc);

alter table public.question_logs enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'question_logs' and policyname = 'own question logs') then
    create policy "own question logs" on public.question_logs for all
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
