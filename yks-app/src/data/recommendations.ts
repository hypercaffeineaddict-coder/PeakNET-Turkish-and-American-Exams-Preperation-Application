import type { ResourceKind } from "@/lib/resources";

export type RecommendationSource = "MEB" | "KhanAcademy";

export type Recommendation = {
  kind: ResourceKind;
  title: string;
  url: string;
  description?: string;
  source: RecommendationSource;
};

// =======================================================================
// Kaynak politikası:
//
// 1) Birincil kaynaklar MEB / EBA / OGM Materyal / ÖSYM (Türkiye resmî
//    eğitim ekosistemi). Bunlar telif açısından açıkça serbesttir.
//
// 2) İkincil kaynak: Khan Academy / Khan Academy Türkçe (CC BY-NC-SA 3.0).
//    Atıf zorunlu + ticari olmayan kullanım. PeakNET ücretsiz/öğrenci
//    odaklı bir uygulama olduğu için bu lisansla uyumlu. Her Khan Academy
//    kaynağında atıf görünür şekilde gösterilir.
//
// Başka üçüncü taraf yayın/özel hoca içeriği gömülmez; kullanıcı isterse
// YouTube arama butonuyla kendisi araştırır.
// =======================================================================

const KA_ATTRIBUTION =
  "Khan Academy içerikleri CC BY-NC-SA lisansıyla ücretsiz, ticari olmayan kullanım için. Kaynak: khanacademy.org";

// Tüm konulara önerilen genel kaynaklar
export const globalRecommendations: Recommendation[] = [
  {
    kind: "link",
    title: "OGM Materyal — Ana sayfa",
    url: "https://ogmmateryal.eba.gov.tr/",
    description: "MEB'in ortaöğretim materyal portalı. Konu anlatımı, video, test her şey.",
    source: "MEB",
  },
  {
    kind: "link",
    title: "OGM Materyal — Dört Dörtlük Konu Pekiştirme Testleri",
    url: "https://ogmmateryal.eba.gov.tr/yks-konu-pekistirme",
    description: "YKS odaklı resmi konu pekiştirme testleri.",
    source: "MEB",
  },
  {
    kind: "link",
    title: "OGM Materyal — Soru Bankası",
    url: "https://ogmmateryal.eba.gov.tr/soru-bankasi",
    description: "Tüm dersler için MEB resmî soru bankası.",
    source: "MEB",
  },
  {
    kind: "link",
    title: "OGM Materyal — Etkileşimli Kitaplar",
    url: "https://ogmmateryal.eba.gov.tr/etkilesimli-kitaplar",
    description: "Konuyu okuyarak çalışmak için resmî etkileşimli ders kitapları.",
    source: "MEB",
  },
  {
    kind: "link",
    title: "OGM Materyal — YKS Çıkmış Soru Kitapları",
    url: "https://ogmmateryal.eba.gov.tr/yks-cikmis-soru-kitaplari",
    description: "TYT, AYT ve YDT çıkmış sorular — MEB tarafından konu bazlı düzenlenmiş.",
    source: "MEB",
  },
  {
    kind: "link",
    title: "ÖSYM — Resmi YKS Çıkmış Sorular",
    url: "https://www.osym.gov.tr/tr,15164/yks-cikmis-sorular.html",
    description: "Resmî sınav arşivi: TYT, AYT ve YDT tüm yıllar.",
    source: "MEB",
  },
  {
    kind: "link",
    title: "Khan Academy Türkçe — Ana sayfa",
    url: "https://tr.khanacademy.org/",
    description: `Ücretsiz video dersler ve alıştırmalar (matematik, fen, ekonomi, kodlama, ...). ${KA_ATTRIBUTION}`,
    source: "KhanAcademy",
  },
  {
    kind: "video",
    title: "Khan Academy Türkçe — YouTube kanalı",
    url: "https://www.youtube.com/@khanacademyturkce",
    description: `Türkçe altyazılı/dublajlı resmi Khan Academy YouTube kanalı. ${KA_ATTRIBUTION}`,
    source: "KhanAcademy",
  },
];

