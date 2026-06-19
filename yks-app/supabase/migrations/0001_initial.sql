-- ============================================================
-- YKS App - Initial Schema (MF AYT odaklı)
-- Supabase SQL Editor'da bu dosyanın tamamını çalıştır.
-- ============================================================

create extension if not exists "pgcrypto";
create extension if not exists vector with schema extensions;

-- ---------- Profiller (auth.users üzerine) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.streaks (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Müfredat: Dersler ve Konular ----------
create table public.subjects (
  id text primary key,
  name text not null,
  color text,
  question_count int,
  display_order int default 0
);

create table public.topics (
  id text primary key,
  subject_id text not null references public.subjects(id) on delete cascade,
  name text not null,
  grade int,
  priority text check (priority in ('high','medium','low')),
  display_order int default 0
);

create index on public.topics (subject_id);

-- ---------- Konu ilerlemesi ----------
create table public.topic_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null references public.topics(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started','in_progress','done')),
  confidence int default 0 check (confidence between 0 and 5),
  updated_at timestamptz default now(),
  primary key (user_id, topic_id)
);

-- ---------- Çalışma seansları (Pomodoro / serbest) ----------
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text references public.topics(id) on delete set null,
  subject_id text references public.subjects(id) on delete set null,
  started_at timestamptz not null default now(),
  duration_seconds int not null,
  pomodoros int default 0,
  notes text
);

create index on public.study_sessions (user_id, started_at desc);

-- ---------- Streak ----------
create table public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak int default 0,
  longest_streak int default 0,
  last_study_date date,
  freezes_available int default 2,
  updated_at timestamptz default now()
);

-- ---------- Denemeler ----------
create table public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  exam_type text not null default 'AYT' check (exam_type in ('TYT','AYT','YDT')),
  exam_date date not null,
  totals jsonb not null default '{}'::jsonb,    -- {"matematik": {"d":30,"y":5,"b":5,"net":28.75}, ...}
  topic_breakdown jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index on public.exams (user_id, exam_date desc);

-- ---------- Yanlış / eksik defteri (spaced repetition) ----------
create table public.mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text references public.topics(id) on delete set null,
  question_text text,
  question_image_path text,
  my_answer text,
  correct_answer text,
  reason text,
  ease real default 2.5,        -- SM-2
  interval_days int default 1,
  repetitions int default 0,
  next_review_at date default current_date,
  created_at timestamptz default now()
);

create index on public.mistakes (user_id, next_review_at);

-- ---------- Notlar + RAG embeddings ----------
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subject_id text references public.subjects(id) on delete set null,
  topic_id text references public.topics(id) on delete set null,
  file_path text,
  content text,
  created_at timestamptz default now()
);

create table public.note_chunks (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding extensions.vector(768)   -- nomic-embed-text → 768d
);

create index on public.note_chunks using hnsw (embedding extensions.vector_cosine_ops);

-- ---------- Çıkmış sorular arşivi ----------
create table public.past_questions (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  exam_type text not null check (exam_type in ('TYT','AYT','YDT')),
  subject_id text references public.subjects(id) on delete set null,
  topic_id text references public.topics(id) on delete set null,
  question_number int,
  question_image_path text,
  question_text text,
  correct_answer text
);

create index on public.past_questions (year, exam_type, subject_id);

-- ============================================================
-- RLS Politikaları
-- ============================================================
alter table public.profiles         enable row level security;
alter table public.topic_progress   enable row level security;
alter table public.study_sessions   enable row level security;
alter table public.streaks          enable row level security;
alter table public.exams            enable row level security;
alter table public.mistakes         enable row level security;
alter table public.notes            enable row level security;
alter table public.note_chunks      enable row level security;

-- Müfredat ve çıkmış sorular herkese okunur, kimse yazamaz (seed ile dolar)
alter table public.subjects         enable row level security;
alter table public.topics           enable row level security;
alter table public.past_questions   enable row level security;

create policy "public read subjects"        on public.subjects       for select using (true);
create policy "public read topics"          on public.topics         for select using (true);
create policy "public read past_questions"  on public.past_questions for select using (true);

-- Kullanıcı kendi verisi
create policy "own profile read"  on public.profiles for select using (auth.uid() = id);
create policy "own profile write" on public.profiles for update using (auth.uid() = id);

create policy "own progress"      on public.topic_progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own sessions"      on public.study_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own streak read"   on public.streaks for select using (auth.uid() = user_id);
create policy "own streak write"  on public.streaks for update using (auth.uid() = user_id);

create policy "own exams"         on public.exams for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own mistakes"      on public.mistakes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own notes"         on public.notes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own note chunks"   on public.note_chunks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- RPC: bugün çalışıldığında streak'i güncelle
-- ============================================================
create or replace function public.touch_streak()
returns public.streaks
language plpgsql security definer set search_path = public as $$
declare
  s public.streaks;
  today date := current_date;
begin
  select * into s from public.streaks where user_id = auth.uid();
  if s is null then
    insert into public.streaks (user_id, current_streak, longest_streak, last_study_date)
      values (auth.uid(), 1, 1, today)
      returning * into s;
    return s;
  end if;

  if s.last_study_date = today then
    return s;
  elsif s.last_study_date = today - 1 then
    update public.streaks
       set current_streak = current_streak + 1,
           longest_streak = greatest(longest_streak, current_streak + 1),
           last_study_date = today,
           updated_at = now()
     where user_id = auth.uid()
     returning * into s;
  else
    update public.streaks
       set current_streak = 1,
           last_study_date = today,
           updated_at = now()
     where user_id = auth.uid()
     returning * into s;
  end if;

  return s;
end;
$$;
