// Tüm uygulama sayfaları için ortak yükleme iskeleti (App Router segment loading).
// Sunucu verisi gelene kadar gösterilir — algılanan hızı artırır.
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6">
      {/* Başlık */}
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-muted" />
        <div className="h-4 w-80 max-w-full rounded bg-muted/70" />
      </div>

      {/* Stat kartları */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="mt-3 h-7 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* İçerik blokları */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-muted/70" />
              <div className="h-3 w-5/6 rounded bg-muted/70" />
              <div className="h-3 w-4/6 rounded bg-muted/70" />
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Yükleniyor…</span>
    </div>
  );
}
