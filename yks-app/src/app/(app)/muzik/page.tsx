import { redirect } from "next/navigation";
import { Music } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MuzikClient } from "./client";

export const metadata = { title: "Müzik · PeakNET" };

export default async function MuzikPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const configured = !!(process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? "").trim();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Music className="text-primary" size={26} />
          Müzik
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Spotify hesabını bağla, çalışırken dinlemek istediğin şarkıları ara ve
          çal. (Tam çalma için Spotify Premium gerekir.)
        </p>
      </header>

      <MuzikClient configured={configured} />
    </div>
  );
}
