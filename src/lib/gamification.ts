import { createClient } from "@/lib/supabase/server";

// ---- Seviye hesabı ----
// Her seviye bir öncekinden biraz daha fazla XP ister.
// Toplam XP -> seviye: kümülatif eşikler.
export function levelForXp(totalXp: number): {
  level: number;
  current: number; // bu seviyedeki ilerleme
  needed: number; // bu seviyeyi bitirmek için gereken
  nextLevelXp: number; // toplamda bir sonraki seviyeye gereken XP
} {
  let level = 1;
  let remaining = Math.max(0, totalXp);
  // Seviye N'i bitirmek için gereken XP: 100 * N (artan)
  let need = 100;
  while (remaining >= need) {
    remaining -= need;
    level++;
    need = 100 * level;
  }
  return {
    level,
    current: remaining,
    needed: need,
    nextLevelXp: need - remaining,
  };
}

// Streak okuma-zamanı düzeltmesi.
// `touch_streak` RPC streak'i YALNIZCA çalışılınca günceller; çalışılmayan
// günlerde depolanan current_streak bayat kalır (ör. 2 gün çalışmasan da 1
// görünür). Gerçek streak'i son çalışma gününe göre hesapla: bugün veya dün
// çalışılmışsa canlı, 2+ gün geçmişse kopmuş (0).
export function effectiveStreak(
  streak?: { current_streak?: number | null; last_study_date?: string | null } | null,
): number {
  const cur = streak?.current_streak ?? 0;
  const last = streak?.last_study_date;
  if (!cur || !last) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = new Date(`${last}T00:00:00`);
  if (Number.isNaN(lastDate.getTime())) return cur;
  lastDate.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - lastDate.getTime()) / 86400000);
  // bugün (0) veya dün (1) → canlı; 2+ gün → kopmuş. Negatif (tz) → canlı say.
  return diffDays <= 1 ? cur : 0;
}

// Bugün çalışıldı mı? (streak hatırlatması için)
export function studiedToday(
  streak?: { last_study_date?: string | null } | null,
): boolean {
  const last = streak?.last_study_date;
  if (!last) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = new Date(`${last}T00:00:00`);
  if (Number.isNaN(lastDate.getTime())) return false;
  lastDate.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - lastDate.getTime()) / 86400000) === 0;
}

// XP ödülleri (sabit)
export const XP = {
  pomodoro: 15, // her tamamlanan pomodoro
  topicDone: 25, // konu "bitti" işaretlenince
  testCorrect: 4, // test/tarama doğru cevap başına
  testComplete: 10, // bir testi bitirme bonusu
  mistakeReview: 5, // yanlış tekrarı
  examAdded: 30, // deneme ekleme
  dailyStreak: 20, // streak gününe ekleme
} as const;

// Server: XP ver (RPC)
export async function awardXp(amount: number, reason: string): Promise<number> {
  if (!amount || amount <= 0) return 0;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("award_xp", {
      p_amount: amount,
      p_reason: reason,
    });
    if (error) {
      console.warn("award_xp hata:", error.message);
      return 0;
    }
    return (data as number) ?? 0;
  } catch (err) {
    console.warn("award_xp exception:", err);
    return 0;
  }
}

// ---- Rozet tanımları (statik) ----
export type BadgeDef = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  // stats üzerinden kazanıldı mı?
  earned: (s: BadgeStats) => boolean;
  // ilerleme (0-1) — kilitliyken göstermek için
  progress?: (s: BadgeStats) => number;
};

export type BadgeStats = {
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  totalMinutes: number;
  topicsDone: number;
  examsCount: number;
  bestNet: number;
  mistakesReviewed: number; // repetitions toplamı
};

export const BADGES: BadgeDef[] = [
  {
    id: "first_step",
    emoji: "👣",
    name: "İlk Adım",
    description: "İlk çalışma seansını tamamla",
    earned: (s) => s.totalSessions >= 1,
    progress: (s) => Math.min(1, s.totalSessions / 1),
  },
  {
    id: "streak_7",
    emoji: "🔥",
    name: "Alev Aldı",
    description: "7 gün üst üste çalış",
    earned: (s) => s.longestStreak >= 7,
    progress: (s) => Math.min(1, s.longestStreak / 7),
  },
  {
    id: "streak_30",
    emoji: "🌋",
    name: "Volkan",
    description: "30 gün streak",
    earned: (s) => s.longestStreak >= 30,
    progress: (s) => Math.min(1, s.longestStreak / 30),
  },
  {
    id: "marathon",
    emoji: "⏱️",
    name: "Maratoncu",
    description: "Toplam 1000 dakika çalış",
    earned: (s) => s.totalMinutes >= 1000,
    progress: (s) => Math.min(1, s.totalMinutes / 1000),
  },
  {
    id: "topic_10",
    emoji: "✅",
    name: "Yol Alıyor",
    description: "10 konu bitir",
    earned: (s) => s.topicsDone >= 10,
    progress: (s) => Math.min(1, s.topicsDone / 10),
  },
  {
    id: "topic_50",
    emoji: "🏔️",
    name: "Zirveye Tırmanış",
    description: "50 konu bitir",
    earned: (s) => s.topicsDone >= 50,
    progress: (s) => Math.min(1, s.topicsDone / 50),
  },
  {
    id: "exam_5",
    emoji: "🧪",
    name: "Deneme Avcısı",
    description: "5 deneme gir",
    earned: (s) => s.examsCount >= 5,
    progress: (s) => Math.min(1, s.examsCount / 5),
  },
  {
    id: "net_50",
    emoji: "🎯",
    name: "Net Avcısı",
    description: "Bir denemede 50+ net yap",
    earned: (s) => s.bestNet >= 50,
    progress: (s) => Math.min(1, s.bestNet / 50),
  },
  {
    id: "level_5",
    emoji: "⭐",
    name: "Yükseliş",
    description: "5. seviyeye ulaş",
    earned: (s) => s.level >= 5,
    progress: (s) => Math.min(1, s.level / 5),
  },
  {
    id: "level_10",
    emoji: "💎",
    name: "Elmas",
    description: "10. seviyeye ulaş",
    earned: (s) => s.level >= 10,
    progress: (s) => Math.min(1, s.level / 10),
  },
  {
    id: "reviewer",
    emoji: "📖",
    name: "Tekrarcı",
    description: "Yanlış defterinde 50 tekrar yap",
    earned: (s) => s.mistakesReviewed >= 50,
    progress: (s) => Math.min(1, s.mistakesReviewed / 50),
  },
  {
    id: "xp_1000",
    emoji: "🚀",
    name: "Roket",
    description: "1000 XP topla",
    earned: (s) => s.totalXp >= 1000,
    progress: (s) => Math.min(1, s.totalXp / 1000),
  },
];
