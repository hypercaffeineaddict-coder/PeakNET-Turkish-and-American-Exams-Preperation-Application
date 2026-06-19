-- ============================================================
-- Genel müfredat: AYT TM/Sözel dersleri + track filtreleme.
--
-- ÖNEMLİ: Canlı DB'de TYT müfredatı (tyt_turkce/tyt_matematik/tyt_sosyal/tyt_fen
-- ve tyt_tr_*/tyt_mat_*/tyt_sos_*/tyt_fen_* konuları) ZATEN var (önceki oturumda
-- elle seed'lenmiş, farklı topic id'leriyle). Bu yüzden bu migration TYT
-- KONULARINI YENİDEN EKLEMEZ (çift kayıt olmasın) — sadece track'lerini ayarlar.
-- Yeni eklenen: AYT TM/Sözel dersleri ve konuları + subjects.tracks kolonu.
--
-- Sıfırdan kurulumda TYT müfredatı için ayrı bir seed gerekir (canlı TYT seed'i
-- henüz commit'li migration'a aktarılmadı — bilinen drift).
--
-- Supabase SQL Editor'da çalıştır. Idempotent.
-- ============================================================

begin;

-- Track ilişkisi: bu ders hangi lise bölümleri için geçerli (AYT filtreleme).
-- TYT dersleri tüm track'lere açıktır.
alter table public.subjects add column if not exists tracks text[] default '{}';

-- Mevcut AYT (Sayısal) derslerinin track'leri
update public.subjects set tracks = '{MF,TM}'::text[] where id = 'matematik';
update public.subjects set tracks = '{MF}'::text[]    where id in ('fizik','kimya','biyoloji');

-- Mevcut TYT derslerini tüm track'lere aç (canlıda zaten varlar)
update public.subjects
  set tracks = '{MF,TM,Sozel,Dil}'::text[]
  where id in ('tyt_turkce','tyt_matematik','tyt_sosyal','tyt_fen');

-- ---------- AYT TM / SÖZEL DERSLERİ (yeni) ----------
insert into public.subjects (id, name, color, question_count, display_order, exam_type, tracks) values
  ('edebiyat',  'Türk Dili ve Edebiyatı', '#ec4899', 24, 4, 'AYT', '{TM,Sozel}'),
  ('tarih1',    'Tarih-1',                '#f97316', 10, 5, 'AYT', '{TM,Sozel}'),
  ('cografya1', 'Coğrafya-1',             '#14b8a6',  6, 6, 'AYT', '{TM,Sozel}'),
  ('tarih2',    'Tarih-2',                '#fb923c', 11, 7, 'AYT', '{Sozel}'),
  ('cografya2', 'Coğrafya-2',             '#2dd4bf', 11, 8, 'AYT', '{Sozel}'),
  ('felsefe',   'Felsefe Grubu',          '#a78bfa', 12, 9, 'AYT', '{Sozel}'),
  ('din',       'Din Kültürü',            '#fbbf24',  6,10, 'AYT', '{Sozel}')
on conflict (id) do update set
  name = excluded.name, color = excluded.color, question_count = excluded.question_count,
  display_order = excluded.display_order, exam_type = excluded.exam_type, tracks = excluded.tracks;

-- AYT Edebiyat konuları
insert into public.topics (id, subject_id, name, grade, priority, display_order) values
  ('edb_siir_bilgisi',   'edebiyat', 'Şiir Bilgisi ve Ölçü',           9,  'medium', 0),
  ('edb_edebi_sanatlar', 'edebiyat', 'Edebi Sanatlar (Söz Sanatları)', 9,  'high',   1),
  ('edb_islamiyet_oncesi','edebiyat','İslamiyet Öncesi ve Geçiş Dönemi',10,'medium', 2),
  ('edb_divan',          'edebiyat', 'Divan Edebiyatı',                11, 'high',   3),
  ('edb_halk',           'edebiyat', 'Halk Edebiyatı',                 11, 'high',   4),
  ('edb_tanzimat',       'edebiyat', 'Tanzimat Edebiyatı',             11, 'high',   5),
  ('edb_servetifunun',   'edebiyat', 'Servet-i Fünun ve Fecr-i Ati',   11, 'medium', 6),
  ('edb_milli',          'edebiyat', 'Milli Edebiyat',                 12, 'high',   7),
  ('edb_cumhuriyet',     'edebiyat', 'Cumhuriyet Dönemi Edebiyatı',    12, 'high',   8),
  ('edb_turler',         'edebiyat', 'Roman, Hikaye ve Tiyatro',       12, 'medium', 9),
  ('edb_dunya',          'edebiyat', 'Dünya Edebiyatı ve Akımlar',     12, 'low',   10)
on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name,
  grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;

-- AYT Tarih-1 konuları
insert into public.topics (id, subject_id, name, grade, priority, display_order) values
  ('th1_tarih_zaman',    'tarih1', 'Tarih ve Zaman',                    9,  'medium', 0),
  ('th1_ilk_donemler',   'tarih1', 'İnsanlığın İlk Dönemleri',          9,  'medium', 1),
  ('th1_orta_cag',       'tarih1', 'Orta Çağda Dünya',                  9,  'low',    2),
  ('th1_ilk_turk',       'tarih1', 'İlk ve Orta Çağlarda Türk Dünyası', 9,  'high',   3),
  ('th1_islam',          'tarih1', 'İslam Medeniyetinin Doğuşu',        9,  'medium', 4),
  ('th1_turk_islam',     'tarih1', 'Türklerin İslamiyeti Kabulü',       9,  'high',   5),
  ('th1_yerlesme',       'tarih1', 'Yerleşme ve Devletleşme',           10, 'medium', 6),
  ('th1_osmanli_kurulus','tarih1', 'Beylikten Devlete Osmanlı',         10, 'high',   7)
