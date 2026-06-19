// YKS net / puan / sıralama tahmin modeli.
//
// ÖNEMLİ: ÖSYM'nin gerçek puan hesabı (ham puanların standartlaştırılması,
// o yılki tüm adayların ortalama/standart sapması) dışarıdan birebir
// hesaplanamaz. Burada geçmiş yıl verilerine dayalı, KABA bir TAHMİN modeli
// kullanılır. Çıktılar kesin değildir; güncel YÖK Atlas verisiyle doğrulanmalı.

export type PuanTuru = "TYT" | "SAY" | "EA" | "SOZ";

export const PUAN_TURU_LABEL: Record<PuanTuru, string> = {
  TYT: "TYT",
  SAY: "Sayısal (MF)",
  EA: "Eşit Ağırlık (TM)",
  SOZ: "Sözel",
};

export type NetField = {
  key: string;
  label: string;
  count: number; // soru sayısı (maksimum doğru)
};

// TYT testi (tüm adaylar için ortak, 120 soru)
export const TYT_FIELDS: NetField[] = [
  { key: "turkce", label: "Türkçe", count: 40 },
  { key: "sosyal", label: "Sosyal Bilimler", count: 20 },
  { key: "matematik", label: "Temel Matematik", count: 40 },
  { key: "fen", label: "Fen Bilimleri", count: 20 },
];

// AYT testleri puan türüne göre
export const AYT_FIELDS: Record<Exclude<PuanTuru, "TYT">, NetField[]> = {
  SAY: [
    { key: "matematik", label: "Matematik", count: 40 },
    { key: "fizik", label: "Fizik", count: 14 },
    { key: "kimya", label: "Kimya", count: 13 },
    { key: "biyoloji", label: "Biyoloji", count: 13 },
  ],
  EA: [
    { key: "matematik", label: "Matematik", count: 40 },
    { key: "edebiyat", label: "Türk Dili ve Edebiyatı", count: 24 },
    { key: "tarih1", label: "Tarih-1", count: 10 },
    { key: "cografya1", label: "Coğrafya-1", count: 6 },
  ],
  SOZ: [
    { key: "edebiyat", label: "Türk Dili ve Edebiyatı", count: 24 },
    { key: "tarih1", label: "Tarih-1", count: 10 },
    { key: "cografya1", label: "Coğrafya-1", count: 6 },
    { key: "tarih2", label: "Tarih-2", count: 11 },
    { key: "cografya2", label: "Coğrafya-2", count: 11 },
    { key: "felsefe", label: "Felsefe Grubu", count: 12 },
    { key: "din", label: "Din Kültürü", count: 6 },
  ],
};

// Net = doğru - yanlış/4 (ÖSYM standart yanlış cezası)
export function netHesapla(dogru: number, yanlis: number): number {
  const n = dogru - yanlis / 4;
  return Math.max(0, Math.round(n * 100) / 100);
}

// Bir puan türü için maksimum TYT/AYT netleri
export function maxNet(fields: NetField[]): number {
  return fields.reduce((a, f) => a + f.count, 0);
}

// --- Tahmini yerleştirme puanı modeli ---
// puan ≈ TABAN + TYT_net * tytKat + AYT_net * aytKat
// Katsayılar, tam doğruda yaklaşık 500 ham puana ulaşacak şekilde kalibre.
// (OBP / diploma katkısı hariç — yalnızca sınav ham puanı tahmini.)
const TABAN_PUAN = 100;

type Model = { tytKat: number; aytKat: number };

const MODELS: Record<PuanTuru, Model> = {
  // TYT tek başına: 120 net ≈ 500
  TYT: { tytKat: 400 / 120, aytKat: 0 },
  // AYT türleri: TYT ~%40, AYT ~%60 ağırlık (yaklaşık)
  SAY: { tytKat: 160 / 120, aytKat: 240 / 80 },
  EA: { tytKat: 160 / 120, aytKat: 240 / 80 },
  SOZ: { tytKat: 160 / 120, aytKat: 240 / 80 },
};

export function tahminiPuan(
  tur: PuanTuru,
  tytNet: number,
  aytNet: number,
): number {
  const m = MODELS[tur];
  const p = TABAN_PUAN + tytNet * m.tytKat + aytNet * m.aytKat;
  return Math.round(p * 10) / 10;
}

// --- Tahmini sıralama tabloları (puan -> yaklaşık sıralama) ---
// Geçmiş yıl genel eğilimlerine dayalı KABA çapa noktaları. Aralarda
// logaritmik interpolasyon yapılır. Kesin değildir.
type Anchor = { puan: number; rank: number };

