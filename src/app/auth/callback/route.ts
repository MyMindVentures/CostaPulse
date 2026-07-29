import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DEFAULT_NEXT = "/portal/credentials";

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_NEXT;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?auth=invalid_magic_link", request.url),
      303
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(
      new URL("/login?auth=required", request.url),
      303
    );
  }

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(
      new URL("/login?auth=magic_link_expired", request.url),
      303
    );
  }

  const { data: userResult } = await supabase.auth.getUser();
  if (!userResult.user) {
    return NextResponse.redirect(
      new URL("/login?auth=required", request.url),
      303
    );
  }

  const rpcClient = supabase as unknown as {
    rpc: (
      fn: string,
      args?: Record<string, unknown>
    ) => Promise<{ data: unknown; error: { message: string } | null }>;
  };

  const { error: grantError } = await rpcClient.rpc(
    "get_authenticated_credential_portfolio"
  );
  if (grantError) {
    return NextResponse.redirect(
      new URL("/login?auth=grant_required", request.url),
      303
    );
  }

  return NextResponse.redirect(new URL(next, request.url), 303);
}
