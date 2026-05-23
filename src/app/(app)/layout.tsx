import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "../login/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "./sidebar";
import { levelForXp } from "@/lib/gamification";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: streak }, { data: profile }] = await Promise.all([
    supabase.from("streaks").select("current_streak").eq("user_id", user.id).single(),
    supabase.from("profiles").select("total_xp, avatar_url, display_name").eq("id", user.id).single(),
  ]);

  const lv = levelForXp(profile?.total_xp ?? 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar logoutAction={logoutAction} />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 pl-14 backdrop-blur lg:pl-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/basarimlar"
              className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary transition hover:bg-primary/20"
              title={`Seviye ${lv.level} · ${(profile?.total_xp ?? 0).toLocaleString("tr-TR")} XP`}
            >
              <Zap size={14} className="fill-primary" />
              Sv.{lv.level}
            </Link>
            <Link
              href="/basarimlar"
              className="flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-500 transition hover:bg-orange-500/20"
              title="Streak"
            >
              <Flame size={14} />
              {streak?.current_streak ?? 0}
            </Link>
            <ThemeToggle />
            <Link
              href="/ayarlar"
              title="Profil"
              className="ml-1 inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground transition hover:border-primary/50"
            >
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt="Profil"
                  className="h-full w-full object-cover"
                />
              ) : (
                (profile?.display_name ?? user.email ?? "?").slice(0, 1).toUpperCase()
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
