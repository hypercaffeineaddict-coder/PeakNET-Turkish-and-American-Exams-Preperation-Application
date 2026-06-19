"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0b",
          color: "#fafafa",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 28 * 16,
            border: "1px solid #27272a",
            borderRadius: 16,
            padding: 32,
            textAlign: "center",
            background: "#111113",
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
            Kritik hata
          </h1>
          <p style={{ marginTop: 8, color: "#a1a1aa", fontSize: 14 }}>
            Uygulama çalıştırılırken bir sorun oluştu.
          </p>
          {error.message && (
            <pre
              style={{
                background: "#18181b",
                padding: 10,
                borderRadius: 6,
                margin: "12px 0",
                fontSize: 12,
                textAlign: "left",
                whiteSpace: "pre-wrap",
              }}
            >
              {error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "8px 16px",
              fontWeight: 500,
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  );
}
