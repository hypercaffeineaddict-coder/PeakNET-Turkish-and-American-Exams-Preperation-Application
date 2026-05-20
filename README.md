# YKS App — MF AYT

MF AYT odaklı çalışma takip ve öğrenme platformu. Pomodoro, konular,
denemeler, yanlış defteri, AI öğretmen (Gemini), soru fotoğrafı çözücü, dil
öğrenme ve daha fazlası.

**Stack:** Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4,
Supabase (Auth + Postgres + Storage), Google Gemini (multimodal AI).

## ✨ Özellikler

- 5 adımlı onboarding (sınıf, hedef üniv., lise bölümü, sınav öğrencisi, dersler)
- MF AYT 68 konu (sınıfa göre gruplama, arama, filtre)
- Konu detayında: durum/güven yıldızı, kişisel notlar, çoklu kaynak türü (video,
  link, not, test, kitap, dosya)
- **Gemini multimodal**: AI öğretmen modu (serbest + PDF kaynak destekli),
  soru fotoğrafı çözücü, video viewer AI yardımcı drawer
- İnteraktif test runner — yanlışlar otomatik yanlış defterine
- Pomodoro: esnek süreler, focus müzik (Web Audio: brown/pink/white noise + binaural beats), browser notification, localStorage'da kalıcı
- Denemeler: TYT/AYT, canlı net hesabı (D-Y/4), SVG trend grafiği
- Yanlış defteri: **SM-2 spaced repetition**
- İstatistikler: 365 günlük heatmap, ders × süre donut, konu durumu, top yanlışlar, net trendi
- 4 dil öğrenme (JP/CN/FR/RU) — Web Speech API ile sesli pratik (native aksan)
- Sesli AI ders (TTS + STT, Chrome/Edge)
- PWA — ana ekrana ekle, standalone mod
- AI rate limit (günlük kota)

---

## 🚀 Yerel kurulum

### 1. Bağımlılıklar

```bash
npm install
```

### 2. Supabase projesi

1. https://supabase.com/dashboard → "New project"
2. Region: Central EU (Frankfurt) önerilir
3. Database password'ü kaydet
4. Proje açıldıktan sonra **Project Settings → API**'den şunları al:
   - `Project URL`
   - `Publishable / anon` key

### 3. Storage bucket

Supabase Dashboard → **Storage → New bucket**:
- Name: `resources`
- Public: **NO** (RLS koruması migration'da geliyor)
- File size limit: 50 MB
- Allowed MIME: `application/pdf, image/png, image/jpeg, image/webp, text/plain, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`

(Migration `0004_storage.sql` bunu otomatik kurmaya çalışır, ama bucket UI'dan açılırsa daha sağlam.)

### 4. Migration sırası

**Supabase → SQL Editor**'da sırayla çalıştır (her birinin başarılı dönmesini bekle):

```
supabase/migrations/0001_initial.sql              # Çekirdek tablolar + RLS + trigger
supabase/migrations/0002_seed_curriculum.sql      # MF AYT 4 ders + 68 konu seed
supabase/migrations/0003_onboarding.sql           # profiles ekstra alanlar
supabase/migrations/0004_storage.sql              # storage bucket + RLS (varsa)
supabase/migrations/0005_ai_rate_limit.sql        # AI kullanım sayacı + RPC
```

Her dosyanın içeriğini SQL editor'a yapıştırıp "Run" tıkla.

### 5. pgvector eklentisi

**Database → Extensions** → `vector` ara → toggle aç. (RAG için, future-proof.)

### 6. Auth ayarları

**Authentication → Providers → Email**:
- Geliştirme için "Confirm email"i kapatabilirsin (otomatik onaylanır)
- Prod'da açık tut

### 7. `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

# AI sağlayıcı — Gemini önerilir (hızlı + multimodal)
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-flash-latest

# Opsiyonel: günlük AI kotası (default 300)
AI_DAILY_LIMIT=300

# Ollama fallback (sadece Gemini yoksa kullanılır)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=qwen2.5:7b
```

**Gemini API key**: https://aistudio.google.com/apikey → Create API key. Ücretsiz kademe günlük 1500 istek yeterli.

### 8. Çalıştır

```bash
npm run dev
```

http://localhost:3000

---

## ☁️ Production deploy (Vercel)

### Hızlı kurulum

1. Repoyu GitHub'a push et
2. https://vercel.com/new → "Import" → repoyu seç
3. Environment Variables (Vercel UI):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (opsiyonel)
   - `AI_DAILY_LIMIT` (opsiyonel)
4. Deploy

### Önemli kontroller

- **Supabase Auth → URL Configuration**: production domain'ini `Site URL`'e ekle (örn. `https://yks-app.vercel.app`)
- **Email confirmation**: production'da AÇIK olmalı (spam koruması)
- **Storage RLS**: bucket policy'lerinin migration sonrası gerçekten aktif olduğunu kontrol et

### Custom domain

Vercel → Settings → Domains → bağla. Supabase Auth URL Configuration'a da ekle.

---

## 🔐 Güvenlik notları

- **Service role key asla frontend'e koyma.** Sadece backend script'lerinde kullan (zaten kullanılmıyor).
- **Anon key public sayılır** — RLS bütün koruması.
- **Storage**: bucket private; signed URL ile dosya verilir (1 saatlik geçerli).
- **AI rate limit**: günlük kullanıcı bazlı limit. Abuse durumunda Cloudflare/Vercel rate limit eklenebilir.

---

## 🛠️ Geliştirme

### Müfredat seed güncelleme

```bash
node scripts/generate-seed.mjs
```

`data/mf-ayt-curriculum.json`'u güncelleyince `supabase/migrations/0002_seed_curriculum.sql` yeniden üretilir. Sonra SQL Editor'da çalıştır.

### PWA ikonu

```bash
node scripts/generate-icons.mjs
```

`public/icon.svg` ve `public/icon-maskable.svg` üretilir. SVG kullandığımız için her boyutta keskin.

---

## 📂 Dizin yapısı

```
src/
├── app/                   # Next.js App Router rotaları
│   ├── (app)/             # Authenticated layout
│   │   ├── dashboard/
│   │   ├── konular/
│   │   ├── pomodoro/
│   │   ├── denemeler/
│   │   ├── yanlislar/
│   │   ├── coz/           # Soru fotoğrafı çözücü
│   │   ├── istatistikler/
│   │   ├── asistan/       # Genel AI asistan
│   │   ├── diller/
│   │   └── ayarlar/
│   ├── api/ai/            # AI route'ları (chat, solve, health)
│   ├── login, signup, onboarding/
│   ├── error.tsx, global-error.tsx
│   └── layout.tsx
├── components/            # Paylaşılan componentler
│   ├── voice-controls.tsx # Mic + TTS
│   ├── focus-player.tsx   # Web Audio noise/binaural
│   └── ...
├── lib/
│   ├── ai/                # Gemini + Ollama abstraction
│   ├── supabase/          # Client + middleware
│   └── resources.ts
└── data/                  # Statik veri (müfredat, üniversiteler, vb.)

supabase/migrations/       # SQL migration'ları
public/                    # Static dosyalar (manifest, ikonlar)
scripts/                   # Build/seed yardımcıları
```

---

## 📝 Lisans

Kişisel proje. Herkes fork edip kendi öğrencisi için özelleştirebilir.
