"use server";

import { createClient } from "@/lib/supabase/server";

// Server: XP ver (RPC) - only usable in Server Components / Server Actions
export async function awardXp(amount: number, reason: string): Promise<number> {
  if (!amount || amount <= 0) return 0;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("award_xp", {
      p_amount: amount,
      p_reason: reason,
    });
    if (error) {
      console.warn("award_xp hata:", error.message);
      return 0;
    }
    return (data as number) ?? 0;
  } catch (err) {
    console.warn("award_xp exception:", err);
    return 0;
  }
}