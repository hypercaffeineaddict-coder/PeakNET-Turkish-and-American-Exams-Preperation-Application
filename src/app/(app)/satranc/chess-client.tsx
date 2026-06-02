"use client";

import { useEffect, useMemo, useState } from "react";
import { Chess, type Move } from "chess.js";
import {
  Crown,
  RotateCcw,
  Flag,
  Brain,
  Circle,
} from "lucide-react";
import { pickMove } from "@/lib/chess-ai";

const START_FEN = new Chess().fen();
const STORE_KEY = "peaknet-chess-v1";

// Dolu glifleri her iki renk için kullan, rengi CSS ile ver → tema-bağımsız, net.
const GLYPH: Record<string, string> = {
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

type Color = "w" | "b";
type HalfMove = { san: string; fen: string; from: string; to: string };
type Saved = {
  elo: number;
  humanColor: Color;
  fen: string;
  history: HalfMove[];
  lastMove: { from: string; to: string } | null;
  resigned: boolean;
};

const ELO_MIN = 400;
const ELO_MAX = 2000;
function eloTier(elo: number): string {
  if (elo < 700) return "Acemi";
  if (elo < 1000) return "Başlangıç";
  if (elo < 1300) return "Orta";
  if (elo < 1600) return "İyi";
  if (elo < 1900) return "Usta";
  return "Büyük usta";
}

function materialDiff(chess: Chess): number {
  const V: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let w = 0;
  let b = 0;
  for (const row of chess.board()) {
    for (const sq of row) {
      if (!sq) continue;
      if (sq.color === "w") w += V[sq.type];
      else b += V[sq.type];
    }
  }
  return w - b;
}

export function ChessClient() {
  const [elo, setElo] = useState(1000);
  const [humanColor, setHumanColor] = useState<Color>("w");
  const [fen, setFen] = useState(START_FEN);
  const [history, setHistory] = useState<HalfMove[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [resigned, setResigned] = useState(false);
  const [promotion, setPromotion] = useState<{ from: string; to: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const chess = useMemo(() => new Chess(fen), [fen]);
  const turn = chess.turn();
  const gameOver = resigned || chess.isGameOver();
  const isHumanTurn = !gameOver && turn === humanColor && !thinking && !promotion;

  // localStorage'tan yükle (mount sonrası → hidrasyon uyumsuzluğu yok)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Saved;
        if (s.fen) {
          setElo(s.elo ?? 1000);
          setHumanColor(s.humanColor ?? "w");
          setFen(s.fen);
          setHistory(s.history ?? []);
          setLastMove(s.lastMove ?? null);
          setResigned(s.resigned ?? false);
        }
      }
    } catch {
      /* yok say */
    }
    setLoaded(true);
  }, []);

  // Değişiklikleri kaydet
  useEffect(() => {
    if (!loaded) return;
    const s: Saved = { elo, humanColor, fen, history, lastMove, resigned };
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(s));
    } catch {
      /* yok say */
    }
  }, [loaded, elo, humanColor, fen, history, lastMove, resigned]);

  // Bir hamleyi uygula (insan veya AI). `c` zaten hamlesi yapılmış Chess örneği.
  function commit(c: Chess, from: string, to: string) {
    const h = c.history();
    const san = h[h.length - 1] ?? "";
    const nextFen = c.fen();
    setFen(nextFen);
    setHistory((prev) => [...prev, { san, fen: nextFen, from, to }]);
    setLastMove({ from, to });
    setSelected(null);
  }

  function tryHumanMove(from: string, to: string, promo?: string) {
    const c = new Chess(fen);
    try {
      c.move({ from, to, promotion: promo as "q" | "r" | "b" | "n" | undefined });
    } catch {
      return false;
    }
    commit(c, from, to);
    return true;
  }

  // AI sırası gelince oyna
  useEffect(() => {
    if (!loaded || gameOver) return;
    if (turn === humanColor) return;
    setThinking(true);
    const t = setTimeout(() => {
      const mv = pickMove(fen, elo);
      if (mv) {
        const c = new Chess(fen);
        try {
          c.move({ from: mv.from, to: mv.to, promotion: mv.promotion as "q" | "r" | "b" | "n" | undefined });
          commit(c, mv.from, mv.to);
        } catch {
          /* yok say */
        }
      }
      setThinking(false);
    }, 350);
    return () => {
      clearTimeout(t);
      setThinking(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, humanColor, gameOver, loaded, elo]);

  // Seçili kareden legal hedefler
  const targets = useMemo(() => {
    if (!selected || !isHumanTurn) return [] as Move[];
    return chess.moves({ square: selected as never, verbose: true }) as Move[];
  }, [selected, isHumanTurn, chess]);
  const targetSet = useMemo(() => new Set<string>(targets.map((m) => m.to)), [targets]);

  function onSquareClick(square: string, piece: { type: string; color: Color } | null) {
    if (!isHumanTurn) return;
    if (selected) {
      if (square === selected) {
        setSelected(null);
        return;
      }
      if (targetSet.has(square)) {
        const promo = targets.filter((m) => m.to === square && m.promotion);
        if (promo.length > 0) {
          setPromotion({ from: selected, to: square });
          return;
        }
        tryHumanMove(selected, square);
        return;
      }
      // başka kendi taşına tıklarsa yeniden seç
      if (piece && piece.color === humanColor) {
        setSelected(square);
        return;
      }
      setSelected(null);
      return;
    }
    if (piece && piece.color === humanColor) setSelected(square);
  }

  function choosePromotion(p: "q" | "r" | "b" | "n") {
    if (!promotion) return;
    tryHumanMove(promotion.from, promotion.to, p);
    setPromotion(null);
  }

  function newGame(color: Color | "random") {
    const c = color === "random" ? (Math.random() < 0.5 ? "w" : "b") : color;
    setHumanColor(c);
    setFen(START_FEN);
    setHistory([]);
    setLastMove(null);
    setSelected(null);
    setResigned(false);
    setPromotion(null);
    setThinking(false);
  }

  function undo() {
    if (thinking) return;
    const n = history.slice();
    // İnsanın sırası gelene kadar yarım hamleleri geri al
    while (n.length) {
      n.pop();
      const f = n.length ? n[n.length - 1].fen : START_FEN;
      if (new Chess(f).turn() === humanColor) break;
    }
    const f = n.length ? n[n.length - 1].fen : START_FEN;
    setHistory(n);
    setFen(f);
    setLastMove(n.length ? { from: n[n.length - 1].from, to: n[n.length - 1].to } : null);
    setSelected(null);
    setResigned(false);
  }

  // Durum metni
  const status = (() => {
    if (resigned) return { text: "Terk ettin — yapay zeka kazandı.", tone: "lose" as const };
    if (chess.isCheckmate()) {
      const winner: Color = turn === "w" ? "b" : "w";
      return winner === humanColor
        ? { text: "Şah mat! Kazandın 🎉", tone: "win" as const }
        : { text: "Şah mat — kaybettin.", tone: "lose" as const };
    }
    if (chess.isStalemate()) return { text: "Pat — berabere.", tone: "draw" as const };
    if (chess.isThreefoldRepetition()) return { text: "Üç kez tekrar — berabere.", tone: "draw" as const };
    if (chess.isInsufficientMaterial()) return { text: "Yetersiz materyal — berabere.", tone: "draw" as const };
    if (chess.isDraw()) return { text: "Berabere (50 hamle).", tone: "draw" as const };
    if (chess.isCheck()) return { text: "Şah!", tone: "check" as const };
    return null;
  })();

  // Tahta yönelimi: insan beyazsa rank8 üstte; siyahsa ters çevir.
  const board = chess.board(); // [rank8..rank1][a..h]
  const rows = humanColor === "w" ? board : board.slice().reverse().map((r) => r.slice().reverse());
  const ranks = humanColor === "w" ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  const files = humanColor === "w" ? ["a", "b", "c", "d", "e", "f", "g", "h"] : ["h", "g", "f", "e", "d", "c", "b", "a"];

  const mat = materialDiff(chess);
  const checkSquare = chess.isCheck()
    ? (() => {
        for (const row of board) for (const sq of row) if (sq && sq.type === "k" && sq.color === turn) return sq.square;
        return null;
      })()
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* Tahta */}
      <div>
        <div className="relative mx-auto w-full max-w-[560px]">
          {/* Ahşap/menekşe çerçeve */}
          <div
            className="rounded-2xl p-2.5 shadow-pop sm:p-3.5"
            style={{ background: "linear-gradient(150deg, #4a3a6e 0%, #2a1f44 100%)" }}
          >
            <div
              className="grid grid-cols-8 overflow-hidden rounded-lg"
              style={{ aspectRatio: "1 / 1", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.4)" }}
            >
              {rows.map((row, ri) =>
                row.map((sq, fi) => {
                  const file = files[fi];
                  const rank = ranks[ri];
                  const square = `${file}${rank}`;
                  const isLight = (ri + fi) % 2 === 0;
                  const isSel = selected === square;
                  const isTarget = targetSet.has(square);
                  const isCapture = isTarget && !!sq;
                  const isLast = lastMove && (lastMove.from === square || lastMove.to === square);
                  const isCheck = checkSquare === square;
                  const labelColor = isLight ? "#7C66A8" : "#EDE7F6";
                  return (
                    <button
                      key={square}
                      type="button"
                      onClick={() => onSquareClick(square, sq ? { type: sq.type, color: sq.color } : null)}
                      className="relative flex aspect-square items-center justify-center"
                      style={{
                        backgroundColor: isLight ? "#EDE7F6" : "#7C66A8",
                        cursor: isHumanTurn ? "pointer" : "default",
                      }}
                      aria-label={square}
                    >
                      {/* son hamle vurgusu */}
                      {isLast && (
                        <span
                          className="pointer-events-none absolute inset-0"
                          style={{ backgroundColor: "rgba(250,204,21,.40)" }}
                        />
                      )}
                      {/* seçili kare */}
                      {isSel && (
                        <span
                          className="pointer-events-none absolute inset-0"
                          style={{
                            boxShadow: "inset 0 0 0 3px var(--primary)",
                            backgroundColor: "rgba(139,92,246,.28)",
                          }}
                        />
                      )}
                      {/* şah glow */}
                      {isCheck && (
                        <span
                          className="pointer-events-none absolute inset-0"
                          style={{
                            background:
                              "radial-gradient(circle, rgba(239,68,68,.9) 0%, rgba(239,68,68,.12) 72%)",
                          }}
                        />
                      )}
                      {/* koordinat etiketleri (kenar kareler) */}
                      {fi === 0 && (
                        <span
                          className="pointer-events-none absolute left-[3px] top-[1px] text-[9px] font-bold"
                          style={{ color: labelColor }}
                        >
                          {rank}
                        </span>
                      )}
                      {ri === 7 && (
                        <span
                          className="pointer-events-none absolute bottom-0 right-[3px] text-[9px] font-bold"
                          style={{ color: labelColor }}
                        >
                          {file}
                        </span>
                      )}
                      {/* legal hedef göstergesi */}
                      {isTarget && !sq && (
                        <span
                          className="pointer-events-none absolute rounded-full"
                          style={{ height: "30%", width: "30%", backgroundColor: "rgba(20,12,30,.26)" }}
                        />
                      )}
                      {isCapture && (
                        <span
                          className="pointer-events-none absolute inset-[7%] rounded-full"
                          style={{ boxShadow: "inset 0 0 0 4px rgba(20,12,30,.26)" }}
                        />
                      )}
                      {/* taş */}
                      {sq && (
                        <span
                          className="relative z-[1] select-none leading-none"
                          style={{
                            fontSize: "min(8.4vw, 48px)",
                            color: sq.color === "w" ? "#FBFAFF" : "#221A33",
                            WebkitTextStroke:
                              sq.color === "w" ? "0.7px #2A2140" : "0.7px #B9A7E0",
                            filter: "drop-shadow(0 2px 1.5px rgba(0,0,0,.4))",
                          }}
                        >
                          {GLYPH[sq.type]}
                        </span>
                      )}
                    </button>
                  );
                }),
              )}
            </div>
          </div>

          {/* Oyun bitti afişi */}
          {gameOver && status && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <div
                className={`rounded-2xl border px-6 py-4 text-center shadow-pop backdrop-blur-md ${
                  status.tone === "win"
                    ? "border-emerald-400/50 bg-emerald-500/20"
                    : status.tone === "lose"
                      ? "border-rose-400/50 bg-rose-500/20"
                      : "border-border bg-card/80"
                }`}
              >
                <div className="font-display text-lg font-bold">{status.text}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Yeni oyun için yandaki butonları kullan
                </div>
              </div>
            </div>
          )}

          {/* Terfi seçici */}
          {promotion && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
              <div className="flex gap-2 rounded-2xl border border-border bg-card p-3 shadow-pop">
                {(["q", "r", "b", "n"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => choosePromotion(p)}
                    className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-muted/40 text-4xl leading-none transition hover:border-primary hover:bg-primary/10"
                    style={{ color: "#181022" }}
                    aria-label={p}
                  >
                    {GLYPH[p]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Durum çubuğu */}
        <div className="mx-auto mt-3 flex max-w-[560px] items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            {thinking ? (
              <span className="flex items-center gap-1.5 text-primary">
                <Brain size={15} className="animate-pulse" /> Yapay zeka düşünüyor…
              </span>
            ) : status ? (
              <span
                className={
                  status.tone === "win"
                    ? "font-semibold text-emerald-500"
                    : status.tone === "lose"
                      ? "font-semibold text-rose-500"
                      : status.tone === "check"
                        ? "font-medium text-amber-500"
                        : "text-muted-foreground"
                }
              >
                {status.text}
              </span>
            ) : (
              <span className="text-muted-foreground">
                Sıra: {turn === humanColor ? "sende" : "yapay zekada"}
              </span>
            )}
          </div>
          {mat !== 0 && (
            <span className="tabular-nums text-xs text-muted-foreground">
              Materyal {mat > 0 ? "+" : ""}{mat} {mat > 0 ? "(beyaz)" : "(siyah)"}
            </span>
          )}
        </div>
      </div>

      {/* Yan panel */}
      <div className="space-y-4">
        {/* Güç ayarı */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Zorluk (ELO)</span>
            <span className="font-display text-sm font-bold tabular-nums text-primary">
              {elo} · {eloTier(elo)}
            </span>
          </div>
          <input
            type="range"
            min={ELO_MIN}
            max={ELO_MAX}
            step={100}
            value={elo}
            onChange={(e) => setElo(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--primary)]"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Sonraki hamlelerden itibaren geçerli. Düşük seviye daha çok hata yapar.
          </p>
        </div>

        {/* Oyun kontrolleri */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-sm font-medium">Yeni oyun</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => newGame("w")}
              className="rounded-xl border border-border bg-muted/30 px-2 py-2 text-xs font-medium transition hover:border-primary hover:bg-primary/10"
            >
              Beyaz oyna
            </button>
            <button
              type="button"
              onClick={() => newGame("b")}
              className="rounded-xl border border-border bg-muted/30 px-2 py-2 text-xs font-medium transition hover:border-primary hover:bg-primary/10"
            >
              Siyah oyna
            </button>
            <button
              type="button"
              onClick={() => newGame("random")}
              className="rounded-xl border border-border bg-muted/30 px-2 py-2 text-xs font-medium transition hover:border-primary hover:bg-primary/10"
            >
              Rastgele
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={history.length === 0 || thinking}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-2 py-2 text-xs font-medium transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={14} /> Geri al
            </button>
            <button
              type="button"
              onClick={() => setResigned(true)}
              disabled={gameOver}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-2 py-2 text-xs font-medium transition hover:border-rose-500 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Flag size={14} /> Terk et
            </button>
          </div>
        </div>

        {/* Hamle geçmişi */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Circle size={8} className="fill-primary text-primary" /> Hamleler
          </div>
          <div className="mt-2 max-h-64 overflow-y-auto pr-1">
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground">Henüz hamle yok. İyi oyunlar!</p>
            ) : (
              <ol className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-0.5 text-sm tabular-nums">
                {Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => (
                  <li key={i} className="contents">
                    <span className="text-right text-xs text-muted-foreground">{i + 1}.</span>
                    <span>{history[i * 2]?.san ?? ""}</span>
                    <span className="text-muted-foreground">{history[i * 2 + 1]?.san ?? ""}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
