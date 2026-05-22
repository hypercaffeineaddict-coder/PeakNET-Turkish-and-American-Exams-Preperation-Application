-- ============================================================
-- Şema senkronizasyonu: canlı DB'ye elle eklenmiş kolonları migration'a işler.
-- Hepsi idempotent (IF NOT EXISTS) — canlıda no-op, sıfırdan kurulumda gerekli.
-- Supabase SQL Editor'da çalıştır.
-- ============================================================

-- subjects: sınav türü (konular/ustalık/panel bu kolona göre filtreler)
alter table public.subjects
  add column if not exists exam_type text not null default 'AYT'
    check (exam_type in ('TYT','AYT','MSU','KPSS','YDT'));

create index if not exists subjects_exam_type_idx on public.subjects (exam_type);

-- profiles: onboarding alanları (lise bölümü + sınav öğrencisi)
alter table public.profiles
  add column if not exists high_school_track text
    check (high_school_track is null or high_school_track in ('MF','TM','EA','Sozel','Dil')),
  add column if not exists is_exam_student boolean default false;
