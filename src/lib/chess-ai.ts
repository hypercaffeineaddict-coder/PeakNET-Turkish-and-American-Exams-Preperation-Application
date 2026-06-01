// Basit ama makul oynayan satranç motoru (alpha-beta negamax + konum tabloları).
// Gerçek bir ELO derecesi vermez; "ayarlanabilir güç"ü ELO etiketli bir kaydırıcıya
// eşler: düşük ELO → sığ arama + sık hata (blunder), yüksek ELO → derin arama + az hata.
//
// Yanıt süresi GARANTİSİ: iteratif derinleşme + duvar-saati bütçesi. Pozisyon ne
// kadar karmaşık olursa olsun hamle ~1 sn içinde döner (UI donmaz). Bütçe dolunca
// son TAMAMLANAN derinliğin sonucu kullanılır.

import { Chess, type Move } from "chess.js";

const VALUE: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
const MATE = 1_000_000;

// Konum tabloları (beyaz perspektifi, a8..h1; index = rank*8 + file). Orta oyun.
const PST: Record<string, number[]> = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
   -50,-40,-30,-30,-30,-30,-40,-50,
   -40,-20,  0,  0,  0,  0,-20,-40,
   -30,  0, 10, 15, 15, 10,  0,-30,
   -30,  5, 15, 20, 20, 15,  5,-30,
   -30,  0, 15, 20, 20, 15,  0,-30,
   -30,  5, 10, 15, 15, 10,  5,-30,
   -40,-20,  0,  5,  5,  0,-20,-40,
   -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
   -20,-10,-10,-10,-10,-10,-10,-20,
   -10,  0,  0,  0,  0,  0,  0,-10,
   -10,  0,  5, 10, 10,  5,  0,-10,
   -10,  5,  5, 10, 10,  5,  5,-10,
   -10,  0, 10, 10, 10, 10,  0,-10,
   -10, 10, 10, 10, 10, 10, 10,-10,
   -10,  5,  0,  0,  0,  0,  5,-10,
   -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
   -20,-10,-10, -5, -5,-10,-10,-20,
   -10,  0,  0,  0,  0,  0,  0,-10,
   -10,  0,  5,  5,  5,  5,  0,-10,
    -5,  0,  5,  5,  5,  5,  0, -5,
     0,  0,  5,  5,  5,  5,  0, -5,
   -10,  5,  5,  5,  5,  5,  0,-10,
   -10,  0,  5,  0,  0,  0,  0,-10,
   -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
   -30,-40,-40,-50,-50,-40,-40,-30,
   -30,-40,-40,-50,-50,-40,-40,-30,
   -30,-40,-40,-50,-50,-40,-40,-30,
   -30,-40,-40,-50,-50,-40,-40,-30,
   -20,-30,-30,-40,-40,-30,-30,-20,
   -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20,
  ],
};

// Yaprak değerlendirme: yalnız materyal + PST (pahalı terminal kontrolü YOK).
// Sıradaki oyuncunun perspektifinden (negamax).
function evalPos(chess: Chess): number {
  let score = 0;
  const board = chess.board(); // [rank8..rank1][a..h]
  for (let r = 0; r < 8; r++) {
    const row = board[r];
    for (let f = 0; f < 8; f++) {
      const sq = row[f];
      if (!sq) continue;
      const idx = r * 8 + f;
      const pst = sq.color === "w" ? PST[sq.type][idx] : PST[sq.type][(7 - r) * 8 + f];
      const val = VALUE[sq.type] + pst;
      score += sq.color === "w" ? val : -val;
    }
  }
  return chess.turn() === "w" ? score : -score;
}

// Hamle sıralama: önce taş yiyenler (MVV-LVA benzeri) → alpha-beta budamasını hızlandırır.
function orderMoves(moves: Move[]): Move[] {
  return moves.slice().sort((a, b) => {
    const ca = a.captured ? VALUE[a.captured] - VALUE[a.piece] / 10 : 0;
    const cb = b.captured ? VALUE[b.captured] - VALUE[b.piece] / 10 : 0;
    return cb - ca;
  });
}

