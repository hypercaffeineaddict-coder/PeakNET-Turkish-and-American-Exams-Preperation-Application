create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  count int not null default 0,
  primary key (user_id, day)
);

alter table public.ai_usage enable row level security;

do $do$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'ai_usage' and policyname = 'own ai_usage read'
  ) then
    create policy "own ai_usage read" on public.ai_usage for select using (auth.uid() = user_id);
  end if;
end $do$;

create or replace function public.consume_ai_quota(p_limit int default 300)
returns json
language plpgsql security definer set search_path = public as $func$
declare
  new_count int;
begin
  insert into public.ai_usage (user_id, day, count)
  values (auth.uid(), current_date, 1)
  on conflict (user_id, day) do update set count = public.ai_usage.count + 1
  returning count into new_count;
  return json_build_object(
    'allowed', new_count <= p_limit,
    'count', new_count,
    'limit', p_limit
  );
end;
$func$;