on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name,
  grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;

-- AYT Coğrafya-1 konuları
insert into public.topics (id, subject_id, name, grade, priority, display_order) values
  ('cg1_ekosistem',   'cografya1', 'Ekosistem ve Biyoçeşitlilik',    11, 'high',   0),
  ('cg1_nufus',       'cografya1', 'Nüfus Politikaları',             11, 'medium', 1),
  ('cg1_sehirler',    'cografya1', 'Şehirler ve Fonksiyonları',      11, 'medium', 2),
  ('cg1_ekonomi',     'cografya1', 'Ekonomik Faaliyetler',           11, 'high',   3),
  ('cg1_bolgeler',    'cografya1', 'Bölgeler ve Ülkeler',            11, 'medium', 4),
  ('cg1_ulasim',      'cografya1', 'Uluslararası Ulaşım Hatları',    11, 'low',    5),
  ('cg1_afetler',     'cografya1', 'Doğal Afetler',                  11, 'medium', 6)
on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name,
  grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;

-- AYT Tarih-2 konuları
insert into public.topics (id, subject_id, name, grade, priority, display_order) values
  ('th2_degisen_dunya', 'tarih2', 'Değişen Dünya Dengeleri',          11, 'medium', 0),
  ('th2_osmanli_degisim','tarih2','Osmanlıda Değişim ve Devrimler Çağı',11,'high',  1),
  ('th2_sermaye_emek',  'tarih2', 'Sermaye ve Emek',                  11, 'low',    2),
  ('th2_20yy',          'tarih2', '20. Yüzyıl Başlarında Dünya',      11, 'medium', 3),
  ('th2_ataturkculuk',  'tarih2', 'Atatürkçülük ve Türk İnkılabı',    12, 'high',   4),
  ('th2_2dunya',        'tarih2', 'II. Dünya Savaşı',                 12, 'medium', 5),
  ('th2_soguk_savas',   'tarih2', 'Soğuk Savaş Dönemi',               12, 'medium', 6),
  ('th2_kuresellesme',  'tarih2', 'Küreselleşen Dünya',               12, 'low',    7)
on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name,
  grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;

-- AYT Coğrafya-2 konuları
insert into public.topics (id, subject_id, name, grade, priority, display_order) values
  ('cg2_biyocesitlilik', 'cografya2', 'Biyoçeşitlilik ve Ekstrem Olaylar', 12, 'medium', 0),
  ('cg2_nufus_yerlesme', 'cografya2', 'Nüfus ve Yerleşme Dokusu',          12, 'medium', 1),
  ('cg2_ekonomi_bolge',  'cografya2', 'Ekonomik Faaliyet Bölgeleri',       12, 'high',   2),
  ('cg2_hizmet',         'cografya2', 'Hizmet Sektörü ve Ticaret',         12, 'medium', 3),
  ('cg2_kuresel_ticaret','cografya2', 'Küresel Ticaret ve Ulaşım',         12, 'medium', 4),
  ('cg2_bolgesel',       'cografya2', 'Bölgesel Kalkınma',                 12, 'low',    5),
  ('cg2_cevre',          'cografya2', 'Çevre Sorunları ve Yönetimi',       12, 'medium', 6)
on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name,
  grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;

-- AYT Felsefe Grubu konuları (Felsefe + Psikoloji + Sosyoloji + Mantık)
insert into public.topics (id, subject_id, name, grade, priority, display_order) values
  ('fel_ilkcag',     'felsefe', 'Felsefe: İlk Çağ (MÖ 6 - MS 2)',     11, 'medium', 0),
  ('fel_ortacag',    'felsefe', 'Felsefe: MS 2 - 15. Yüzyıl',          11, 'medium', 1),
  ('fel_15_17',      'felsefe', 'Felsefe: 15 - 17. Yüzyıl',            11, 'medium', 2),
  ('fel_18_19',      'felsefe', 'Felsefe: 18 - 19. Yüzyıl',            11, 'medium', 3),
  ('fel_20yy',       'felsefe', 'Felsefe: 20. Yüzyıl',                 12, 'medium', 4),
  ('fel_psikoloji',  'felsefe', 'Psikoloji',                          11, 'high',   5),
  ('fel_sosyoloji',  'felsefe', 'Sosyoloji',                          11, 'high',   6),
  ('fel_mantik',     'felsefe', 'Mantık',                             11, 'high',   7)
on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name,
  grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;

-- AYT Din Kültürü konuları
insert into public.topics (id, subject_id, name, grade, priority, display_order) values
  ('ayt_din_inanc',     'din', 'İnanç',                       11, 'medium', 0),
  ('ayt_din_ibadet',    'din', 'İbadet',                      11, 'medium', 1),
  ('ayt_din_ahlak',     'din', 'Ahlak ve Değerler',           11, 'medium', 2),
  ('ayt_din_muhammed',  'din', 'Hz. Muhammedin Hayatı',       12, 'medium', 3),
  ('ayt_din_vahiy_akil','din', 'Vahiy ve Akıl',               12, 'low',    4),
  ('ayt_din_dunya',     'din', 'Dünya Dinleri',               12, 'low',    5)
on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name,
  grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;

commit;
