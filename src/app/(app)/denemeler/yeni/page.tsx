import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Calculator } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createExam } from "../actions";
import { NetForm } from "./form";

export default async function YeniDenemePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; type?: string }>;
}) {
  const { error, type } = await searchParams;
  const examType =
    type === "TYT" || type === "AYT" || type === "YDT" ? type : "AYT";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/denemeler"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={14} /> Denemeler
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Calculator className="text-primary" size={26} />
          Yeni deneme
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Her ders için Doğru (D) ve Yanlış (Y) gir. Boş otomatik hesaplanır.
          Net: D − Y/4.
        </p>
      </div>

      <NetForm
        action={createExam}
        defaultType={examType}
        error={error ?? null}
      />
    </div>
  );
}
