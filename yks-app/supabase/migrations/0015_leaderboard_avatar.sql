-- ============================================================
-- 0015: Haftalık liderlik tablosuna avatar_url ekle.
-- Return type değiştiği için önce drop gerekiyor (create or replace yetmez).
-- ============================================================

drop function if exists public.weekly_leaderboard(int);

create or replace function public.weekly_leaderboard(p_limit int default 20)
returns table(
  user_id uuid,
  display_name text,
  avatar_url text,
  weekly_xp bigint,
  total_xp int,
  is_me boolean
)
language sql security definer set search_path = public as $fn$
  select p.id,
    coalesce(nullif(p.display_name, ''), 'Anonim') as display_name,
    p.avatar_url,
    coalesce((select sum(e.amount) from public.xp_events e
      where e.user_id = p.id and e.created_at >= date_trunc('week', now())), 0)::bigint as weekly_xp,
    coalesce(p.total_xp, 0) as total_xp,
    (p.id = auth.uid()) as is_me
  from public.profiles p
  where p.onboarding_completed_at is not null
  order by weekly_xp desc, total_xp desc
  limit greatest(1, least(p_limit, 100));
$fn$;
