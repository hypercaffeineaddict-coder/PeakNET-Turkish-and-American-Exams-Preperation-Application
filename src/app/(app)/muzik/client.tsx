"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Search, Loader2, Play, Pause, ExternalLink, LogOut, Music2 } from "lucide-react";
import { toast } from "sonner";
import {
  beginSpotifyAuth,
  exchangeCode,
  isConnected,
  disconnectSpotify,
  getAccessToken,
  spotifyApi,
  type SpotifyTrack,
} from "@/lib/spotify";

declare global {
  interface Window {
    Spotify?: any;
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

export function MuzikClient({ configured }: { configured: boolean }) {
  const [connected, setConnected] = useState(false);
  const [premium, setPremium] = useState<boolean | null>(null); // null=bilinmiyor
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<SpotifyTrack | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const playerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // İlk yükleme: ?code varsa token al; bağlıysa SDK kur
  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const ok = await exchangeCode(code);
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        window.history.replaceState({}, "", url.pathname);
        if (ok) {
          setConnected(true);
          toast.success("Spotify bağlandı!");
        } else {
          toast.error("Spotify bağlanamadı, tekrar dene.");
        }
      } else {
        setConnected(isConnected());
      }
    })();
  }, []);

  // Bağlıysa Web Playback SDK yükle (Premium gerektirir)
  useEffect(() => {
    if (!connected) return;
    if (playerRef.current) return;

    const init = () => {
      const Spotify = window.Spotify;
      if (!Spotify) return;
      const player = new Spotify.Player({
        name: "PeakNET Player",
        getOAuthToken: (cb: (t: string) => void) => getAccessToken().then((t) => t && cb(t)),
        volume: 0.6,
      });
      playerRef.current = player;
      player.addListener("ready", ({ device_id }: any) => {
        setDeviceId(device_id);
        setPremium(true);
      });
      player.addListener("not_ready", () => setDeviceId(null));
      player.addListener("player_state_changed", (s: any) => {
        if (s) setIsPaused(s.paused);
      });
      player.addListener("account_error", () => {
        setPremium(false);
        toast.message("Tam çalma Spotify Premium gerektirir — önizleme moduna geçildi.");
      });
      player.addListener("initialization_error", () => setPremium(false));
      player.addListener("authentication_error", () => {
        setConnected(false);
        disconnectSpotify();
      });
      player.connect();
    };

    if (window.Spotify) {
      init();
    } else {
      window.onSpotifyWebPlaybackSDKReady = init;
      const s = document.createElement("script");
      s.src = "https://sdk.scdn.co/spotify-player.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, [connected]);

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const data = await spotifyApi<{ tracks: { items: SpotifyTrack[] } }>(
        `/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
      );
      setResults(data?.tracks?.items ?? []);
      if (!data) toast.error("Arama başarısız — bağlantını kontrol et.");
    } finally {
      setSearching(false);
    }
  }

  async function playTrack(t: SpotifyTrack) {
    setNowPlaying(t);
    // Premium + cihaz hazırsa tam çal
    if (deviceId) {
      const r = await spotifyApi(`/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uris: [t.uri] }),
      });
      // spotifyApi 204'te null döndürür; hata olursa fallback
      setIsPaused(false);
      void r;
      return;
    }
    // Fallback: 30 sn önizleme
    if (t.preview_url) {
      if (audioRef.current) {
        audioRef.current.src = t.preview_url;
        audioRef.current.play();
        setIsPaused(false);
      }
    } else {
      toast.message("Bu şarkının önizlemesi yok — Spotify'da açabilirsin.");
    }
  }

  function togglePlay() {
    if (playerRef.current && deviceId) {
      playerRef.current.togglePlay();
      return;
    }
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPaused(false);
      } else {
        audioRef.current.pause();
        setIsPaused(true);
      }
    }
  }

  if (!configured) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm">
        <div className="font-medium text-amber-600 dark:text-amber-400">
          Spotify yapılandırılmadı
        </div>
        <p className="mt-1 text-muted-foreground">
          Bu özelliğin çalışması için <code>NEXT_PUBLIC_SPOTIFY_CLIENT_ID</code>{" "}
          ortam değişkeni gerekir (Spotify Developer&apos;dan alınan public Client ID).
        </p>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1DB954]/15">
          <Music2 size={26} className="text-[#1DB954]" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Spotify&apos;ı bağla</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Hesabını bağla, çalışırken sevdiğin şarkıları ara ve çal. Tam çalma
          Premium gerektirir; ücretsizde 30 sn önizleme + Spotify&apos;da aç.
        </p>
        <button
          type="button"
          onClick={() => beginSpotifyAuth()}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#1DB954] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Music2 size={16} /> Spotify ile bağlan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-[#1DB954]" />
          Spotify bağlı{premium === false ? " · önizleme modu (Premium değil)" : premium ? " · Premium" : ""}
        </span>
        <button
          type="button"
          onClick={() => {
            disconnectSpotify();
            setConnected(false);
            setResults([]);
            setNowPlaying(null);
          }}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <LogOut size={13} /> Bağlantıyı kes
        </button>
      </div>

      {/* Arama */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Şarkı, sanatçı ara…"
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="button"
          onClick={search}
          disabled={searching}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          Ara
        </button>
      </div>

      {/* Sonuçlar */}
      <ul className="space-y-1.5">
        {results.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5"
          >
            {t.album.images?.[2]?.url || t.album.images?.[0]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={t.album.images[2]?.url ?? t.album.images[0].url}
                alt=""
                className="h-11 w-11 shrink-0 rounded"
              />
            ) : (
              <div className="h-11 w-11 shrink-0 rounded bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{t.name}</div>
              <div className="truncate text-xs text-muted-foreground">
                {t.artists.map((a) => a.name).join(", ")}
              </div>
            </div>
            <button
              type="button"
              onClick={() => playTrack(t)}
              title="Çal"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20"
            >
              <Play size={15} />
            </button>
            <a
              href={t.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              title="Spotify'da aç"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <ExternalLink size={14} />
            </a>
          </li>
        ))}
      </ul>

      {/* Now playing bar */}
      {nowPlaying && (
        <div className="sticky bottom-2 flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 backdrop-blur">
          {nowPlaying.album.images?.[2]?.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={nowPlaying.album.images[2].url} alt="" className="h-10 w-10 rounded" />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{nowPlaying.name}</div>
            <div className="truncate text-xs text-muted-foreground">
              {nowPlaying.artists.map((a) => a.name).join(", ")}
              {!deviceId && nowPlaying.preview_url ? " · önizleme (30 sn)" : ""}
            </div>
          </div>
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        </div>
      )}

      <audio ref={audioRef} onEnded={() => setIsPaused(true)} className="hidden" />
    </div>
  );
}
