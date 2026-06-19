-- ============================================================
-- 0019: AP (Advanced Placement) dersleri — OPT-IN ekstra sınav modülü
--
-- AP, YKS'den bağımsız bir ABD üniversite-düzeyi sınav ailesidir. Uygulamaya
-- "ekstra sınav" olarak eklenir: yalnızca kullanıcı AYARLAR'dan açıkça seçerse
-- (profiles.extra_exams içinde 'AP') görünür. YKS öğrencilerinin paneline,
-- programına, pomodorosuna vb. ASLA sızmaz.
--
-- Sızıntı koruması iki katlı:
--   1) AP dersleri tracks='{AP}' ile işaretlenir → mevcut subjectForTrack()
--      (lise bölümü MF/TM/Sözel/Dil ile eşleşmez) bunları tüm track-bazlı
--      görünümlerden otomatik gizler.
--   2) Opt-in farkındalıklı sayfalar subjectVisible() kullanır: AP yalnızca
--      extra_exams içinde 'AP' varsa gösterilir.
--
-- İDEMPOTENT. Supabase SQL Editor'da çalıştır.
-- ============================================================

-- 1) Opt-in kolonu: kullanıcının açtığı ekstra sınav aileleri (örn. {'AP'}).
alter table public.profiles
  add column if not exists extra_exams text[] not null default '{}';

-- 2) AP dersleri (exam_type='AP', tracks='{AP}' → opt-in dışı gizli).
insert into public.subjects (id, name, color, question_count, display_order, exam_type, tracks) values
  ('ap_calc_ab', 'AP Calculus AB',          '#3b82f6', 45, 300, 'AP', '{AP}'),
  ('ap_calc_bc', 'AP Calculus BC',          '#2563eb', 45, 301, 'AP', '{AP}'),
  ('ap_phys1',   'AP Physics 1',            '#ef4444', 50, 302, 'AP', '{AP}'),
  ('ap_chem',    'AP Chemistry',            '#10b981', 60, 303, 'AP', '{AP}'),
  ('ap_bio',     'AP Biology',              '#a855f7', 60, 304, 'AP', '{AP}'),
  ('ap_csa',     'AP Computer Science A',   '#f59e0b', 40, 305, 'AP', '{AP}'),
  ('ap_stats',   'AP Statistics',           '#06b6d4', 40, 306, 'AP', '{AP}'),
  ('ap_micro',   'AP Microeconomics',       '#84cc16', 60, 307, 'AP', '{AP}'),
  ('ap_macro',   'AP Macroeconomics',       '#14b8a6', 60, 308, 'AP', '{AP}')
on conflict (id) do update set
  name = excluded.name, color = excluded.color, question_count = excluded.question_count,
  display_order = excluded.display_order, exam_type = excluded.exam_type, tracks = excluded.tracks;

