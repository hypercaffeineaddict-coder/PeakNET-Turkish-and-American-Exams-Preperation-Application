// Khan tarzı ustalık (mastery) hesabı.
// Mevcut sinyallerden konu bazlı ustalık seviyesi üretir:
//   - topic_progress.confidence (0-5)  → ana sürücü
//   - topic_progress.status             → in_progress / done bonusu
//   - çalışma süresi (dakika)           → küçük bonus
//   - açık yanlış sayısı                → ceza

export type MasteryLevel = 0 | 1 | 2 | 3 | 4;

export type MasteryInfo = {
  score: number; // 0-100
  level: MasteryLevel;
  label: string;
  color: string; // hex
};

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  0: "Başlanmadı",
  1: "Denendi",
  2: "Aşina",
  3: "Yetkin",
  4: "Usta",
};

export const MASTERY_COLORS: Record<MasteryLevel, string> = {
  0: "#6b7280", // gri
  1: "#f59e0b", // amber
  2: "#0ea5e9", // sky
  3: "#8b5cf6", // violet
  4: "#10b981", // emerald
};

export type MasterySignals = {
  status?: string; // not_started | in_progress | done
  confidence?: number; // 0-5
  studyMinutes?: number;
  openMistakes?: number;
};

export function computeMastery(s: MasterySignals): MasteryInfo {
  const status = s.status ?? "not_started";
  const confidence = Math.max(0, Math.min(5, s.confidence ?? 0));
  const studyMinutes = Math.max(0, s.studyMinutes ?? 0);
  const openMistakes = Math.max(0, s.openMistakes ?? 0);

  // Hiç dokunulmamış konu → seviye 0
  if (status === "not_started" && confidence === 0 && studyMinutes === 0) {
    return level(0, 0);
  }

  let score = (confidence / 5) * 70; // 0-70
  if (status === "in_progress") score += 5;
  else if (status === "done") score += 15;
  score += Math.min(studyMinutes / 60, 1) * 10; // 0-10
  score -= Math.min(openMistakes * 5, 20); // ceza
  score = Math.max(0, Math.min(100, Math.round(score)));

  let lvl: MasteryLevel;
  if (score < 20) lvl = 1;
  else if (score < 50) lvl = 2;
  else if (score < 80) lvl = 3;
  else lvl = 4;

  return level(lvl, score);
}

function level(lvl: MasteryLevel, score: number): MasteryInfo {
  return {
    score,
    level: lvl,
    label: MASTERY_LABELS[lvl],
    color: MASTERY_COLORS[lvl],
  };
}
