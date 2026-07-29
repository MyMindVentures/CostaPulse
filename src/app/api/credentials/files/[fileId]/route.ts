import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  CredentialPortfolioError,
  getAuthenticatedCredentialFileAccess
} from "@/server/repositories/credential-portal";

const SIGNED_URL_TTL_SECONDS = 120;

function parseIntent(value: string | null): "view" | "download" {
  return value === "download" ? "download" : "view";
}

function mapErrorStatus(error: CredentialPortfolioError): number {
  if (error.code === "UNAUTHORIZED") return 401;
  if (
    error.code === "FORBIDDEN" ||
    error.code === "NOT_GRANTED" ||
    error.code === "SHARE_NOT_FOUND"
  ) {
    return 403;
  }
  return 400;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Storage access is not configured." },
      { status: 500 }
    );
  }

  const { fileId } = await context.params;
  const intent = parseIntent(request.nextUrl.searchParams.get("intent"));

  try {
    const access = await getAuthenticatedCredentialFileAccess(fileId, intent);

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
        { status: 500 }
      );
    }

    return NextResponse.redirect(data.signedUrl, 302);
  } catch (error) {
    if (error instanceof CredentialPortfolioError) {
      return NextResponse.json(
        { error: error.message },
        { status: mapErrorStatus(error) }
      );
    }
    return NextResponse.json(
      { error: "Unexpected file access error." },
      { status: 500 }
    );
  }
}
