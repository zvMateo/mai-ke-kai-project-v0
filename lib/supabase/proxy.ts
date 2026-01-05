import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes configuration
  const adminRoutes = ["/admin"];
  const volunteerRoutes = ["/volunteer"];
  const dashboardRoutes = ["/dashboard"];
  const authRoutes = ["/auth/login", "/auth/sign-up", "/auth/forgot-password"];

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isVolunteerRoute = volunteerRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isDashboardRoute = dashboardRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If user is not authenticated
  if (!user) {
    // Allow access to auth routes and public routes
    if (
      isAuthRoute ||
      (!isAdminRoute && !isVolunteerRoute && !isDashboardRoute)
    ) {
      return supabaseResponse;
    }
    // Redirect to login for protected routes
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // User is authenticated - get their role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = userData?.role || "user";

  // If authenticated user tries to access auth routes, redirect based on role
  if (isAuthRoute) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else if (role === "volunteer") {
      return NextResponse.redirect(new URL("/volunteer", request.url));
    } else {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Check admin route access
  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Check volunteer route access (admin can also access)
  if (isVolunteerRoute && !["admin", "volunteer"].includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return supabaseResponse;
}
