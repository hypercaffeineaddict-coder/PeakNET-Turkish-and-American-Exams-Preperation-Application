-- Gamification: XP + events + haftalık liderlik
alter table public.profiles add column if not exists total_xp int default 0;

create table if not exists public.xp_events (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null,
  reason text not null,
  created_at timestamptz default now()
);
create index if not exists xp_events_user_idx on public.xp_events (user_id, created_at desc);
create index if not exists xp_events_week_idx on public.xp_events (created_at);

alter table public.xp_events enable row level security;
do $do$
begin
  if not exists (select 1 from pg_policies where tablename = 'xp_events' and policyname = 'own xp read') then
    create policy "own xp read" on public.xp_events for select using (auth.uid() = user_id);
  end if;
end $do$;

-- XP ver, yeni toplamı döndür
create or replace function public.award_xp(p_amount int, p_reason text)
returns int language plpgsql security definer set search_path = public as $fn$
declare new_total int;
begin
  if p_amount is null or p_amount <= 0 then
    select coalesce(total_xp, 0) into new_total from public.profiles where id = auth.uid();
    return coalesce(new_total, 0);
  end if;
  insert into public.xp_events (user_id, amount, reason) values (auth.uid(), p_amount, p_reason);
  update public.profiles set total_xp = coalesce(total_xp, 0) + p_amount where id = auth.uid()
    returning total_xp into new_total;
  return coalesce(new_total, 0);
end; $fn$;

-- Haftalık liderlik (cross-user; sadece görünen ad + xp paylaşılır)
create or replace function public.weekly_leaderboard(p_limit int default 20)
returns table(user_id uuid, display_name text, weekly_xp bigint, total_xp int, is_me boolean)
language sql security definer set search_path = public as $fn$
  select p.id,
    coalesce(nullif(p.display_name, ''), 'Anonim') as display_name,
    coalesce((select sum(e.amount) from public.xp_events e
      where e.user_id = p.id and e.created_at >= date_trunc('week', now())), 0)::bigint as weekly_xp,
    coalesce(p.total_xp, 0) as total_xp,
    (p.id = auth.uid()) as is_me
  from public.profiles p
  where p.onboarding_completed_at is not null
  order by weekly_xp desc, total_xp desc
  limit greatest(1, least(p_limit, 100));
$fn$;
