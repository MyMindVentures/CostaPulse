import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessAdminArea } from "@/server/auth/role-access";
import type { Database } from "@/types/database";

function redirectToHome(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("admin", "locked");
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return redirectToHome(request);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request: {
            headers: request.headers
          }
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectToHome(request);
  }

  const { data: roles, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("profile_id", user.id);

  if (error || !canAccessAdminArea(roles.map((entry) => entry.role))) {
    return redirectToHome(request);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"]
};
