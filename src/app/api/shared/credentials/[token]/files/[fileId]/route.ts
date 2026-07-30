import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  CredentialPortfolioError,
  getSharedCredentialFileAccess
} from "@/server/repositories/credential-portal";

const SIGNED_URL_TTL_SECONDS = 120;
const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive"
};

function parseIntent(value: string | null): "view" | "download" {
  return value === "download" ? "download" : "view";
}

function mapErrorStatus(error: CredentialPortfolioError): number {
  if (error.code === "FORBIDDEN") return 403;
  if (error.code === "SHARE_NOT_FOUND" || error.code === "NOT_GRANTED") {
    return 404;
  }
  return 400;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string; fileId: string }> }
) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Storage access is not configured." },
      { status: 500, headers: PRIVATE_HEADERS }
    );
  }

  const { token, fileId } = await context.params;
  const intent = parseIntent(request.nextUrl.searchParams.get("intent"));

  try {
    const access = await getSharedCredentialFileAccess(token, fileId, intent);

    const options =
      intent === "download"
        ? { download: access.original_filename }
        : undefined;

    const { data, error } = await admin.storage
      .from(access.storage_bucket)
      .createSignedUrl(access.storage_path, SIGNED_URL_TTL_SECONDS, options);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: error?.message ?? "Failed to generate file link." },
        { status: 500, headers: PRIVATE_HEADERS }
      );
    }

    const response = NextResponse.redirect(data.signedUrl, 302);
    Object.entries(PRIVATE_HEADERS).forEach(([key, value]) =>
      response.headers.set(key, value)
    );
    return response;
  } catch (error) {
    if (error instanceof CredentialPortfolioError) {
      return NextResponse.json(
        { error: error.message },
        { status: mapErrorStatus(error), headers: PRIVATE_HEADERS }
      );
    }
    return NextResponse.json(
      { error: "Unexpected file access error." },
      { status: 500, headers: PRIVATE_HEADERS }
    );
  }
}
