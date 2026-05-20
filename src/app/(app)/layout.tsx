import { redirect } from "next/navigation";
import { Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "../login/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "./sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: streak } = await supabase
    .from("streaks")
    .select("current_streak")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex min-h-screen">
      <Sidebar logoutAction={logoutAction} />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 pl-14 backdrop-blur md:pl-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-500">
              <Flame size={14} />
              {streak?.current_streak ?? 0}
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
