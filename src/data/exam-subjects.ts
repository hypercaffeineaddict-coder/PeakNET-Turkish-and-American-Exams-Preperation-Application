// Deneme net girişi için ders setleri — sınav türü ve lise bölümüne (track) göre.
// Hem client form hem server action bunu kullanır (tek kaynak).

export type ExamSubject = { id: string; name: string; total: number; color: string };

export const TYT_SUBJECTS: ExamSubject[] = [
  { id: "turkce", name: "Türkçe", total: 40, color: "#f59e0b" },
  { id: "matematik", name: "Temel Matematik", total: 40, color: "#3b82f6" },
  { id: "sosyal", name: "Sosyal Bilimler", total: 20, color: "#06b6d4" },
  { id: "fen", name: "Fen Bilimleri", total: 20, color: "#84cc16" },
];

const M = { id: "matematik", name: "Matematik", total: 40, color: "#3b82f6" };
const EDB = { id: "edebiyat", name: "Edebiyat", total: 24, color: "#ec4899" };
const TH1 = { id: "tarih1", name: "Tarih-1", total: 10, color: "#f97316" };
const CG1 = { id: "cografya1", name: "Coğrafya-1", total: 6, color: "#14b8a6" };

// AYT ders setleri lise bölümüne göre
export const AYT_BY_TRACK: Record<string, ExamSubject[]> = {
  MF: [
    M,
    { id: "fizik", name: "Fizik", total: 14, color: "#ef4444" },
    { id: "kimya", name: "Kimya", total: 13, color: "#10b981" },
    { id: "biyoloji", name: "Biyoloji", total: 13, color: "#a855f7" },
  ],
  TM: [M, EDB, TH1, CG1],
  Sozel: [
    EDB,
    TH1,
    CG1,
    { id: "tarih2", name: "Tarih-2", total: 11, color: "#fb923c" },
    { id: "cografya2", name: "Coğrafya-2", total: 11, color: "#2dd4bf" },
    { id: "felsefe", name: "Felsefe Grubu", total: 12, color: "#a78bfa" },
    { id: "din", name: "Din Kültürü", total: 6, color: "#fbbf24" },
  ],
  Dil: [],
};

export const YDT_SUBJECTS: ExamSubject[] = [
  { id: "ydt_ingilizce", name: "Yabancı Dil", total: 80, color: "#8b5cf6" },
];

export function examSubjects(
  examType: string,
  track: string | null,
): ExamSubject[] {
  if (examType === "TYT") return TYT_SUBJECTS;
  if (examType === "YDT") return YDT_SUBJECTS;
  // AYT — track'e göre; track yoksa MF (geriye dönük uyum)
  return AYT_BY_TRACK[track ?? "MF"] ?? AYT_BY_TRACK.MF;
}

// Onboarding/profil "güçlü/zayıf ders" öz-değerlendirmesi için ders listesi
// (lise bölümüne göre; TYT Türkçe herkeste ortak).
export const SELF_SUBJECTS_BY_TRACK: Record<string, { id: string; name: string }[]> = {
  MF: [
    { id: "matematik", name: "Matematik" },
    { id: "fizik", name: "Fizik" },
    { id: "kimya", name: "Kimya" },
    { id: "biyoloji", name: "Biyoloji" },
    { id: "turkce", name: "Türkçe" },
  ],
  TM: [
    { id: "matematik", name: "Matematik" },
    { id: "edebiyat", name: "Edebiyat" },
    { id: "tarih", name: "Tarih" },
    { id: "cografya", name: "Coğrafya" },
    { id: "turkce", name: "Türkçe" },
  ],
  Sozel: [
    { id: "edebiyat", name: "Edebiyat" },
    { id: "tarih", name: "Tarih" },
    { id: "cografya", name: "Coğrafya" },
    { id: "felsefe", name: "Felsefe" },
    { id: "din", name: "Din Kültürü" },
    { id: "turkce", name: "Türkçe" },
  ],
  Dil: [
    { id: "ingilizce", name: "Yabancı Dil" },
    { id: "turkce", name: "Türkçe" },
  ],
};

export function selfSubjects(track: string | null) {
  return SELF_SUBJECTS_BY_TRACK[track ?? "MF"] ?? SELF_SUBJECTS_BY_TRACK.MF;
}

// Bir ders bu lise bölümüne (track) görünür mü?
// Saf tracks-tabanlı: dersin `tracks` dizisi boşsa (TYT gibi) herkese açıktır;
// doluysa (AYT alan dersleri ve YDT → `{Dil}`) yalnızca o bölümdeki öğrenciye
// görünür. track bilinmiyorsa (onboarding öncesi) kısıtlama uygulanmaz.
// NOT: Eskiden yalnız AYT süzülüyordu; bu YDT (İngilizce) derslerinin tüm
// bölümlere sızmasına yol açıyordu. Artık karar tamamen `tracks` dizisine ait.
export function subjectForTrack(
  tracks: string[] | null | undefined,
  track: string | null,
): boolean {
  return !tracks?.length || !track || tracks.includes(track);
}

// Deneme listesinde kısa etiket + renk için (id -> {short, color})
export const SUBJECT_DISPLAY: Record<string, { short: string; color: string }> = {
  matematik: { short: "Mat", color: "#3b82f6" },
  fizik: { short: "Fiz", color: "#ef4444" },
  kimya: { short: "Kim", color: "#10b981" },
  biyoloji: { short: "Biy", color: "#a855f7" },
  turkce: { short: "Trk", color: "#f59e0b" },
  sosyal: { short: "Sos", color: "#06b6d4" },
  fen: { short: "Fen", color: "#84cc16" },
  edebiyat: { short: "Edb", color: "#ec4899" },
  tarih1: { short: "Tar1", color: "#f97316" },
  cografya1: { short: "Coğ1", color: "#14b8a6" },
  tarih2: { short: "Tar2", color: "#fb923c" },
  cografya2: { short: "Coğ2", color: "#2dd4bf" },
  felsefe: { short: "Fel", color: "#a78bfa" },
  din: { short: "Din", color: "#fbbf24" },
  ydt_ingilizce: { short: "Dil", color: "#8b5cf6" },
};
