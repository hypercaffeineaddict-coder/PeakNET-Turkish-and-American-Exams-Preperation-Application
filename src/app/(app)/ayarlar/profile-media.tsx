"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, ImagePlus, User as UserIcon, Check } from "lucide-react";
import { toast } from "sonner";
import { updateProfileMedia } from "./actions";

const MAX_BYTES = 8 * 1024 * 1024;
const OK_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// Görseli tarayıcıda küçült + sıkıştır, data URL döndür. Supabase Storage
// gerektirmez; sonuç doğrudan profiles tablosundaki kolona yazılır.
function fileToScaledDataUrl(
  file: File,
  maxW: number,
  maxH: number,
  quality = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxW / img.width, maxH / img.height);
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas desteklenmiyor"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      // webp dene; desteklenmiyorsa (ör. Safari) png yerine jpeg'e düş —
      // aksi halde dev bir PNG data URL oluşur.
      let out = canvas.toDataURL("image/webp", quality);
      if (!out.startsWith("data:image/webp")) {
        out = canvas.toDataURL("image/jpeg", quality);
      }
      resolve(out);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("görsel okunamadı"));
    };
    img.src = url;
  });
}

export function ProfileMedia({
  initialAvatar,
  initialBanner,
  initialBio,
  displayName,
}: {
  initialAvatar: string | null;
  initialBanner: string | null;
  initialBio: string;
  displayName: string;
}) {
  const router = useRouter();
  const [avatar, setAvatar] = useState(initialAvatar);
  const [banner, setBanner] = useState(initialBanner);
  const [bio, setBio] = useState(initialBio);
  const [bioSaved, setBioSaved] = useState(false);
  const [busy, setBusy] = useState<null | "avatar" | "banner" | "bio">(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  async function upload(kind: "avatar" | "banner", file: File) {
    if (!OK_TYPES.includes(file.type)) {
      toast.error("PNG / JPG / WebP / GIF yükle.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Görsel 5 MB'tan küçük olmalı.");
      return;
    }
    setBusy(kind);
    try {
      // Avatar küçük (256px), banner geniş (1280x480) — DB satırı şişmesin.
      const url =
        kind === "avatar"
          ? await fileToScaledDataUrl(file, 256, 256, 0.85)
          : await fileToScaledDataUrl(file, 1280, 480, 0.72);

      const res = await updateProfileMedia(
        kind === "avatar" ? { avatar_url: url } : { banner_url: url },
      );
      if (res?.error) {
        const missingCol =
          /does not exist|could not find .*column|schema cache/i.test(res.error);
        toast.error(
          missingCol
            ? "Profil kolonları eksik. Ayarlar SQL'ini (3 satır) bir kez çalıştır."
            : res.error,
        );
        return;
      }
      if (kind === "avatar") setAvatar(url);
      else setBanner(url);
      toast.success(
        kind === "avatar" ? "Profil resmi güncellendi." : "Banner güncellendi.",
      );
      router.refresh(); // header'daki avatar anında güncellensin
    } catch (e) {
      toast.error(`Hata: ${String(e)}`);
    } finally {
      setBusy(null);
    }
  }

  async function saveBio() {
    setBusy("bio");
    const res = await updateProfileMedia({ bio });
    setBusy(null);
    if (res?.error) toast.error(res.error);
    else {
      setBioSaved(true);
      setTimeout(() => setBioSaved(false), 2000);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Banner */}
      <div className="relative">
        <div
          className="h-32 w-full bg-gradient-to-r from-primary/30 via-primary/10 to-orange-500/20 bg-cover bg-center"
          style={banner ? { backgroundImage: `url(${banner})` } : undefined}
        />
        <button
          type="button"
          onClick={() => bannerRef.current?.click()}
          disabled={busy === "banner"}
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/60 disabled:opacity-60"
        >
          {busy === "banner" ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
          Banner
        </button>
        <input
          ref={bannerRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && upload("banner", e.target.files[0])}
        />

        {/* Avatar */}
        <div className="absolute -bottom-10 left-6">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-card bg-muted">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <UserIcon size={28} />
              </div>
            )}
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              disabled={busy === "avatar"}
              className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition hover:bg-black/40 hover:opacity-100"
              aria-label="Profil resmi değiştir"
            >
              {busy === "avatar" ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            </button>
          </div>
          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload("avatar", e.target.files[0])}
          />
        </div>
      </div>

      <div className="px-6 pb-6 pt-12">
        <div className="text-base font-semibold">{displayName || "Öğrenci"}</div>
        <label className="mt-3 block text-sm">
          <span className="text-xs text-muted-foreground">Hakkında (bio)</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            rows={2}
            placeholder="Kendini birkaç kelimeyle anlat…"
            className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <span className="text-[11px] text-muted-foreground">{bio.length}/280</span>
        </label>
        <button
          type="button"
          onClick={saveBio}
          disabled={busy === "bio"}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {busy === "bio" ? <Loader2 size={14} className="animate-spin" /> : bioSaved ? <Check size={14} /> : null}
          {bioSaved ? "Kaydedildi" : "Bio kaydet"}
        </button>
      </div>
    </section>
  );
}