// Derse özel öneriler (subject.id)
export const subjectRecommendations: Record<string, Recommendation[]> = {
  matematik: [
    {
      kind: "link",
      title: "OGM Materyal — YKS Matematik Konu Anlatımları",
      url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=MAT&s=0&d=0&u=0&k=0",
      description: "MEB'in YKS matematik konu anlatım modülü (video + metin).",
      source: "MEB",
    },
    {
      kind: "link",
      title: "OGM Materyal — AYT Matematik Konu Özetleri",
      url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-matematik/index.html",
      description: "AYT matematik resmi konu özet kitabı (web).",
      source: "MEB",
    },
    {
      kind: "video",
      title: "OGM Materyal — Matematik Ders Anlatım Videoları (TRT)",
      url: "https://ogmmateryal.eba.gov.tr/ebatv-ogm/SinifListele.aspx?kod=matematik&s=0&d=0&u=0&k=0",
      description: "TRT işbirliğinde hazırlanmış MEB ders anlatım videoları.",
      source: "MEB",
    },
    {
      kind: "link",
      title: "Khan Academy — Matematik",
      url: "https://tr.khanacademy.org/math",
      description: `Cebir, geometri, trigonometri, türev/integral — adım adım video ders ve alıştırmalar. ${KA_ATTRIBUTION}`,
      source: "KhanAcademy",
    },
  ],
  fizik: [
    {
      kind: "link",
      title: "OGM Materyal — YKS Fizik Konu Anlatımları",
      url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=FIZ&s=0&d=0&u=0&k=0",
      description: "MEB'in YKS fizik konu anlatım modülü.",
      source: "MEB",
    },
    {
      kind: "link",
      title: "OGM Materyal — Fizik Soru Bankası",
      url: "https://ogmmateryal.eba.gov.tr/soru-bankasi/fizik",
      description: "MEB resmi fizik soru bankası.",
      source: "MEB",
    },
    {
      kind: "video",
      title: "OGM Materyal — Fizik Ders Anlatım Videoları",
      url: "https://ogmmateryal.eba.gov.tr/ebatv-ogm/SinifListele.aspx?kod=fizik&s=0&d=0&u=0&k=0",
      description: "TRT işbirliğinde hazırlanmış MEB fizik videoları.",
      source: "MEB",
    },
    {
      kind: "link",
      title: "Khan Academy — Fizik",
      url: "https://tr.khanacademy.org/science/physics",
      description: `Hareket, kuvvet, enerji, elektromanyetizma — kavramsal anlatım. ${KA_ATTRIBUTION}`,
      source: "KhanAcademy",
    },
  ],
  kimya: [
    {
      kind: "link",
      title: "OGM Materyal — YKS Kimya Konu Anlatımları",
      url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=KIM&s=0&d=0&u=0&k=0",
      description: "MEB'in YKS kimya konu anlatım modülü.",
      source: "MEB",
    },
    {
      kind: "link",
      title: "OGM Materyal — Kimya Soru Bankası",
      url: "https://ogmmateryal.eba.gov.tr/soru-bankasi-kazanim/kimya?s=9&d=47&u=0&k=0",
      description: "MEB resmi kimya kazanım bazlı soru bankası.",
      source: "MEB",
    },
    {
      kind: "video",
      title: "OGM Materyal — Kimya Ders Anlatım Videoları",
      url: "https://ogmmateryal.eba.gov.tr/ebatv-ogm/SinifListele.aspx?kod=kimya&s=0&d=0&u=0&k=0",
      description: "TRT işbirliğinde hazırlanmış MEB kimya videoları.",
      source: "MEB",
    },
    {
      kind: "link",
      title: "Khan Academy — Kimya",
      url: "https://tr.khanacademy.org/science/chemistry",
      description: `Atom, molekül, asit-baz, organik kimya. ${KA_ATTRIBUTION}`,
      source: "KhanAcademy",
    },
  ],
  biyoloji: [
    {
      kind: "link",
      title: "OGM Materyal — YKS Biyoloji Konu Anlatımları",
      url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=BIY&s=0&d=0&u=0&k=0",
      description: "MEB'in YKS biyoloji konu anlatım modülü.",
      source: "MEB",
    },
    {
      kind: "link",
      title: "OGM Materyal — Biyoloji Soru Bankası",
      url: "https://ogmmateryal.eba.gov.tr/soru-bankasi/biyoloji",
      description: "MEB resmi biyoloji soru bankası.",
      source: "MEB",
    },
    {
      kind: "video",
      title: "OGM Materyal — Biyoloji Ders Anlatım Videoları",
      url: "https://ogmmateryal.eba.gov.tr/ebatv-ogm/SinifListele.aspx?kod=biyoloji&s=0&d=0&u=0&k=0",
      description: "TRT işbirliğinde hazırlanmış MEB biyoloji videoları.",
      source: "MEB",
    },
    {
      kind: "link",
      title: "Khan Academy — Biyoloji",
      url: "https://tr.khanacademy.org/science/biology",
      description: `Hücre, genetik, evrim, ekoloji, insan vücudu. ${KA_ATTRIBUTION}`,
      source: "KhanAcademy",
    },
  ],
  // TM / Sözel AYT dersleri
  edebiyat: [
    {
      kind: "link",
      title: "OGM Materyal — Türk Dili ve Edebiyatı",
      url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=EDB&s=0&d=0&u=0&k=0",
      description: "MEB edebiyat konu anlatımları.",
      source: "MEB",
    },
  ],
  tarih1: [
    {
      kind: "link",
      title: "OGM Materyal — Tarih",
      url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=TAR&s=0&d=0&u=0&k=0",
      description: "MEB tarih konu anlatımları.",
      source: "MEB",
    },
  ],
  tarih2: [
    {
      kind: "link",
      title: "OGM Materyal — Tarih (Çağdaş)",
      url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=TAR&s=0&d=0&u=0&k=0",
      description: "MEB tarih konu anlatımları.",
      source: "MEB",
    },
  ],
  cografya1: [
    {
      kind: "link",
      title: "OGM Materyal — Coğrafya",
      url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=COG&s=0&d=0&u=0&k=0",
      description: "MEB coğrafya konu anlatımları.",
      source: "MEB",
    },
  ],
  cografya2: [
    {
      kind: "link",
      title: "OGM Materyal — Coğrafya (İleri)",
      url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=COG&s=0&d=0&u=0&k=0",
      description: "MEB coğrafya konu anlatımları.",
      source: "MEB",
    },
  ],
  felsefe: [
    {
      kind: "link",
      title: "OGM Materyal — Felsefe Grubu",
      url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=FEL&s=0&d=0&u=0&k=0",
      description: "Felsefe, mantık, psikoloji, sosyoloji MEB konu anlatımları.",
      source: "MEB",
    },
  ],
  din: [
    {
      kind: "link",
      title: "OGM Materyal — Din Kültürü ve Ahlak Bilgisi",
      url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=DKB&s=0&d=0&u=0&k=0",
      description: "MEB din kültürü konu anlatımları.",
      source: "MEB",
    },
  ],
  // YDT İngilizce
  ydt_ingilizce: [
    {
      kind: "link",
      title: "OGM Materyal — İngilizce",
      url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=ING&s=0&d=0&u=0&k=0",
      description: "MEB İngilizce konu anlatım modülü.",
      source: "MEB",
    },
    {
      kind: "link",
      title: "Khan Academy — Grammar",
      url: "https://www.khanacademy.org/humanities/grammar",
      description: `İngilizce dil bilgisi (İngilizce anlatım). ${KA_ATTRIBUTION}`,
      source: "KhanAcademy",
    },
  ],
};