const RANK_ANCHORS: Record<PuanTuru, Anchor[]> = {
  SAY: [
    { puan: 500, rank: 1 },
    { puan: 480, rank: 120 },
    { puan: 460, rank: 600 },
    { puan: 440, rank: 1800 },
    { puan: 420, rank: 4500 },
    { puan: 400, rank: 10000 },
    { puan: 380, rank: 20000 },
    { puan: 360, rank: 36000 },
    { puan: 340, rank: 60000 },
    { puan: 320, rank: 95000 },
    { puan: 300, rank: 145000 },
    { puan: 280, rank: 220000 },
    { puan: 260, rank: 320000 },
    { puan: 240, rank: 450000 },
    { puan: 220, rank: 620000 },
  ],
  EA: [
    { puan: 500, rank: 1 },
    { puan: 480, rank: 200 },
    { puan: 460, rank: 1000 },
    { puan: 440, rank: 3000 },
    { puan: 420, rank: 7000 },
    { puan: 400, rank: 15000 },
    { puan: 380, rank: 30000 },
    { puan: 360, rank: 55000 },
    { puan: 340, rank: 95000 },
    { puan: 320, rank: 150000 },
    { puan: 300, rank: 230000 },
    { puan: 280, rank: 340000 },
    { puan: 260, rank: 480000 },
    { puan: 240, rank: 650000 },
    { puan: 220, rank: 850000 },
  ],
  SOZ: [
    { puan: 500, rank: 1 },
    { puan: 480, rank: 150 },
    { puan: 460, rank: 800 },
    { puan: 440, rank: 2500 },
    { puan: 420, rank: 6000 },
    { puan: 400, rank: 13000 },
    { puan: 380, rank: 26000 },
    { puan: 360, rank: 48000 },
    { puan: 340, rank: 82000 },
    { puan: 320, rank: 130000 },
    { puan: 300, rank: 200000 },
    { puan: 280, rank: 300000 },
    { puan: 260, rank: 430000 },
    { puan: 240, rank: 590000 },
    { puan: 220, rank: 780000 },
  ],
  TYT: [
    { puan: 500, rank: 1 },
    { puan: 470, rank: 500 },
    { puan: 440, rank: 3000 },
    { puan: 410, rank: 12000 },
    { puan: 380, rank: 35000 },
    { puan: 350, rank: 80000 },
    { puan: 320, rank: 160000 },
    { puan: 290, rank: 290000 },
    { puan: 260, rank: 480000 },
    { puan: 230, rank: 750000 },
    { puan: 200, rank: 1100000 },
  ],
};

// puan -> tahmini sıralama (logaritmik interpolasyon)
export function tahminiSiralama(tur: PuanTuru, puan: number): number | null {
  const anchors = RANK_ANCHORS[tur];
  if (puan >= anchors[0].puan) return anchors[0].rank;
  const last = anchors[anchors.length - 1];
  if (puan <= last.puan) return last.rank;
  for (let i = 0; i < anchors.length - 1; i++) {
    const hi = anchors[i];
    const lo = anchors[i + 1];
    if (puan <= hi.puan && puan >= lo.puan) {
      const t = (puan - lo.puan) / (hi.puan - lo.puan); // 0..1
      // sıralamayı log uzayında interpole et
      const logRank =
        Math.log(lo.rank) + t * (Math.log(hi.rank) - Math.log(lo.rank));
      return Math.round(Math.exp(logRank));
    }
  }
  return null;
}

// hedef sıralama -> gereken yaklaşık puan (ters interpolasyon)
export function hedefIcinPuan(tur: PuanTuru, hedefRank: number): number | null {
  const anchors = RANK_ANCHORS[tur];
  if (hedefRank <= anchors[0].rank) return anchors[0].puan;
  const last = anchors[anchors.length - 1];
  if (hedefRank >= last.rank) return last.puan;
  for (let i = 0; i < anchors.length - 1; i++) {
    const hi = anchors[i]; // yüksek puan, düşük rank
    const lo = anchors[i + 1]; // düşük puan, yüksek rank
    if (hedefRank >= hi.rank && hedefRank <= lo.rank) {
      const t =
        (Math.log(hedefRank) - Math.log(hi.rank)) /
        (Math.log(lo.rank) - Math.log(hi.rank));
      const puan = hi.puan + t * (lo.puan - hi.puan);
      return Math.round(puan * 10) / 10;
    }
  }
  return null;
}

export function formatRank(rank: number): string {
  return rank.toLocaleString("tr-TR");
}
