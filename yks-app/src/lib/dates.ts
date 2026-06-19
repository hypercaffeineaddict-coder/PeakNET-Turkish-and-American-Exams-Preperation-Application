// Tarih yardımcıları (timezone-safe).
//
// SORUN: `new Date().toISOString().slice(0, 10)` UTC tarih döner. TR (+03:00)
// kullanıcısı için 00:00-03:00 yerel saatlerinde UTC "dün" verir → date
// kolonlarına yanlış gün yazılır, "bugün" filtreleri kayar, kart tekrar
// programları bir gün sapar.
//
// ÇÖZÜM: Yerel YYYY-MM-DD üreten helper. Tüm date kolonu I/O'su ve "bugün"
// karşılaştırmaları bunu kullanmalı. (timestamptz kolonları için ISO ham
// formu hâlâ doğrudur.)

export function localDate(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
