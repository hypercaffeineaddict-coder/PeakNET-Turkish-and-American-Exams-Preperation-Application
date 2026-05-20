import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const url = request.nextUrl.clone();
  const isPublic = PUBLIC_PATHS.includes(path);
  const isOnboarding = path.startsWith("/onboarding");

  // Oturum yok ve public değil → login'e
  if (!user && !isPublic) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Oturum var → onboarding kontrolü
  if (user) {
    if (path === "/login" || path === "/signup") {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (!isOnboarding && path !== "/") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed_at")
        .eq("id", user.id)
        .single();

      if (!profile?.onboarding_completed_at) {
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