-- 3) Konular (College Board üniteleri). grade=0 (YKS sınıf kavramı yok).
insert into public.topics (id, subject_id, name, grade, priority, display_order) values
  -- AP Calculus AB
  ('ap_calcab_u1', 'ap_calc_ab', 'Limits and Continuity',                                  0, 'high',   0),
  ('ap_calcab_u2', 'ap_calc_ab', 'Differentiation: Definition and Fundamental Properties',  0, 'high',   1),
  ('ap_calcab_u3', 'ap_calc_ab', 'Differentiation: Composite, Implicit, Inverse',           0, 'high',   2),
  ('ap_calcab_u4', 'ap_calc_ab', 'Contextual Applications of Differentiation',              0, 'medium', 3),
  ('ap_calcab_u5', 'ap_calc_ab', 'Analytical Applications of Differentiation',              0, 'medium', 4),
  ('ap_calcab_u6', 'ap_calc_ab', 'Integration and Accumulation of Change',                  0, 'high',   5),
  ('ap_calcab_u7', 'ap_calc_ab', 'Differential Equations',                                  0, 'medium', 6),
  ('ap_calcab_u8', 'ap_calc_ab', 'Applications of Integration',                             0, 'medium', 7),
  -- AP Calculus BC
  ('ap_calcbc_u1', 'ap_calc_bc', 'Limits and Continuity',                                  0, 'medium', 0),
  ('ap_calcbc_u2', 'ap_calc_bc', 'Differentiation: Definition and Properties',             0, 'medium', 1),
  ('ap_calcbc_u3', 'ap_calc_bc', 'Differentiation: Composite, Implicit, Inverse',          0, 'medium', 2),
  ('ap_calcbc_u4', 'ap_calc_bc', 'Contextual Applications of Differentiation',             0, 'medium', 3),
  ('ap_calcbc_u5', 'ap_calc_bc', 'Analytical Applications of Differentiation',             0, 'medium', 4),
  ('ap_calcbc_u6', 'ap_calc_bc', 'Integration and Accumulation of Change',                 0, 'high',   5),
  ('ap_calcbc_u7', 'ap_calc_bc', 'Differential Equations',                                 0, 'medium', 6),
  ('ap_calcbc_u8', 'ap_calc_bc', 'Applications of Integration',                            0, 'medium', 7),
  ('ap_calcbc_u9', 'ap_calc_bc', 'Parametric, Polar, and Vector-Valued Functions',         0, 'high',   8),
  ('ap_calcbc_u10','ap_calc_bc', 'Infinite Sequences and Series',                          0, 'high',   9),
  -- AP Physics 1
  ('ap_phys1_u1', 'ap_phys1', 'Kinematics',                                                0, 'high',   0),
  ('ap_phys1_u2', 'ap_phys1', 'Dynamics (Newton''s Laws)',                                 0, 'high',   1),
  ('ap_phys1_u3', 'ap_phys1', 'Circular Motion and Gravitation',                           0, 'medium', 2),
  ('ap_phys1_u4', 'ap_phys1', 'Energy',                                                    0, 'high',   3),
  ('ap_phys1_u5', 'ap_phys1', 'Momentum',                                                  0, 'high',   4),
  ('ap_phys1_u6', 'ap_phys1', 'Simple Harmonic Motion',                                    0, 'medium', 5),
  ('ap_phys1_u7', 'ap_phys1', 'Torque and Rotational Motion',                              0, 'medium', 6),
  ('ap_phys1_u8', 'ap_phys1', 'Fluids',                                                    0, 'low',    7),
  -- AP Chemistry
  ('ap_chem_u1', 'ap_chem', 'Atomic Structure and Properties',                             0, 'high',   0),
  ('ap_chem_u2', 'ap_chem', 'Molecular and Ionic Compound Structure and Properties',       0, 'medium', 1),
  ('ap_chem_u3', 'ap_chem', 'Intermolecular Forces and Properties',                        0, 'medium', 2),
  ('ap_chem_u4', 'ap_chem', 'Chemical Reactions',                                          0, 'high',   3),
  ('ap_chem_u5', 'ap_chem', 'Kinetics',                                                    0, 'medium', 4),
  ('ap_chem_u6', 'ap_chem', 'Thermodynamics',                                              0, 'high',   5),
  ('ap_chem_u7', 'ap_chem', 'Equilibrium',                                                 0, 'high',   6),
  ('ap_chem_u8', 'ap_chem', 'Acids and Bases',                                             0, 'high',   7),
  ('ap_chem_u9', 'ap_chem', 'Applications of Thermodynamics (Electrochemistry)',           0, 'medium', 8),
  -- AP Biology
  ('ap_bio_u1', 'ap_bio', 'Chemistry of Life',                                             0, 'medium', 0),
  ('ap_bio_u2', 'ap_bio', 'Cell Structure and Function',                                   0, 'high',   1),
  ('ap_bio_u3', 'ap_bio', 'Cellular Energetics',                                           0, 'high',   2),
  ('ap_bio_u4', 'ap_bio', 'Cell Communication and Cell Cycle',                             0, 'medium', 3),
  ('ap_bio_u5', 'ap_bio', 'Heredity',                                                      0, 'high',   4),
  ('ap_bio_u6', 'ap_bio', 'Gene Expression and Regulation',                                0, 'high',   5),
  ('ap_bio_u7', 'ap_bio', 'Natural Selection',                                             0, 'medium', 6),
  ('ap_bio_u8', 'ap_bio', 'Ecology',                                                       0, 'medium', 7),
  -- AP Computer Science A
  ('ap_csa_u1',  'ap_csa', 'Primitive Types',                                              0, 'medium', 0),
  ('ap_csa_u2',  'ap_csa', 'Using Objects',                                                0, 'medium', 1),
  ('ap_csa_u3',  'ap_csa', 'Boolean Expressions and if Statements',                        0, 'high',   2),
  ('ap_csa_u4',  'ap_csa', 'Iteration',                                                    0, 'high',   3),
  ('ap_csa_u5',  'ap_csa', 'Writing Classes',                                              0, 'high',   4),
  ('ap_csa_u6',  'ap_csa', 'Array',                                                        0, 'medium', 5),
  ('ap_csa_u7',  'ap_csa', 'ArrayList',                                                    0, 'medium', 6),
  ('ap_csa_u8',  'ap_csa', '2D Array',                                                      0, 'medium', 7),
  ('ap_csa_u9',  'ap_csa', 'Inheritance',                                                  0, 'high',   8),
  ('ap_csa_u10', 'ap_csa', 'Recursion',                                                    0, 'medium', 9),
  -- AP Statistics
  ('ap_stats_u1', 'ap_stats', 'Exploring One-Variable Data',                               0, 'high',   0),
  ('ap_stats_u2', 'ap_stats', 'Exploring Two-Variable Data',                               0, 'medium', 1),
  ('ap_stats_u3', 'ap_stats', 'Collecting Data',                                           0, 'medium', 2),
  ('ap_stats_u4', 'ap_stats', 'Probability, Random Variables, and Distributions',          0, 'high',   3),
  ('ap_stats_u5', 'ap_stats', 'Sampling Distributions',                                    0, 'high',   4),
  ('ap_stats_u6', 'ap_stats', 'Inference for Categorical Data: Proportions',               0, 'high',   5),
  ('ap_stats_u7', 'ap_stats', 'Inference for Quantitative Data: Means',                     0, 'high',   6),
  ('ap_stats_u8', 'ap_stats', 'Inference for Categorical Data: Chi-Square',                0, 'medium', 7),
  ('ap_stats_u9', 'ap_stats', 'Inference for Quantitative Data: Slopes',                   0, 'low',    8),
  -- AP Microeconomics
  ('ap_micro_u1', 'ap_micro', 'Basic Economic Concepts',                                   0, 'medium', 0),
  ('ap_micro_u2', 'ap_micro', 'Supply and Demand',                                         0, 'high',   1),
  ('ap_micro_u3', 'ap_micro', 'Production, Cost, and the Perfect Competition Model',        0, 'high',   2),
  ('ap_micro_u4', 'ap_micro', 'Imperfect Competition',                                     0, 'high',   3),
  ('ap_micro_u5', 'ap_micro', 'Factor Markets',                                            0, 'medium', 4),
  ('ap_micro_u6', 'ap_micro', 'Market Failure and the Role of Government',                 0, 'medium', 5),
  -- AP Macroeconomics
  ('ap_macro_u1', 'ap_macro', 'Basic Economic Concepts',                                   0, 'medium', 0),
  ('ap_macro_u2', 'ap_macro', 'Economic Indicators and the Business Cycle',                0, 'high',   1),
  ('ap_macro_u3', 'ap_macro', 'National Income and Price Determination',                   0, 'high',   2),
  ('ap_macro_u4', 'ap_macro', 'Financial Sector',                                          0, 'high',   3),
  ('ap_macro_u5', 'ap_macro', 'Long-Run Consequences of Stabilization Policies',           0, 'medium', 4),
  ('ap_macro_u6', 'ap_macro', 'Open Economy: International Trade and Finance',              0, 'medium', 5)
on conflict (id) do update set
  subject_id = excluded.subject_id, name = excluded.name,
  grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;
