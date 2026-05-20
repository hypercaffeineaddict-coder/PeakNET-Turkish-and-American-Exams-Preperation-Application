-- Auto-generated from data/mf-ayt-curriculum.json
-- MF AYT müfredat seed'i. Supabase SQL Editor'da çalıştır.

begin;

-- Subjects
insert into public.subjects (id, name, color, question_count, display_order) values ('matematik', 'Matematik', '#3b82f6', 40, 0)
  on conflict (id) do update set name = excluded.name, color = excluded.color, question_count = excluded.question_count, display_order = excluded.display_order;
insert into public.subjects (id, name, color, question_count, display_order) values ('fizik', 'Fizik', '#ef4444', 14, 1)
  on conflict (id) do update set name = excluded.name, color = excluded.color, question_count = excluded.question_count, display_order = excluded.display_order;
insert into public.subjects (id, name, color, question_count, display_order) values ('kimya', 'Kimya', '#10b981', 13, 2)
  on conflict (id) do update set name = excluded.name, color = excluded.color, question_count = excluded.question_count, display_order = excluded.display_order;
insert into public.subjects (id, name, color, question_count, display_order) values ('biyoloji', 'Biyoloji', '#a855f7', 13, 3)
  on conflict (id) do update set name = excluded.name, color = excluded.color, question_count = excluded.question_count, display_order = excluded.display_order;

