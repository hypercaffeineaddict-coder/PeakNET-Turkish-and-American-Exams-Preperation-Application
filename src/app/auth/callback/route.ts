import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth (Google vb.) dönüş noktası: kodu oturuma çevirir, sonra yönlendirir.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error_description") || searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorParam)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let dest = "/dashboard";
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed_at")
          .eq("id", user.id)
          .single();
        dest = profile?.onboarding_completed_at ? "/dashboard" : "/onboarding";
      }
      return NextResponse.redirect(`${origin}${dest}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
