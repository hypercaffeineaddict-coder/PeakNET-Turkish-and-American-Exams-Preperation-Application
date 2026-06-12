import { createClient } from "@/lib/supabase/server";

export type ApiKeys = {
  gemini?: string;
  openai?: string;
  anthropic?: string;
  ollamaUrl?: string;
};

export async function getUserApiKeys(): Promise<ApiKeys> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) return {};

    const { data } = await supabase
      .from("profiles")
      .select("api_keys")
      .eq("id", user.id)
      .single();

    return (data?.api_keys as ApiKeys) || {};
  } catch {
    return {};
  }
}
