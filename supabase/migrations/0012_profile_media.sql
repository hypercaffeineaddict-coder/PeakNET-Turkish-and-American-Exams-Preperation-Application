-- ============================================================
-- Profil medyası: avatar, banner, bio kolonları.
-- NOT: Görseller artık Supabase Storage'a değil, tarayıcıda küçültülüp
-- doğrudan bu kolonlara (data URL) yazılıyor. Bu yüzden bucket/policy YOK —
-- yalnızca kolon eklemek yeterli (DDL, idempotent).
-- ============================================================

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists banner_url text,
  add column if not exists bio text;