-- Topics
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_polinomlar', 'matematik', 'Polinomlar', 11, 'high', 0)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_2dereceden_denklemler', 'matematik', '2. Dereceden Denklemler', 11, 'high', 1)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_2dereceden_esitsizlikler', 'matematik', '2. Dereceden Eşitsizlikler', 11, 'high', 2)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_esitsizlik_sistemleri', 'matematik', 'Eşitsizlik Sistemleri', 11, 'medium', 3)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_karmasik_sayilar', 'matematik', 'Karmaşık Sayılar', 11, 'medium', 4)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_fonksiyonlar', 'matematik', 'Fonksiyonlar (İleri)', 11, 'high', 5)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_fonksiyonlarla_islemler', 'matematik', 'Fonksiyonlarla İşlemler ve Uygulamaları', 11, 'high', 6)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_trigonometri', 'matematik', 'Trigonometri', 11, 'high', 7)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_logaritma', 'matematik', 'Logaritma', 12, 'high', 8)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_diziler', 'matematik', 'Diziler', 12, 'medium', 9)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_limit', 'matematik', 'Limit ve Süreklilik', 12, 'high', 10)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_turev', 'matematik', 'Türev', 12, 'high', 11)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_integral', 'matematik', 'İntegral', 12, 'high', 12)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_analitik_dogru', 'matematik', 'Analitik Geometri - Doğru', 11, 'medium', 13)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_analitik_cember', 'matematik', 'Analitik Geometri - Çember', 12, 'medium', 14)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_dogruda_aci', 'matematik', 'Doğruda Açılar', 9, 'low', 15)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_ucgende_aci', 'matematik', 'Üçgende Açılar', 9, 'low', 16)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_ucgende_alan', 'matematik', 'Üçgende Alan', 9, 'medium', 17)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_ucgende_benzerlik', 'matematik', 'Üçgende Benzerlik', 9, 'medium', 18)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_dik_ucgen', 'matematik', 'Dik Üçgen ve Trigonometri', 9, 'medium', 19)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_dortgenler', 'matematik', 'Dörtgenler ve Çokgenler', 10, 'medium', 20)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_cember_daire', 'matematik', 'Çember ve Daire', 11, 'medium', 21)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('mat_katı_cisimler', 'matematik', 'Katı Cisimler', 10, 'medium', 22)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_vektorler', 'fizik', 'Vektörler', 11, 'medium', 0)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_kuvvet_tork', 'fizik', 'Kuvvet, Tork ve Denge', 11, 'high', 1)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_kutle_merkezi', 'fizik', 'Kütle Merkezi', 11, 'medium', 2)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_basit_makineler', 'fizik', 'Basit Makineler', 11, 'low', 3)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_hareket_2boyut', 'fizik', 'İki Boyutta Hareket', 11, 'high', 4)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_atislar', 'fizik', 'Atışlar (Yatay/Eğik)', 11, 'high', 5)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_dairesel_hareket', 'fizik', 'Düzgün Çembersel Hareket', 11, 'high', 6)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_donme_yuvarlanma', 'fizik', 'Dönme, Yuvarlanma ve Açısal Momentum', 11, 'medium', 7)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_kepler', 'fizik', 'Kütle Çekimi ve Kepler Yasaları', 11, 'medium', 8)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_basit_harmonik', 'fizik', 'Basit Harmonik Hareket', 11, 'medium', 9)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_dalga_mekanigi', 'fizik', 'Dalga Mekaniği', 11, 'high', 10)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_elektrik_alani', 'fizik', 'Elektrik Alan ve Potansiyel', 11, 'high', 11)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_paralel_levha_sigac', 'fizik', 'Paralel Levhalar ve Sığa', 11, 'medium', 12)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_manyetizma_indukleme', 'fizik', 'Manyetizma ve Elektromanyetik İndükleme', 12, 'high', 13)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_alternatif_akim', 'fizik', 'Alternatif Akım ve Transformatör', 12, 'medium', 14)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_dalga_optigi', 'fizik', 'Dalga - Optik (Girişim, Kırınım, Doppler)', 12, 'high', 15)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_atom_fizigi', 'fizik', 'Atom Fiziği ve Radyoaktivite', 12, 'medium', 16)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_modern_fizik', 'fizik', 'Modern Fizik (Görelilik, Fotoelektrik)', 12, 'high', 17)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('fiz_modern_uygulamalar', 'fizik', 'Modern Fiziğin Teknolojideki Uygulamaları', 12, 'low', 18)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('kim_modern_atom', 'kimya', 'Modern Atom Teorisi', 11, 'high', 0)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('kim_gazlar', 'kimya', 'Gazlar', 11, 'high', 1)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('kim_sivi_cozeltiler', 'kimya', 'Sıvı Çözeltiler ve Çözünürlük', 11, 'high', 2)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('kim_kim_tepkimeler_enerji', 'kimya', 'Kimyasal Tepkimelerde Enerji', 11, 'high', 3)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('kim_tepkime_hizi', 'kimya', 'Kimyasal Tepkimelerde Hız', 11, 'high', 4)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('kim_kim_denge', 'kimya', 'Kimyasal Tepkimelerde Denge', 11, 'high', 5)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('kim_asit_baz', 'kimya', 'Asit-Baz Dengesi', 11, 'high', 6)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('kim_cozunurluk_dengesi', 'kimya', 'Çözünürlük Dengesi', 11, 'medium', 7)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('kim_elektrokimya', 'kimya', 'Kimya ve Elektrik (Elektrokimya)', 12, 'high', 8)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('kim_karbon_kimyasi', 'kimya', 'Karbon Kimyasına Giriş', 12, 'medium', 9)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('kim_organik_bilesikler', 'kimya', 'Organik Bileşikler (Hidrokarbonlar, Fonksiyonel Gruplar)', 12, 'high', 10)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('kim_enerji_kaynaklari', 'kimya', 'Enerji Kaynakları ve Bilimsel Gelişmeler', 12, 'low', 11)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('biy_insan_sinir', 'biyoloji', 'İnsan Fizyolojisi - Sinir Sistemi', 11, 'high', 0)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('biy_insan_endokrin', 'biyoloji', 'İnsan Fizyolojisi - Endokrin Sistem', 11, 'high', 1)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('biy_insan_duyu', 'biyoloji', 'İnsan Fizyolojisi - Duyu Organları', 11, 'medium', 2)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('biy_insan_destek_hareket', 'biyoloji', 'Destek ve Hareket Sistemi', 11, 'medium', 3)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('biy_insan_sindirim', 'biyoloji', 'Sindirim Sistemi', 11, 'medium', 4)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('biy_insan_dolasim', 'biyoloji', 'Dolaşım ve Bağışıklık Sistemi', 11, 'high', 5)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('biy_insan_solunum', 'biyoloji', 'Solunum Sistemi', 11, 'medium', 6)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('biy_insan_uriner', 'biyoloji', 'Üriner Sistem (Boşaltım)', 11, 'medium', 7)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('biy_insan_ureme_gelisme', 'biyoloji', 'Üreme Sistemi ve Embriyonik Gelişim', 11, 'high', 8)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('biy_komunite_populasyon', 'biyoloji', 'Komünite ve Popülasyon Ekolojisi', 11, 'medium', 9)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('biy_genden_proteine', 'biyoloji', 'Genden Proteine (DNA, RNA, Protein Sentezi)', 12, 'high', 10)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('biy_canlilarda_enerji', 'biyoloji', 'Canlılarda Enerji Dönüşümleri (Fotosentez, Solunum, Kemosentez)', 12, 'high', 11)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('biy_bitki_biyolojisi', 'biyoloji', 'Bitki Biyolojisi', 12, 'medium', 12)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('biy_canlilar_cevre', 'biyoloji', 'Canlılar ve Çevre', 12, 'low', 13)
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;

commit;