// TYT dersleri için öneriler
subjectRecommendations.tyt_turkce = [
  {
    kind: "link",
    title: "OGM Materyal — YKS Türkçe Konu Anlatımları",
    url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=TUR&s=0&d=0&u=0&k=0",
    description: "MEB'in TYT Türkçe konu anlatım modülü.",
    source: "MEB",
  },
];
subjectRecommendations.tyt_matematik = [
  {
    kind: "link",
    title: "OGM Materyal — YKS Matematik Konu Anlatımları",
    url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=MAT&s=0&d=0&u=0&k=0",
    description: "MEB'in matematik konu anlatım modülü (TYT dahil).",
    source: "MEB",
  },
  {
    kind: "link",
    title: "Khan Academy — Matematik",
    url: "https://tr.khanacademy.org/math",
    description: `Cebir, geometri, fonksiyon, temel matematik. ${KA_ATTRIBUTION}`,
    source: "KhanAcademy",
  },
];
subjectRecommendations.tyt_sosyal = [
  {
    kind: "link",
    title: "OGM Materyal — Tarih / Coğrafya / Felsefe",
    url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=TAR&s=0&d=0&u=0&k=0",
    description: "MEB sosyal bilimler konu anlatımları.",
    source: "MEB",
  },
];
subjectRecommendations.tyt_fen = [
  {
    kind: "link",
    title: "OGM Materyal — Fizik / Kimya / Biyoloji",
    url: "https://ogmmateryal.eba.gov.tr/yks-konu-anlatim?kod=FIZ&s=0&d=0&u=0&k=0",
    description: "MEB fen bilimleri konu anlatımları.",
    source: "MEB",
  },
  {
    kind: "link",
    title: "Khan Academy — Fen Bilimleri",
    url: "https://tr.khanacademy.org/science",
    description: `Fizik, kimya, biyoloji temelleri. ${KA_ATTRIBUTION}`,
    source: "KhanAcademy",
  },
];

