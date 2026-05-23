-- ============================================================
-- PeakNET — BEKLEYEN TÜM MIGRATION'LAR (0007 → 0013)
-- Supabase SQL Editor'a TAMAMINI yapıştır, bir kez 'Run' de.
-- Hepsi idempotent (tekrar çalıştırmak güvenli).
-- ============================================================


-- ===================== migrations/0007_schema_codify.sql =====================

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


-- ===================== migrations/0008_genel_mufredat.sql =====================

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


-- ===================== migrations/0009_flashcards.sql =====================

-- ============================================================
-- Tekrar kartları (flashcards) — Anki tarzı aralıklı tekrar (SM-2).
-- Supabase SQL Editor'da çalıştır. Idempotent.
-- ============================================================

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text references public.topics(id) on delete set null,
  subject_name text,
  topic_name text,
  front text not null,           -- ön yüz (soru/kavram)
  back text not null,            -- arka yüz (cevap/açıklama)
  ease real default 2.5,         -- SM-2 kolaylık faktörü
  interval_days int default 0,   -- mevcut tekrar aralığı
  repetitions int default 0,     -- ardışık doğru tekrar sayısı
  next_review_at date default current_date,
  created_at timestamptz default now()
);

create index if not exists flashcards_user_due_idx
  on public.flashcards (user_id, next_review_at);

alter table public.flashcards enable row level security;

do $do$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'flashcards' and policyname = 'own flashcards'
  ) then
    create policy "own flashcards" on public.flashcards for all
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $do$;


-- ===================== migrations/0010_builtin_questions.sql =====================

-- ============================================================
-- Built-in (hazır) sorular — her konu için AI üretimi ÖZGÜN sorular.
-- Genel içerik: herkes okur, kimse yazamaz (seed migration ile dolar).
-- TELİF: İçerik AI üretimi özgün sorulardır; ÖSYM/MEB sorusu KOPYALANMAZ.
-- Supabase SQL Editor'da çalıştır. Idempotent.
-- ============================================================

create table if not exists public.builtin_questions (
  topic_id text primary key references public.topics(id) on delete cascade,
  subject_name text,
  topic_name text,
  questions jsonb not null,  -- [{stem, options:{A..E}, answer, explanation}]
  created_at timestamptz default now()
);

alter table public.builtin_questions enable row level security;

do $do$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'builtin_questions' and policyname = 'public read builtin'
  ) then
    create policy "public read builtin" on public.builtin_questions for select using (true);
  end if;
end $do$;


-- ===================== migrations/0011_builtin_seed.sql =====================

