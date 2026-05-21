// YKS 2026 tarihleri (ÖSYM takvimi — gerekirse güncelle).
// TYT: 20 Haziran 2026, AYT: 21 Haziran 2026 (tahmini/örnek).
export const YKS_DATES = {
  TYT: new Date("2026-06-20T10:15:00+03:00"),
  AYT: new Date("2026-06-21T10:15:00+03:00"),
};

// Ana geri sayım için TYT (ilk oturum) baz alınır.
export const PRIMARY_EXAM_DATE = YKS_DATES.TYT;

export function daysUntil(date: Date, from: Date = new Date()): number {
  const a = new Date(date);
  a.setHours(0, 0, 0, 0);
  const b = new Date(from);
  b.setHours(0, 0, 0, 0);
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}
