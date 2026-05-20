import { createClient } from "@/lib/supabase/server";

const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT ?? 300);

export async function consumeAIQuota(): Promise<{
  allowed: boolean;
  count: number;
  limit: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("consume_ai_quota", {
      p_limit: DAILY_LIMIT,
    });
    if (error) {
      console.warn("Rate limit RPC hatası:", error.message);
      // RPC çalışmazsa fail-open: kullanıcı durmasın
      return { allowed: true, count: 0, limit: DAILY_LIMIT };
    }
    const parsed = (data ?? {}) as { allowed?: boolean; count?: number; limit?: number };
    return {
      allowed: parsed.allowed ?? true,
      count: parsed.count ?? 0,
      limit: parsed.limit ?? DAILY_LIMIT,
    };
  } catch (err) {
    console.warn("Rate limit hata:", err);
    return { allowed: true, count: 0, limit: DAILY_LIMIT };
  }
}
