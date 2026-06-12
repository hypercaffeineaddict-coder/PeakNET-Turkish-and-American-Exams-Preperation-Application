import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/auth/callback"];

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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
  const isAuthCallback = path.startsWith("/auth"); // OAuth callback path

  // No session and trying to access protected route → redirect to login
  if (!user && !isPublic && !isAuthCallback) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Has session and on auth pages → redirect to dashboard
  if (user && (path === "/login" || path === "/signup")) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Middleware should be fast - skip onboarding check here.
  // Onboarding redirect is handled by individual protected pages (layout.tsx or page.tsx)
  // This avoids a DB query on EVERY request, significantly speeding up navigation.

  return supabaseResponse;
}