-- ============================================================
-- 0014: Web Push abonelikleri
-- Tarayıcı/cihaz push aboneliklerini saklar. Cron, çalışmayan ve
-- streak'i tehlikedeki kullanıcılara hatırlatma gönderir.
-- ============================================================

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now(),
  last_notified_at timestamptz
);

create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Kullanıcı yalnızca kendi aboneliklerini yönetir.
-- (Gönderim cron'u service_role ile çalışır, RLS'i bypass eder.)
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'push_subscriptions' and policyname = 'own push subs') then
    create policy "own push subs" on public.push_subscriptions for all
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
