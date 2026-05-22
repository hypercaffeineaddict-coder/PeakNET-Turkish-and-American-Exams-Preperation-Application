-- ============================================================
-- Genel müfredat: TYT (herkes) + AYT TM/Sözel dersleri ve konuları.
-- subjects.tracks ile AYT dersleri lise bölümüne (track) göre filtrelenir.
-- Kaynak: ÖSYM/MEB resmi müfredat konu başlıkları (kamuya açık olgusal bilgi).
-- Supabase SQL Editor'da çalıştır. Idempotent (ON CONFLICT DO UPDATE).
-- ============================================================

begin;

-- Track ilişkisi: bu ders hangi lise bölümleri için geçerli (AYT filtreleme).
-- TYT dersleri tüm track'lere açıktır; boş dizi = herkese görünür.
alter table public.subjects add column if not exists tracks text[] default '{}';

-- Mevcut AYT (Sayısal) derslerinin track'lerini ayarla
update public.subjects set tracks = '{MF,TM}'::text[] where id = 'matematik';
update public.subjects set tracks = '{MF}'::text[]    where id in ('fizik','kimya','biyoloji');

-- ---------- TYT DERSLERİ (exam_type = TYT, tüm track'ler) ----------
insert into public.subjects (id, name, color, question_count, display_order, exam_type, tracks) values
  ('tyt_turkce',    'Türkçe',           '#f59e0b', 40, 0, 'TYT', '{MF,TM,Sozel,Dil}'),
  ('tyt_matematik', 'Temel Matematik',  '#3b82f6', 40, 1, 'TYT', '{MF,TM,Sozel,Dil}'),
  ('tyt_sosyal',    'Sosyal Bilimler',  '#06b6d4', 20, 2, 'TYT', '{MF,TM,Sozel,Dil}'),
  ('tyt_fen',       'Fen Bilimleri',    '#84cc16', 20, 3, 'TYT', '{MF,TM,Sozel,Dil}')
on conflict (id) do update set
  name = excluded.name, color = excluded.color, question_count = excluded.question_count,
  display_order = excluded.display_order, exam_type = excluded.exam_type, tracks = excluded.tracks;

-- TYT Türkçe konuları
insert into public.topics (id, subject_id, name, grade, priority, display_order) values
  ('tyt_trk_sozcukte_anlam',  'tyt_turkce', 'Sözcükte Anlam',          0, 'high',   0),
  ('tyt_trk_cumlede_anlam',   'tyt_turkce', 'Cümlede Anlam',           0, 'high',   1),
  ('tyt_trk_paragraf',        'tyt_turkce', 'Paragraf',                0, 'high',   2),
  ('tyt_trk_ses_bilgisi',     'tyt_turkce', 'Ses Bilgisi',             0, 'medium', 3),
  ('tyt_trk_yazim',           'tyt_turkce', 'Yazım Kuralları',         0, 'high',   4),
  ('tyt_trk_noktalama',       'tyt_turkce', 'Noktalama İşaretleri',    0, 'high',   5),
  ('tyt_trk_sozcuk_turleri',  'tyt_turkce', 'Sözcük Türleri',          0, 'medium', 6),
  ('tyt_trk_fiiller',         'tyt_turkce', 'Fiiller ve Fiilimsiler',  0, 'medium', 7),
  ('tyt_trk_cumlenin_ogeleri','tyt_turkce', 'Cümlenin Ögeleri',        0, 'medium', 8),
  ('tyt_trk_cumle_turleri',   'tyt_turkce', 'Cümle Türleri',           0, 'low',    9),
  ('tyt_trk_anlatim_bozuklugu','tyt_turkce','Anlatım Bozuklukları',    0, 'high',  10)
on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name,
  grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;

-- TYT Temel Matematik konuları
insert into public.topics (id, subject_id, name, grade, priority, display_order) values
  ('tyt_mat_temel_kavram',  'tyt_matematik', 'Temel Kavramlar',           9,  'high',   0),
  ('tyt_mat_bolme',         'tyt_matematik', 'Bölme ve Bölünebilme',      9,  'high',   1),
  ('tyt_mat_ebob_ekok',     'tyt_matematik', 'EBOB - EKOK',               9,  'medium', 2),
  ('tyt_mat_rasyonel',      'tyt_matematik', 'Rasyonel Sayılar',          9,  'medium', 3),
  ('tyt_mat_uslu_koklu',    'tyt_matematik', 'Üslü ve Köklü Sayılar',     9,  'high',   4),
  ('tyt_mat_carpanlara',    'tyt_matematik', 'Çarpanlara Ayırma',         9,  'high',   5),
  ('tyt_mat_oran_oranti',   'tyt_matematik', 'Oran - Orantı',             9,  'high',   6),
  ('tyt_mat_denklem',       'tyt_matematik', 'Denklem Çözme',             9,  'high',   7),
  ('tyt_mat_problemler',    'tyt_matematik', 'Problemler',                10, 'high',   8),
  ('tyt_mat_kumeler',       'tyt_matematik', 'Kümeler',                   9,  'medium', 9),
  ('tyt_mat_fonksiyon',     'tyt_matematik', 'Fonksiyonlar',              10, 'medium',10),
  ('tyt_mat_permutasyon',   'tyt_matematik', 'Permütasyon - Kombinasyon', 10,'medium',11),
  ('tyt_mat_olasilik',      'tyt_matematik', 'Olasılık',                  10, 'medium',12),
  ('tyt_mat_istatistik',    'tyt_matematik', 'Veri ve İstatistik',        10, 'low',   13),
  ('tyt_mat_geometri_aci',  'tyt_matematik', 'Geometri: Açılar ve Üçgenler', 9, 'high',14),
  ('tyt_mat_geometri_dortgen','tyt_matematik','Geometri: Dörtgenler ve Çember', 10,'medium',15),
  ('tyt_mat_geometri_kati', 'tyt_matematik', 'Geometri: Katı Cisimler',   10, 'low',   16),
  ('tyt_mat_geometri_analitik','tyt_matematik','Geometri: Analitik',      11, 'medium',17)
on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name,
  grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;

-- TYT Sosyal Bilimler konuları (Tarih + Coğrafya + Felsefe + Din)
insert into public.topics (id, subject_id, name, grade, priority, display_order) values
  ('tyt_sos_tarih_bilimi',   'tyt_sosyal', 'Tarih: Tarih Bilimi ve İlk Uygarlıklar', 9,  'medium', 0),
  ('tyt_sos_ilk_turk',       'tyt_sosyal', 'Tarih: İlk Türk Devletleri',             9,  'medium', 1),
  ('tyt_sos_islam_tarihi',   'tyt_sosyal', 'Tarih: İslam Tarihi ve Türk-İslam Devletleri', 9, 'medium', 2),
  ('tyt_sos_osmanli',        'tyt_sosyal', 'Tarih: Osmanlı Tarihi',                  10, 'high',   3),
  ('tyt_sos_inkilap',        'tyt_sosyal', 'Tarih: Kurtuluş Savaşı ve İnkılaplar',   12, 'high',   4),
  ('tyt_sos_cog_doga_insan', 'tyt_sosyal', 'Coğrafya: Doğa ve İnsan, Harita Bilgisi', 9, 'high',   5),
  ('tyt_sos_cog_iklim',      'tyt_sosyal', 'Coğrafya: İklim ve Yer Şekilleri',       9,  'high',   6),
  ('tyt_sos_cog_turkiye',    'tyt_sosyal', 'Coğrafya: Türkiyenin Konumu ve Nüfus',   10, 'medium', 7),
  ('tyt_sos_cog_ekonomi',    'tyt_sosyal', 'Coğrafya: Ekonomik Faaliyetler',         10, 'medium', 8),
  ('tyt_sos_felsefe',        'tyt_sosyal', 'Felsefe: Giriş, Bilgi ve Varlık',        11, 'medium', 9),
  ('tyt_sos_felsefe2',       'tyt_sosyal', 'Felsefe: Ahlak, Bilim ve Sanat',         11, 'low',   10),
  ('tyt_sos_din',            'tyt_sosyal', 'Din Kültürü: İnanç, İbadet ve Ahlak',    9,  'medium',11)
on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name,
  grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;

-- TYT Fen Bilimleri konuları (Fizik + Kimya + Biyoloji)
insert into public.topics (id, subject_id, name, grade, priority, display_order) values
  ('tyt_fen_fiz_giris',     'tyt_fen', 'Fizik: Fizik Bilimine Giriş ve Madde',     9,  'medium', 0),
  ('tyt_fen_fiz_hareket',   'tyt_fen', 'Fizik: Hareket, Kuvvet ve Enerji',         9,  'high',   1),
  ('tyt_fen_fiz_isi',       'tyt_fen', 'Fizik: Isı ve Sıcaklık',                   9,  'medium', 2),
  ('tyt_fen_fiz_elektrik',  'tyt_fen', 'Fizik: Elektrostatik ve Elektrik',         10, 'medium', 3),
  ('tyt_fen_fiz_optik',     'tyt_fen', 'Fizik: Optik, Dalgalar ve Basınç',         10, 'medium', 4),
  ('tyt_fen_kim_atom',      'tyt_fen', 'Kimya: Atom ve Periyodik Sistem',          9,  'high',   5),
  ('tyt_fen_kim_etkilesim', 'tyt_fen', 'Kimya: Kimyasal Türler Arası Etkileşim',   10, 'medium', 6),
  ('tyt_fen_kim_karisim',   'tyt_fen', 'Kimya: Maddenin Halleri ve Karışımlar',    10, 'medium', 7),
  ('tyt_fen_kim_asit_baz',  'tyt_fen', 'Kimya: Asit-Baz-Tuz ve Kimya Her Yerde',   10, 'medium', 8),
  ('tyt_fen_biy_hucre',     'tyt_fen', 'Biyoloji: Canlılar ve Hücre',              9,  'high',   9),
  ('tyt_fen_biy_siniflandirma','tyt_fen','Biyoloji: Sınıflandırma ve Hücre Bölünmesi', 9, 'medium',10),
  ('tyt_fen_biy_kalitim',   'tyt_fen', 'Biyoloji: Kalıtım ve Ekosistem',           10, 'medium',11)
on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name,
  grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;

-- ---------- AYT TM / SÖZEL DERSLERİ ----------
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
