import { getDict } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AraclarClient } from "./client";

export const metadata = {
  title: "YKS Araçları · PeakNET",
};

export default async function AraclarPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDict(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <AraclarClient />;
}
