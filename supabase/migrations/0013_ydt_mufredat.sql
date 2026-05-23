-- ============================================================
-- YDT (Yabancı Dil Testi) — İngilizce müfredatı (Dil öğrencileri).
-- Supabase SQL Editor'da çalıştır. Idempotent.
-- ============================================================

insert into public.subjects (id, name, color, question_count, display_order, exam_type, tracks) values
  ('ydt_ingilizce', 'İngilizce (YDT)', '#8b5cf6', 80, 0, 'YDT', '{Dil}')
on conflict (id) do update set
  name = excluded.name, color = excluded.color, question_count = excluded.question_count,
  display_order = excluded.display_order, exam_type = excluded.exam_type, tracks = excluded.tracks;

insert into public.topics (id, subject_id, name, grade, priority, display_order) values
  ('ydt_kelime',        'ydt_ingilizce', 'Kelime Bilgisi (Vocabulary)',            0,  'high',   0),
  ('ydt_tenses',        'ydt_ingilizce', 'Dilbilgisi: Zamanlar (Tenses)',          0,  'high',   1),
  ('ydt_modals',        'ydt_ingilizce', 'Dilbilgisi: Modals',                     0,  'medium', 2),
  ('ydt_gerund_inf',    'ydt_ingilizce', 'Dilbilgisi: Gerund & Infinitive',        0,  'medium', 3),
  ('ydt_relative',      'ydt_ingilizce', 'Dilbilgisi: Relative Clauses',           0,  'medium', 4),
  ('ydt_noun_clause',   'ydt_ingilizce', 'Dilbilgisi: Noun Clauses',               0,  'medium', 5),
  ('ydt_adverbial',     'ydt_ingilizce', 'Dilbilgisi: Adverbial Clauses & Bağlaçlar', 0, 'medium', 6),
  ('ydt_conditionals',  'ydt_ingilizce', 'Dilbilgisi: Conditionals (If Clauses)',  0,  'medium', 7),
  ('ydt_prepositions',  'ydt_ingilizce', 'Dilbilgisi: Prepositions',               0,  'medium', 8),
  ('ydt_cloze',         'ydt_ingilizce', 'Cloze Test',                             0,  'high',   9),
  ('ydt_cumle_tamamla', 'ydt_ingilizce', 'Cümle Tamamlama',                        0,  'high',  10),
  ('ydt_ceviri_en_tr',  'ydt_ingilizce', 'Çeviri: İngilizce → Türkçe',             0,  'medium',11),
  ('ydt_ceviri_tr_en',  'ydt_ingilizce', 'Çeviri: Türkçe → İngilizce',             0,  'medium',12),
  ('ydt_paragraf',      'ydt_ingilizce', 'Paragraf Soruları (Reading)',            0,  'high',  13),
  ('ydt_diyalog',       'ydt_ingilizce', 'Diyalog Tamamlama',                      0,  'medium',14),
  ('ydt_restatement',   'ydt_ingilizce', 'Anlamca En Yakın Cümle (Restatement)',   0,  'medium',15),
  ('ydt_anlam_butun',   'ydt_ingilizce', 'Paragrafta Anlam Bütünlüğü',             0,  'low',   16),
  ('ydt_durum_ifade',   'ydt_ingilizce', 'Verilen Durumda Söylenecek İfade',       0,  'low',   17)
on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name,
  grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
