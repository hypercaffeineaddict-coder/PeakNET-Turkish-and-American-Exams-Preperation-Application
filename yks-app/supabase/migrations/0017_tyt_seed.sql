-- ============================================================
-- 0017: TYT müfredatı (fresh-DB güvenliği)
--
-- PeakNET'in canlı veritabanında TYT konuları zaten ELLE seed'lenmişti
-- (memory: 38 konu, 'tyt_*' id prefiksiyle). Bu migration TEMİZ kurulumlar
-- için TYT'yi commit'li hâle getirir.
--
-- GUARD: Eğer veritabanında zaten herhangi bir 'tyt_%' id'li konu varsa
-- (yani live durumdaysa), migration komple ATLANIR. Çift kayıt riski yok.
-- ============================================================

do $tyt$
declare
  has_tyt boolean;
begin
  select exists(
    select 1 from public.topics where id like 'tyt\_%' escape '\'
  ) into has_tyt;
  if has_tyt then
    raise notice 'TYT topics already present, skipping 0017 seed.';
    return;
  end if;

  -- Dersler (4 ana ders, exam_type=TYT, tüm öğrenciler)
  insert into public.subjects (id, name, color, question_count, display_order, exam_type, tracks) values
    ('tyt_turkce',    'TYT Türkçe',           '#f59e0b', 40, 100, 'TYT', '{}'),
    ('tyt_matematik', 'TYT Temel Matematik',  '#3b82f6', 40, 101, 'TYT', '{}'),
    ('tyt_sosyal',    'TYT Sosyal Bilimler',  '#06b6d4', 20, 102, 'TYT', '{}'),
    ('tyt_fen',       'TYT Fen Bilimleri',    '#84cc16', 20, 103, 'TYT', '{}')
  on conflict (id) do update set
    name = excluded.name, color = excluded.color,
    question_count = excluded.question_count,
    display_order = excluded.display_order,
    exam_type = excluded.exam_type, tracks = excluded.tracks;

  -- Konular: TYT Türkçe (13)
  insert into public.topics (id, subject_id, name, grade, priority, display_order) values
    ('tyt_tr_sozcukte_anlam',     'tyt_turkce', 'Sözcükte Anlam',                   9,  'high',   0),
    ('tyt_tr_cumlede_anlam',      'tyt_turkce', 'Cümlede Anlam',                    9,  'high',   1),
    ('tyt_tr_paragraf',           'tyt_turkce', 'Paragraf',                         10, 'high',   2),
    ('tyt_tr_anlatim_bozuklugu',  'tyt_turkce', 'Anlatım Bozukluğu',                11, 'high',   3),
    ('tyt_tr_yazim_kurallari',    'tyt_turkce', 'Yazım Kuralları',                  9,  'medium', 4),
    ('tyt_tr_noktalama',          'tyt_turkce', 'Noktalama İşaretleri',             9,  'medium', 5),
    ('tyt_tr_ses_bilgisi',        'tyt_turkce', 'Ses Bilgisi',                      9,  'medium', 6),
    ('tyt_tr_yapi_bilgisi',       'tyt_turkce', 'Sözcükte Yapı',                    10, 'medium', 7),
    ('tyt_tr_sozcuk_turleri',     'tyt_turkce', 'Sözcük Türleri',                   10, 'high',   8),
    ('tyt_tr_cumlenin_ogeleri',   'tyt_turkce', 'Cümlenin Ögeleri',                 10, 'medium', 9),
    ('tyt_tr_fiilde_cati',        'tyt_turkce', 'Fiilde Çatı',                      11, 'medium', 10),
    ('tyt_tr_fiilde_kip_kisi',    'tyt_turkce', 'Fiilde Kip ve Kişi',               10, 'medium', 11),
    ('tyt_tr_cumle_turleri',      'tyt_turkce', 'Cümle Türleri',                    11, 'low',    12)
  on conflict (id) do nothing;

  -- Konular: TYT Temel Matematik (22)
  insert into public.topics (id, subject_id, name, grade, priority, display_order) values
    ('tyt_mat_temel_kavramlar',   'tyt_matematik', 'Temel Kavramlar',                9,  'high',   0),
    ('tyt_mat_sayilar',           'tyt_matematik', 'Sayı Kümeleri (D, T, Q, R)',     9,  'high',   1),
    ('tyt_mat_bolme_bolunebilme', 'tyt_matematik', 'Bölme - Bölünebilme',            9,  'high',   2),
    ('tyt_mat_obeb_okek',         'tyt_matematik', 'OBEB - OKEK',                    9,  'medium', 3),
    ('tyt_mat_rasyonel',          'tyt_matematik', 'Rasyonel Sayılar',               9,  'medium', 4),
    ('tyt_mat_mutlak_deger',      'tyt_matematik', 'Mutlak Değer',                   9,  'medium', 5),
    ('tyt_mat_uslu_sayilar',      'tyt_matematik', 'Üslü Sayılar',                   9,  'high',   6),
    ('tyt_mat_koklu_sayilar',     'tyt_matematik', 'Köklü Sayılar',                  9,  'high',   7),
    ('tyt_mat_carpanlara_ayirma', 'tyt_matematik', 'Çarpanlara Ayırma',              10, 'high',   8),
    ('tyt_mat_oran_oranti',       'tyt_matematik', 'Oran - Orantı',                  10, 'high',   9),
    ('tyt_mat_denklem_esitsizlik','tyt_matematik', '1. Derece Denklem ve Eşitsizlikler', 9,  'high',   10),
    ('tyt_mat_problemler',        'tyt_matematik', 'Sayı, Yaş, İşçi, Hız, Karışım Problemleri', 10, 'high',   11),
    ('tyt_mat_kumeler',           'tyt_matematik', 'Kümeler',                        9,  'medium', 12),
    ('tyt_mat_fonksiyon_temel',   'tyt_matematik', 'Fonksiyonlar (Temel)',           10, 'medium', 13),
    ('tyt_mat_permutasyon',       'tyt_matematik', 'Permütasyon - Kombinasyon',      10, 'medium', 14),
    ('tyt_mat_olasilik',          'tyt_matematik', 'Olasılık',                       10, 'medium', 15),
    ('tyt_mat_geometri_temel',    'tyt_matematik', 'Temel Geometri (Açılar, Doğrular)', 9,  'medium', 16),
    ('tyt_mat_ucgenler',          'tyt_matematik', 'Üçgenler',                       9,  'high',   17),
    ('tyt_mat_cokgenler',         'tyt_matematik', 'Çokgenler ve Dörtgenler',        10, 'medium', 18),
    ('tyt_mat_cember_daire',      'tyt_matematik', 'Çember ve Daire',                10, 'medium', 19),
    ('tyt_mat_kati_cisimler',     'tyt_matematik', 'Katı Cisimler',                  10, 'low',    20),
    ('tyt_mat_analitik',          'tyt_matematik', 'Analitik Geometri (Temel)',      11, 'low',    21)
  on conflict (id) do nothing;

  -- Konular: TYT Sosyal Bilimler (20: 5 tarih + 5 coğrafya + 5 felsefe + 5 din)
  insert into public.topics (id, subject_id, name, grade, priority, display_order) values
    -- Tarih
    ('tyt_sos_tarih_ilkcag',          'tyt_sosyal', 'İlk Çağ Uygarlıkları ve Türk Tarihine Giriş', 9, 'medium', 0),
    ('tyt_sos_tarih_turk_islam',      'tyt_sosyal', 'İlk Türk-İslam Devletleri',                   10, 'medium', 1),
    ('tyt_sos_tarih_osmanli_kurulus', 'tyt_sosyal', 'Osmanlı Kuruluş ve Yükselme',                 10, 'high',   2),
    ('tyt_sos_tarih_osmanli_duraklama','tyt_sosyal','Osmanlı Duraklama, Gerileme, Dağılma',        11, 'medium', 3),
    ('tyt_sos_tarih_kurtulus',        'tyt_sosyal', 'Milli Mücadele ve Cumhuriyet',                12, 'high',   4),
    -- Coğrafya
    ('tyt_sos_cog_dunya_evren',       'tyt_sosyal', 'Doğa ve İnsan, Dünya''nın Şekli ve Hareketleri', 9, 'medium', 5),
    ('tyt_sos_cog_iklim',             'tyt_sosyal', 'İklim Bilgisi',                                9,  'medium', 6),
    ('tyt_sos_cog_yerlesim',          'tyt_sosyal', 'Yerleşim, Nüfus, Göç',                         10, 'medium', 7),
    ('tyt_sos_cog_ekonomi',           'tyt_sosyal', 'Ekonomik Faaliyetler ve Ulaşım',               11, 'medium', 8),
    ('tyt_sos_cog_turkiye',           'tyt_sosyal', 'Türkiye''nin Coğrafi Konumu ve Bölgeleri',     10, 'high',   9),
    -- Felsefe
    ('tyt_sos_fel_giris',             'tyt_sosyal', 'Felsefeyi Tanıma',                             10, 'medium', 10),
    ('tyt_sos_fel_bilgi',             'tyt_sosyal', 'Bilgi Felsefesi',                              10, 'medium', 11),
    ('tyt_sos_fel_varlik',            'tyt_sosyal', 'Varlık Felsefesi',                             11, 'medium', 12),
    ('tyt_sos_fel_ahlak',             'tyt_sosyal', 'Ahlak Felsefesi',                              11, 'medium', 13),
    ('tyt_sos_fel_din_sanat',         'tyt_sosyal', 'Din ve Sanat Felsefesi',                       11, 'low',    14),
    -- Din Kültürü
    ('tyt_sos_din_inanc',             'tyt_sosyal', 'İnanç',                                        9,  'medium', 15),
    ('tyt_sos_din_ibadet',            'tyt_sosyal', 'İbadet',                                       9,  'medium', 16),
    ('tyt_sos_din_ahlak',             'tyt_sosyal', 'Ahlak',                                        10, 'medium', 17),
    ('tyt_sos_din_muhammed',          'tyt_sosyal', 'Hz. Muhammed''in Hayatı',                       10, 'medium', 18),
    ('tyt_sos_din_dunya_dinleri',     'tyt_sosyal', 'Dünya Dinleri',                                11, 'low',    19)
  on conflict (id) do nothing;

  -- Konular: TYT Fen Bilimleri (20: 7 fizik + 7 kimya + 6 biyoloji)
  insert into public.topics (id, subject_id, name, grade, priority, display_order) values
    -- Fizik
    ('tyt_fen_fiz_madde',          'tyt_fen', 'Fizik: Madde ve Özellikleri',     9,  'medium', 0),
    ('tyt_fen_fiz_isi_sicaklik',   'tyt_fen', 'Fizik: Isı ve Sıcaklık',          9,  'medium', 1),
    ('tyt_fen_fiz_hareket_kuvvet', 'tyt_fen', 'Fizik: Hareket ve Kuvvet',        9,  'high',   2),
    ('tyt_fen_fiz_enerji',         'tyt_fen', 'Fizik: İş, Güç ve Enerji',        10, 'high',   3),
    ('tyt_fen_fiz_elektrik',       'tyt_fen', 'Fizik: Elektrostatik ve Elektrik Akımı', 10, 'medium', 4),
    ('tyt_fen_fiz_dalga_optik',    'tyt_fen', 'Fizik: Dalgalar ve Optik',        10, 'medium', 5),
    ('tyt_fen_fiz_basinc',         'tyt_fen', 'Fizik: Basınç ve Kaldırma Kuvveti', 10, 'medium', 6),
    -- Kimya
    ('tyt_fen_kim_temel_kavramlar','tyt_fen', 'Kimya: Temel Kavramlar',          9,  'medium', 7),
    ('tyt_fen_kim_atom_periyodik', 'tyt_fen', 'Kimya: Atom ve Periyodik Sistem', 9,  'high',   8),
    ('tyt_fen_kim_baglar',         'tyt_fen', 'Kimya: Kimyasal Türler Arası Etkileşimler', 9, 'medium', 9),
    ('tyt_fen_kim_madde_halleri',  'tyt_fen', 'Kimya: Maddenin Halleri',         10, 'medium', 10),
    ('tyt_fen_kim_karisimlar',     'tyt_fen', 'Kimya: Karışımlar',               10, 'medium', 11),
    ('tyt_fen_kim_asit_baz',       'tyt_fen', 'Kimya: Asitler, Bazlar, Tuzlar',  10, 'high',   12),
    ('tyt_fen_kim_kimya_endustri', 'tyt_fen', 'Kimya ve Endüstri (Çevre)',       11, 'low',    13),
    -- Biyoloji
    ('tyt_fen_biy_yasam',          'tyt_fen', 'Biyoloji: Canlıların Ortak Özellikleri', 9, 'medium', 14),
    ('tyt_fen_biy_hucre',          'tyt_fen', 'Biyoloji: Hücre',                 9,  'high',   15),
    ('tyt_fen_biy_aleminin',       'tyt_fen', 'Biyoloji: Canlılar Âleminin Sınıflandırılması', 9, 'medium', 16),
    ('tyt_fen_biy_uretim',         'tyt_fen', 'Biyoloji: Üreme, Solunum',        10, 'medium', 17),
    ('tyt_fen_biy_kalitim',        'tyt_fen', 'Biyoloji: Kalıtım',               10, 'high',   18),
    ('tyt_fen_biy_ekosistem',      'tyt_fen', 'Biyoloji: Ekosistem',             10, 'medium', 19)
  on conflict (id) do nothing;

  raise notice '0017: TYT seed inserted (4 subjects, 75 topics).';
end $tyt$;
