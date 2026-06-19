import { createClient } from "@/lib/supabase/server";
import { aiHealth } from "@/lib/ai";

export const runtime = "nodejs";
export const revalidate = 0;

// Anonim probing'i engellemek için auth gerekiyor.
// Çıktı: provider/model adı + hasChatModel; sırrı yok ama gereksiz açıkta da
// olmasın.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const h = await aiHealth();
  return Response.json(h);
}