-- ============================================================
-- Built-in (hazır) test seed — AI üretimi ÖZGÜN sorular (telif yok).
-- ÖNCE 0010_builtin_questions.sql çalıştırılmalı.
-- Demo: 4 popüler konu (~5'er soru). Daha fazlası ileride eklenebilir.
-- Idempotent (on conflict do update).
-- ============================================================

insert into public.builtin_questions (topic_id, subject_name, topic_name, questions) values ('mat_polinomlar', 'Matematik', 'Polinomlar', $q$[{"stem":"P(x) = (m-3)x^4 + (n+2)x^3 + (k-1)x^2 + 5x + 7 ifadesi birinci dereceden bir polinom olduğuna göre, m+n+k toplamı kaçtır?","options":{"A":"0","B":"1","C":"2","D":"3","E":"4"},"answer":"C","explanation":"Birinci dereceden bir polinomda x'in en yüksek kuvveti 1 olmalıdır. Bu durumda x^4, x^3 ve x^2 terimlerinin katsayıları sıfır olmalıdır. Yani m-3=0, n+2=0 ve k-1=0 olmalıdır. Buradan m=3, n=-2, k=1 bulunur. Toplamları 3 + (-2) + 1 = 2'dir."},{"stem":"P(x) bir polinom olmak üzere, P(x-1) = x^2 - 3x + 4 olduğuna göre, P(2) kaçtır?","options":{"A":"2","B":"4","C":"6","D":"8","E":"10"},"answer":"B","explanation":"P(2) değerini bulmak için P(x-1) ifadesinde x-1'i 2'ye eşitlemeliyiz. x-1=2 ise x=3 olur. Bu x değerini P(x-1) ifadesinde yerine yazarsak P(2) = 3^2 - 3(3) + 4 = 9 - 9 + 4 = 4 bulunur."},{"stem":"P(x) = x^3 - 2x^2 + ax - 3 polinomunun x-1 ile bölümünden kalan 1 olduğuna göre, a kaçtır?","options":{"A":"1","B":"2","C":"3","D":"4","E":"5"},"answer":"E","explanation":"Bir P(x) polinomunun x-k ile bölümünden kalan P(k)'dır. x-1 ile bölümünden kalan 1 ise P(1)=1 olmalıdır. P(1) = 1^3 - 2(1)^2 + a(1) - 3 = 1 - 2 + a - 3 = a - 4'tür. Bu ifadeyi 1'e eşitlediğimizde a-4=1, dolayısıyla a=5 bulunur."},{"stem":"P(x) polinomunun x-2 ile bölümünden kalan 3, x+1 ile bölümünden kalan -6'dır. P(x) polinomunun x^2-x-2 ile bölümünden kalan aşağıdakilerden hangisidir?","options":{"A":"3x-3","B":"3x-2","C":"3x-1","D":"2x-1","E":"2x+1"},"answer":"A","explanation":"P(x)'in x^2-x-2 = (x-2)(x+1) ile bölümünden kalan ax+b şeklindedir. P(x) = (x-2)(x+1)Q(x) + ax+b. Kalan teoremini kullanarak P(2)=3 ve P(-1)=-6 eşitliklerini kullanırız. P(2) = 2a+b = 3 ve P(-1) = -a+b = -6. Bu denklem sistemini çözdüğümüzde 3a=9'dan a=3 ve -3+b=-6'dan b=-3 bulunur. O zaman kalan 3x-3'tür."},{"stem":"P(x) = x^3 + (a-1)x^2 - (a+2)x + 2a polinomunun bir çarpanı x-2 olduğuna göre, a kaçtır?","options":{"A":"-2","B":"-1","C":"0","D":"1","E":"2"},"answer":"C","explanation":"Bir polinomun x-k çarpanı olması demek, P(k)=0 olması demektir. x-2 bir çarpan ise P(2)=0 olmalıdır. P(2) = 2^3 + (a-1)2^2 - (a+2)2 + 2a = 8 + 4a - 4 - 2a - 4 + 2a = 4a'dır. Bu ifadeyi 0'a eşitlediğimizde 4a=0, dolayısıyla a=0 bulunur."},{"stem":"P(x) = (x^2 - 2x + 1)^3 polinomunun katsayılar toplamı ile sabit teriminin çarpımı kaçtır?","options":{"A":"-1","B":"0","C":"1","D":"2","E":"4"},"answer":"B","explanation":"Bir P(x) polinomunun katsayılar toplamı P(1) ile bulunur. P(1) = (1^2 - 2(1) + 1)^3 = (1 - 2 + 1)^3 = (0)^3 = 0'dır. Sabit terim ise P(0) ile bulunur. P(0) = (0^2 - 2(0) + 1)^3 = (0 - 0 + 1)^3 = (1)^3 = 1'dir. Katsayılar toplamı ile sabit terimin çarpımı 0 * 1 = 0'dır."}]$q$::jsonb) on conflict (topic_id) do update set subject_name=excluded.subject_name, topic_name=excluded.topic_name, questions=excluded.questions;
insert into public.builtin_questions (topic_id, subject_name, topic_name, questions) values ('mat_2dereceden_denklemler', 'Matematik', '2. Dereceden Denklemler', $q$[{"stem":"x^2 - (m+1)x + 2m - 1 = 0 denkleminin kökleri x1 ve x2'dir. x1 + x2 = x1 * x2 olduğuna göre, m kaçtır?","options":{"A":"1","B":"2","C":"3","D":"4","E":"5"},"answer":"C","explanation":"Kökler toplamı -(b/a) ve kökler çarpımı c/a formülleri kullanılır. Verilen eşitliği kullanarak m+1 = 2m-1 denklemini çözdüğümüzde m=2 bulunur. Öğrenci işaret hatalarına dikkat etmelidir."},{"stem":"x^2 - 6x + k - 2 = 0 denkleminin kökleri x1 ve x2'dir. x1^2 * x2 + x1 * x2^2 = 24 olduğuna göre, k kaçtır?","options":{"A":"4","B":"5","C":"6","D":"7","E":"8"},"answer":"C","explanation":"Verilen ifade x1*x2*(x1+x2) şeklinde çarpanlara ayrılır. Kökler toplamı (x1+x2) = 6 ve kökler çarpımı (x1*x2) = k-2 formülleri yerine konularak (k-2)*6 = 24 eşitliğinden k=6 bulunur. İşlem hatası yapmamaya özen gösterilmelidir."},{"stem":"x^2 - 4x + 13 = 0 denkleminin karmaşık köklerinden biri aşağıdakilerden hangisidir?","options":{"A":"2 - 3i","B":"2 + 2i","C":"3 - 2i","D":"3 + 2i","E":"4 - i"},"answer":"A","explanation":"Denklemin diskriminantı Delta = b^2 - 4ac = (-4)^2 - 4*1*13 = 16 - 52 = -36 olarak hesaplanır. Kökler (-b ± kök(Delta)) / 2a formülüyle bulunur. Bu durumda kökler (4 ± kök(-36)) / 2 = (4 ± 6i) / 2 = 2 ± 3i olur. i^2 = -1 eşitliği unutulmamalıdır."},{"stem":"x^2 - (m-2)x + m + 1 = 0 denkleminin farklı iki reel kökü olduğuna göre, m'nin alabileceği en küçük tam sayı değeri kaçtır?","options":{"A":"-5","B":"-4","C":"-3","D":"-2","E":"-1"},"answer":"D","explanation":"Denklemin farklı iki reel kökü olması için diskriminantın (Delta) sıfırdan büyük olması gerekir. Delta = (m-2)^2 - 4(1)(m+1) > 0 eşitsizliği çözülür. m^2 - 4m + 4 - 4m - 4 > 0 => m^2 - 8m > 0 => m(m-8) > 0 olur. Bu eşitsizliğin çözüm kümesi (-sonsuz, 0) U (8, +sonsuz)'dur. m'nin alabileceği en küçük tam sayı değeri -1'dir."},{"stem":"x^4 - 10x^2 + 9 = 0 denkleminin reel köklerinin toplamı kaçtır?","options":{"A":"0","B":"2","C":"4","D":"6","E":"8"},"answer":"A","explanation":"x^2 = t değişken değiştirmesi yapılarak denklem t^2 - 10t + 9 = 0 şekline dönüştürülür. Bu denklemin kökleri (t-1)(t-9)=0'dan t1=1 ve t2=9 bulunur. x^2=1 için x=±1 ve x^2=9 için x=±3 reel kökleri elde edilir. Reel kökler -3, -1, 1, 3 olup toplamları 0'dır."}]$q$::jsonb) on conflict (topic_id) do update set subject_name=excluded.subject_name, topic_name=excluded.topic_name, questions=excluded.questions;
insert into public.builtin_questions (topic_id, subject_name, topic_name, questions) values ('mat_fonksiyonlar', 'Matematik', 'Fonksiyonlar', $q$[{"stem":"f(x) = 2x - 3 ve g(x) = x² + 1 fonksiyonları veriliyor. (f o g⁻¹)(5) değeri kaçtır?","options":{"A":"1","B":"3","C":"5","D":"7","E":"9"},"answer":"A","explanation":"Önce g⁻¹(5) değerini bulmak gerekir. g(x) = 5 eşitliğini sağlayan x değeri x² + 1 = 5 => x² = 4 => x = 2'dir (g⁻¹(x) için x≥0 kabul edilir). Daha sonra f(2) değeri hesaplanır: f(2) = 2(2) - 3 = 1. Dolayısıyla (f o g⁻¹)(5) = 1'dir."},{"stem":"f(x) = { x² + ax, x < 1\n          { x + b, x ≥ 1\nfonksiyonu her noktada türevlenebilir olduğuna göre, a + b değeri kaçtır?","options":{"A":"-2","B":"-1","C":"0","D":"1","E":"2"},"answer":"A","explanation":"Fonksiyonun her noktada türevlenebilir olması için öncelikle her noktada sürekli olması gerekir. Bu nedenle x=1 noktasında sol ve sağ limitler ile fonksiyon değeri eşit olmalıdır (1+a = 1+b => a=b). Ayrıca x=1 noktasında sol ve sağ türevler de eşit olmalıdır (2x+a ve 1 türevleri için 2(1)+a = 1 => a=-1). Bu iki koşuldan a=-1 ve b=-1 bulunur, dolayısıyla a+b = -2 olur."},{"stem":"Gerçel sayılar kümesinde tanımlı f(x) fonksiyonunun grafiği y eksenine göre simetriktir.\ng(x) = x³ + f(x) olduğuna göre, g(-x) fonksiyonu aşağıdakilerden hangisine eşittir?","options":{"A":"g(x)","B":"-g(x)","C":"x³ - f(x)","D":"-x³ + f(x)","E":"-x³ - f(x)"},"answer":"D","explanation":"f(x) fonksiyonunun grafiği y eksenine göre simetrik ise f(x) bir çift fonksiyondur, yani f(-x) = f(x) özelliğini sağlar. g(x) = x³ + f(x) verildiğine göre, g(-x) ifadesini bulmak için x yerine -x yazılır: g(-x) = (-x)³ + f(-x). Çift fonksiyon özelliğini kullanarak f(-x) yerine f(x) yazıldığında g(-x) = -x³ + f(x) elde edilir."},{"stem":"f: R → R, f(x) = x³ + 2x + 1 fonksiyonu veriliyor. (f⁻¹)'(4) değeri kaçtır?","options":{"A":"1/3","B":"1/4","C":"1/5","D":"1/6","E":"1/7"},"answer":"C","explanation":"Ters fonksiyonun türevi kuralı (f⁻¹)'(y₀) = 1 / f'(x₀) şeklindedir, burada f(x₀) = y₀ olmalıdır. Öncelikle f(x) = 4 eşitliğini sağlayan x₀ değerini buluruz ki bu x₀ = 1'dir. Daha sonra f(x) fonksiyonunun türevini alırız: f'(x) = 3x² + 2. Son olarak x₀ = 1 değerini f'(x)'e yerine koyarak f'(1) = 5 bulur ve ters fonksiyonun türevi formülünü kullanarak (f⁻¹)'(4) = 1/5 sonucuna ulaşırız."},{"stem":"f(x) = x² - 4x + 7 fonksiyonunun [1, 4] aralığındaki görüntü kümesi aşağıdakilerden hangisidir?","options":{"A":"[3, 7]","B":"[3, 10]","C":"[4, 7]","D":"[4, 10]","E":"[7, 10]"},"answer":"A","explanation":"f(x) = x² - 4x + 7 bir parabol denklemidir ve kolları yukarı doğrudur. Parabolün tepe noktasının apsisi x = -b/(2a) formülüyle bulunur: x = -(-4)/(2*1) = 2. Bu x=2 değeri verilen [1, 4] aralığının içindedir. Dolayısıyla fonksiyonun minimum değeri tepe noktasında, yani f(2) = 2² - 4(2) + 7 = 3 olarak bulunur. Maksimum değer ise aralığın uç noktalarında olacaktır: f(1) = 1² - 4(1) + 7 = 4 ve f(4) = 4² - 4(4) + 7 = 7. Bu değerler arasında en büyüğü 7 olduğundan, fonksiyonun görüntü kümesi [3, 7]'dir."}]$q$::jsonb) on conflict (topic_id) do update set subject_name=excluded.subject_name, topic_name=excluded.topic_name, questions=excluded.questions;
insert into public.builtin_questions (topic_id, subject_name, topic_name, questions) values ('tyt_tr_paragraf', 'Türkçe', 'Paragraf', $q$[{"stem":"Okuma eylemi, sadece bilgi edinme aracı olmaktan çok öte, bireyin düşünce dünyasını şekillendiren, eleştirel bakış açısı kazandıran ve empati yeteneğini geliştiren karmaşık bir süreçtir. Tek tip kitaplara bağlı kalmak, zihni belirli kalıplara hapsederken, farklı türlerdeki eserlerle buluşmak, okuyucunun olaylara ve olgulara çok yönlü yaklaşmasını sağlar. Edebiyattan felsefeye, bilimden tarihe uzanan geniş bir yelpazede okumalar yapmak, bireyin kendi sınırlarını aşmasına, yeni perspektifler kazanmasına ve böylece daha donanımlı bir dünya vatandaşı olmasına olanak tanır.","options":{"A":"Okuma eylemi, bireyin bilgi birikimini artırmanın en etkili yoludur.","B":"Edebî eserler, felsefî metinlere göre daha fazla empati gelişimine katkı sağlar.","C":"Farklı türlerde okumak, bireyin düşünsel gelişimini ve bakış açısını zenginleştirir.","D":"Eleştirel düşünme, ancak felsefe kitapları okuyarak kazanılabilir.","E":"Okuma alışkanlığı, bireyin sosyal çevresini genişletmesine yardımcı olur."},"answer":"C","explanation":"Paragrafın genelinde, tek tip okumanın sınırlayıcılığından ve farklı türlerdeki eserleri okumanın bireyin düşünce dünyasını nasıl zenginleştirdiğinden bahsedilmektedir. C seçeneği, bu ana fikri en doğru şekilde özetlemektedir. Diğer seçenekler, paragrafın belirli kısımlarına değinse de ana düşünceyi tam olarak yansıtmamaktadır."},{"stem":"Günümüz dünyasında sosyal medya platformları, insanlar arasındaki iletişimi kökten değiştirmiştir. Bir yandan coğrafi sınırları ortadan kaldırarak uzaklardaki sevdiklerimizle anında bağlantı kurmamızı sağlarken, diğer yandan yüz yüze iletişimin yerini alarak bireylerin sosyal becerilerini köreltebilmektedir. Sanal ortamda kurulan ilişkiler, çoğu zaman gerçek hayattaki derinlikten yoksun kalabilmekte, bu da yalnızlık hissini artırabilmektedir. Ancak doğru kullanıldığında, bilgiye erişimi kolaylaştırması, farklı kültürlerle etkileşimi sağlaması ve toplumsal olaylarda farkındalık yaratması gibi pek çok olumlu yönü de göz ardı edilemez.","options":{"A":"İnsanlar arası iletişimin niteliğini dönüştürmüştür.","B":"Uzak mesafelerdeki kişilerle iletişim kurmayı kolaylaştırmıştır.","C":"Sanal ilişkiler, gerçek hayattaki ilişkilerin derinliğine her zaman ulaşamaz.","D":"Yüz yüze iletişimin tamamen ortadan kalkmasına neden olmuştur.","E":"Bilgiye erişimi hızlandırma gibi olumlu yönleri de bulunmaktadır."},"answer":"D","explanation":"Parçada sosyal medyanın yüz yüze iletişimi 'köreltebildiği' ifade edilmiştir ancak 'tamamen ortadan kaldırdığına' dair bir bilgi yoktur. D seçeneği, parçadaki ifadenin abartılı bir yorumudur ve parçadan çıkarılamaz. Diğer seçenekler, parçada açıkça belirtilen veya çıkarılabilecek yargılardır."},{"stem":"Sanat, gerçeğin bir kopyası değil, onun yeniden yorumlanmış, dönüştürülmüş hâlidir. Bir sanatçı, gördüğü dünyayı olduğu gibi aktarmak yerine, kendi iç süzgecinden geçirerek ona yeni bir anlam, yeni bir boyut kazandırır. Bu yüzden sanat eseri, izleyiciye veya okuyucuya sadece bir ayna tutmakla kalmaz, aynı zamanda onlara farklı bir pencereden bakma imkânı sunar. Sanatın gücü de tam olarak bu 'gerçeği aşma' yeteneğinde yatar.","options":{"A":"Sanatın, gerçekliği olduğu gibi yansıtma çabası.","B":"Sanatçının, gerçekliği kendi bakış açısıyla yeniden biçimlendirmesi.","C":"Sanatın, gerçek dünyadan tamamen kopuk bir alan olması.","D":"Sanat eserlerinin, gerçek hayattaki sorunlara çözüm üretmesi.","E":"Sanatın, gerçekliğin eksik yönlerini tamamlaması."},"answer":"B","explanation":"Parçada sanatın gerçeğin bir kopyası olmadığı, sanatçının kendi iç süzgecinden geçirerek ona yeni bir anlam ve boyut kazandırdığı belirtilmektedir. 'Gerçeği aşma' ifadesi de bu yeniden biçimlendirme ve yorumlama sürecini, yani sanatçının öznel katkısıyla gerçeğin ötesine geçmesini anlatır. B seçeneği bu anlamı en iyi karşılamaktadır."},{"stem":"Bilgi çağında yaşıyor olmamız, her an sayısız veriye maruz kalmamız anlamına geliyor. İnternet ve sosyal medya sayesinde bilgiye erişim hiç olmadığı kadar kolaylaşmış durumda. Ancak bu durum, aynı zamanda doğru ile yanlışı, önemli ile önemsizi ayırt etme becerisinin önemini de artırıyor. Her duyduğumuza, her okuduğumuza sorgulamadan inanmak, bizi yanlış yönlendirebilir ve hatalı kararlar almaya itebilir. Bu nedenle, bireylerin kendi muhakeme yeteneklerini geliştirmeleri ve eleştirel bir bakış açısıyla olaylara yaklaşmaları hayati önem taşımaktadır. Çünkü _______________________________________.","options":{"A":"bilgiye kolay ulaşım, her zaman doğru bilgiye ulaşım anlamına gelmez.","B":"teknolojik gelişmeler, hayatımızı her alanda kolaylaştırmaktadır.","C":"okuma alışkanlığı, bireyin kelime dağarcığını zenginleştirir.","D":"bilgi kirliliği, sadece dijital platformlarda görülür.","E":"her bilgi, farklı kaynaklardan teyit edilmelidir."},"answer":"A","explanation":"Parça, bilgiye kolay erişimin getirdiği bilgi kirliliği riskini ve bu durumda eleştirel düşünmenin önemini vurgulamaktadır. Son cümle, bu önemin nedenini açıklayacak nitelikte olmalıdır. A seçeneği, bilgiye kolay ulaşımın her zaman doğru bilgiye ulaşım anlamına gelmediğini belirterek, eleştirel düşünme ihtiyacını pekiştirmektedir. Bu nedenle düşüncenin akışına en uygun seçenektir."},{"stem":"Moda rüzgarları, hayatın her alanında eser. Giyimden mimariye, müzikten edebiyata kadar pek çok alanda dönemsel beğeniler yükselir, sonra da hızla kaybolur gider. Oysa gerçek sanat, bu gelip geçici heveslerin çok ötesindedir. Bir eserin kalıcılığı, onun güncelin ve popüler olanın ötesine geçebilme, insanlığın evrensel duygularına ve düşüncelerine dokunabilme yeteneğiyle ölçülür. Bugünün 'çok satanları' yarının unutulanları olabilirken, asırlardır okunan, dinlenen, izlenen eserler, zamanın testinden geçmiş ve insan ruhuna hitap etmeye devam etmiştir. Bu da bize, yüzeydeki ışıltıların değil, derinlikteki anlamın peşinden gitmenin önemini hatırlatır.","options":{"A":"Güncel sanat akımlarının takip edilmesi.","B":"Popüler eserlerin geniş kitlelere ulaşması.","C":"Sanat eserlerinin kalıcılığı ve evrensel değeri.","D":"Moda ve sanat arasındaki ilişkinin incelenmesi.","E":"Sanatın toplumsal değişimlere ayak uydurması."},"answer":"C","explanation":"Parçada yazar, moda ve güncel beğenilerin gelip geçiciliğini vurgularken, gerçek sanatın bu geçiciliğin ötesinde, evrensel duygulara hitap eden ve zamanın testinden geçen kalıcı eserler olduğunu belirtmektedir. Bu nedenle yazar için asıl önemli olan, sanat eserlerinin kalıcılığı ve evrensel değeridir. C seçeneği, yazarın bu temel vurgusunu doğru bir şekilde yansıtmaktadır."}]$q$::jsonb) on conflict (topic_id) do update set subject_name=excluded.subject_name, topic_name=excluded.topic_name, questions=excluded.questions;


-- ===================== migrations/0012_profile_media.sql =====================

-- ============================================================
-- Profil medyası: avatar, banner, bio + public 'avatars' storage bucket.
-- Supabase SQL Editor'da çalıştır. Idempotent.
-- ============================================================

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists banner_url text,
  add column if not exists bio text;

-- Public bucket: profil görselleri (avatar + banner). Herkese okunur.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'avatars',
    'avatars',
    true,
    5242880, -- 5 MB
    array['image/png','image/jpeg','image/webp','image/gif']
  )
  on conflict (id) do update set
    public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Politikalar: herkes okur; kullanıcı yalnızca kendi user_id'siyle başlayan
-- path'lere yazar/günceller/siler (avatars/{uid}/...).
do $do$
begin
  if not exists (select 1 from pg_policies where tablename = 'objects' and schemaname = 'storage' and policyname = 'public read avatars') then
    create policy "public read avatars" on storage.objects for select
      using (bucket_id = 'avatars');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'objects' and schemaname = 'storage' and policyname = 'own avatars insert') then
    create policy "own avatars insert" on storage.objects for insert
      with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'objects' and schemaname = 'storage' and policyname = 'own avatars update') then
    create policy "own avatars update" on storage.objects for update
      using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'objects' and schemaname = 'storage' and policyname = 'own avatars delete') then
    create policy "own avatars delete" on storage.objects for delete
      using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $do$;


-- ===================== migrations/0013_ydt_mufredat.sql =====================

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

