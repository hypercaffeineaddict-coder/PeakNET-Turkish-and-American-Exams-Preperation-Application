import type { ResourceKind } from "@/lib/resources";

export type Recommendation = {
  kind: ResourceKind;
  title: string;
  url: string;
  description?: string;
  source: "MEB";
};

// =======================================================================
// SADECE MEB / EBA / OGM Materyal / ÖSYM kaynakları kullanılır.
// Üçüncü taraf yayınların (özel hocalar, özel kurum YouTube vb.)
// videoları ya da içerikleri uygulamaya gömülmez — kullanıcı kendisi
// YouTube arama butonuyla araştırabilir.
// =======================================================================

// Tüm konulara önerilen genel kaynaklar (resmî MEB ekosistemi)
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
];

// Konuya özel öneriler (her konu için spesifik kazanım sayfası bulunmadığında
// ders düzeyi öneriler yeterli)
export const topicRecommendations: Record<string, Recommendation[]> = {};

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
