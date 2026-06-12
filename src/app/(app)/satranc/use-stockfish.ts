"use client";

import { useEffect, useRef, useState, useCallback } from "react";
export type AIMove = {
  from: string;
  to: string;
  promotion?: string;
};

export function useStockfish(elo: number) {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const callbackRef = useRef<((move: AIMove | null) => void) | null>(null);

  useEffect(() => {
    // Create the worker
    const worker = new Worker("/stockfish.js");
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const msg = e.data;
      if (typeof msg === "string") {
        if (msg === "uciok") {
          setIsReady(true);
        } else if (msg.startsWith("bestmove")) {
          // bestmove e2e4 ponder e7e5
          const parts = msg.split(" ");
          const best = parts[1];
          if (best && best !== "(none)" && callbackRef.current) {
            const from = best.substring(0, 2);
            const to = best.substring(2, 4);
            const promotion = best.length > 4 ? best.substring(4, 5) : undefined;
            callbackRef.current({ from, to, promotion });
          } else if (callbackRef.current) {
            callbackRef.current(null);
          }
          setIsThinking(false);
        }
      }
    };

    worker.postMessage("uci");

    return () => {
      worker.terminate();
    };
  }, []);

  const evaluatePosition = useCallback(
    (fen: string, callback: (move: AIMove | null) => void) => {
      if (!workerRef.current || !isReady) return;

      setIsThinking(true);
      callbackRef.current = callback;

      const worker = workerRef.current;
      
      // Stop any current search
      worker.postMessage("stop");

      // Map ELO to Stockfish Skill Level (0-20)
      // Assuming ELO_MIN=400, ELO_MAX=2000
      // 400 -> Skill 0
      // 2000 -> Skill 20
      const skill = Math.max(0, Math.min(20, Math.round(((elo - 400) / 1600) * 20)));
      
      worker.postMessage(`setoption name Skill Level value ${skill}`);
      // Add some randomness/error for lower levels
      const depth = elo < 1000 ? 5 : elo < 1500 ? 10 : 15;
      const movetime = elo < 1000 ? 300 : elo < 1500 ? 600 : 1000;
      
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go depth ${depth} movetime ${movetime}`);
    },
    [elo, isReady]
  );

  return { isReady, isThinking, evaluatePosition };
}
