import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AraclarClient } from "./client";

export const metadata = {
  title: "YKS Araçları · PeakNET",
};

export default async function AraclarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <AraclarClient />;
}