class Timeout extends Error {}
let deadline = 0;

function negamax(chess: Chess, depth: number, alpha: number, beta: number, ply: number): number {
  if (performance.now() > deadline) throw new Timeout();
  const moves = chess.moves({ verbose: true }) as Move[];
  if (moves.length === 0) {
    // Hamle yoksa: şah altındaysa mat (sıradaki kaybeder), değilse pat (berabere).
    return chess.isCheck() ? -(MATE - ply) : 0;
  }
  if (depth === 0) return evalPos(chess);
  let best = -Infinity;
  for (const m of orderMoves(moves)) {
    chess.move(m);
    const score = -negamax(chess, depth - 1, -beta, -alpha, ply + 1);
    chess.undo();
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

// ELO → maksimum derinlik, zaman bütçesi (ms), hata olasılığı, "yeterince iyi" marjı.
function tuning(elo: number): { maxDepth: number; budget: number; blunder: number; margin: number } {
  if (elo < 700) return { maxDepth: 1, budget: 150, blunder: 0.45, margin: 200 };
  if (elo < 1000) return { maxDepth: 2, budget: 250, blunder: 0.3, margin: 140 };
  if (elo < 1300) return { maxDepth: 2, budget: 400, blunder: 0.18, margin: 100 };
  if (elo < 1600) return { maxDepth: 3, budget: 550, blunder: 0.08, margin: 60 };
  if (elo < 1900) return { maxDepth: 3, budget: 700, blunder: 0.03, margin: 35 };
  return { maxDepth: 4, budget: 900, blunder: 0, margin: 15 };
}

export type AIMove = { from: string; to: string; promotion?: string };

// Verilen FEN için motorun seçtiği hamleyi döndürür. ELO kaydırıcısına göre güç ayarlı.
export function pickMove(fen: string, elo: number): AIMove | null {
  const chess = new Chess(fen);
  const legal = chess.moves({ verbose: true }) as Move[];
  if (legal.length === 0) return null;

  const { maxDepth, budget, blunder, margin } = tuning(elo);

  // Hata simülasyonu: bazen tamamen rastgele oyna (zayıf seviyelerde sık).
  if (Math.random() < blunder) {
    const m = legal[Math.floor(Math.random() * legal.length)];
    return { from: m.from, to: m.to, promotion: m.promotion };
  }

  // İteratif derinleşme: derinlik 1, 2, ... maxDepth. Her tur tüm kök hamleleri
  // TAM pencereyle (doğru skor → marj seçimi anlamlı) değerlendirir. Bütçe dolunca
  // son tamamlanan turun sonucu kullanılır.
  deadline = performance.now() + budget;
  let ordered = orderMoves(legal);
  let scored: { move: Move; score: number }[] = ordered.map((move) => ({ move, score: 0 }));

  for (let d = 1; d <= maxDepth; d++) {
    try {
      const res: { move: Move; score: number }[] = [];
      for (const m of ordered) {
        chess.move(m);
        const score = -negamax(chess, d - 1, -Infinity, Infinity, 1);
        chess.undo();
        res.push({ move: m, score });
      }
      res.sort((a, b) => b.score - a.score);
      scored = res;
      ordered = res.map((r) => r.move); // PV sıralaması → sonraki tur daha iyi budar
    } catch (e) {
      if (e instanceof Timeout) break;
      throw e;
    }
  }

  const bestScore = scored[0].score;
  // En iyiye "margin" kadar yakın hamleler arasından rastgele seç (çeşitlilik +
  // insansı kusur). Yüksek ELO'da margin küçük → neredeyse hep en iyi hamle.
  const pool = scored.filter((s) => bestScore - s.score <= margin);
  const chosen = pool[Math.floor(Math.random() * pool.length)].move;
  return { from: chosen.from, to: chosen.to, promotion: chosen.promotion };
}