// Konuya özel öneriler — Khan Academy Türkçe bölüm linkleri.
// Bölüm yoksa ders düzeyi (subjectRecommendations) zaten devreye girer.
const KA_TR = "https://tr.khanacademy.org";

const ka = (
  path: string,
  title: string,
  desc?: string,
): Recommendation => ({
  kind: "link",
  title: `Khan Academy — ${title}`,
  url: `${KA_TR}${path}`,
  description: `${desc ? desc + " · " : ""}${KA_ATTRIBUTION}`,
  source: "KhanAcademy",
});

export const topicRecommendations: Record<string, Recommendation[]> = {
  // Matematik
  mat_polinomlar: [ka("/math/algebra2", "Polinomlar (Algebra 2)")],
  mat_2dereceden_denklemler: [ka("/math/algebra", "İkinci Dereceden Denklemler")],
  mat_2dereceden_esitsizlikler: [ka("/math/algebra", "İkinci Dereceden Eşitsizlikler")],
  mat_esitsizlik_sistemleri: [ka("/math/algebra", "Eşitsizlik Sistemleri")],
  mat_karmasik_sayilar: [ka("/math/algebra2", "Karmaşık Sayılar")],
  mat_fonksiyonlar: [ka("/math/algebra", "Fonksiyonlar")],
  mat_fonksiyonlarla_islemler: [ka("/math/algebra2", "Fonksiyonlarla İşlemler")],
  mat_trigonometri: [ka("/math/trigonometry", "Trigonometri")],
  mat_logaritma: [ka("/math/algebra2", "Logaritma")],
  mat_diziler: [ka("/math/precalculus", "Diziler (Precalculus)")],
  mat_limit: [ka("/math/calculus-1", "Limit ve Süreklilik")],
  mat_turev: [ka("/math/calculus-1", "Türev")],
  mat_integral: [ka("/math/integral-calculus", "İntegral")],
  mat_analitik_dogru: [ka("/math/geometry", "Analitik Geometri — Doğru")],
  mat_analitik_cember: [ka("/math/geometry", "Analitik Geometri — Çember")],
  mat_cember_daire: [ka("/math/geometry", "Çember ve Daire")],
  mat_dik_ucgen: [ka("/math/geometry", "Dik Üçgen")],
  mat_dogruda_aci: [ka("/math/geometry", "Doğruda Açılar")],
  mat_ucgende_aci: [ka("/math/geometry", "Üçgende Açılar")],
  mat_ucgende_alan: [ka("/math/geometry", "Üçgende Alan")],
  mat_ucgende_benzerlik: [ka("/math/geometry", "Üçgende Benzerlik")],
  mat_dortgenler: [ka("/math/geometry", "Dörtgenler")],

  // Fizik (anahtar konular)
  fiz_vektorler: [ka("/science/physics", "Vektörler")],
  fiz_kuvvet_tork: [ka("/science/physics", "Kuvvet ve Tork")],
  fiz_dairesel_hareket: [ka("/science/physics", "Dairesel Hareket")],
  fiz_basit_harmonik: [ka("/science/physics", "Basit Harmonik Hareket")],
  fiz_dalga_mekanigi: [ka("/science/physics", "Dalga Mekaniği")],
  fiz_dalga_optigi: [ka("/science/physics", "Dalga Optiği")],
  fiz_elektrik_alani: [ka("/science/physics", "Elektrik Alanı")],
  fiz_manyetizma_indukleme: [ka("/science/physics", "Manyetizma ve İndükleme")],
  fiz_modern_fizik: [ka("/science/physics", "Modern Fizik")],
  fiz_atom_fizigi: [ka("/science/physics", "Atom Fiziği")],

  // Kimya
  kim_modern_atom: [ka("/science/chemistry", "Modern Atom Teorisi")],
  kim_gazlar: [ka("/science/chemistry", "Gazlar")],
  kim_sivi_cozeltiler: [ka("/science/chemistry", "Sıvı Çözeltiler")],
  kim_kim_denge: [ka("/science/chemistry", "Kimyasal Denge")],
  kim_asit_baz: [ka("/science/chemistry", "Asit-Baz")],
  kim_tepkime_hizi: [ka("/science/chemistry", "Tepkime Hızı")],
  kim_elektrokimya: [ka("/science/chemistry", "Elektrokimya")],
  kim_karbon_kimyasi: [ka("/science/chemistry", "Karbon Kimyası")],
  kim_organik_bilesikler: [ka("/science/chemistry", "Organik Bileşikler")],

  // Biyoloji
  biy_genden_proteine: [ka("/science/biology", "Genden Proteine")],
  biy_canlilarda_enerji: [ka("/science/biology", "Canlılarda Enerji")],
  biy_bitki_biyolojisi: [ka("/science/biology", "Bitki Biyolojisi")],
  biy_komunite_populasyon: [ka("/science/biology", "Komünite ve Popülasyon")],
  biy_canlilar_cevre: [ka("/science/biology", "Canlılar ve Çevre")],
  biy_insan_sinir: [ka("/science/biology", "Sinir Sistemi")],
  biy_insan_dolasim: [ka("/science/biology", "Dolaşım Sistemi")],
  biy_insan_solunum: [ka("/science/biology", "Solunum Sistemi")],
  biy_insan_sindirim: [ka("/science/biology", "Sindirim Sistemi")],
  biy_insan_endokrin: [ka("/science/biology", "Endokrin Sistem")],
  biy_insan_ureme_gelisme: [ka("/science/biology", "Üreme ve Gelişme")],
};

export function recommendationsFor(
  topicId: string,
  subjectId: string,
): Recommendation[] {
  return [
    ...(topicRecommendations[topicId] ?? []),
    ...(subjectRecommendations[subjectId] ?? []),
    ...globalRecommendations,
  ];
}

// YouTube arama linki — kullanıcının kendi araştırması için.
export function youtubeSearchUrl(query: string): string {
  const q = encodeURIComponent(query);
  return `https://www.youtube.com/results?search_query=${q}`;
}
