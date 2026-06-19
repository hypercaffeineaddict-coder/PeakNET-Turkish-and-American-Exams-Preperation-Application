-- Onboarding alanları
alter table public.profiles
  add column if not exists grade int check (grade between 9 and 13),
  add column if not exists target_university text,
  add column if not exists target_department text,
  add column if not exists daily_goal_minutes int default 60 check (daily_goal_minutes between 15 and 720),
  add column if not exists strong_subjects text[] default '{}',
  add column if not exists weak_subjects text[] default '{}',
  add column if not exists onboarding_completed_at timestamptz;

-- own profile insert (handle_new_user trigger zaten yazıyor, ama RLS açık olduğu için update yetkisi yeterli değil ekleme için)
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'profiles' and policyname = 'own profile insert'
  ) then
    create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
  end if;
end $$;
