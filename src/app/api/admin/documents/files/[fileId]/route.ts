import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SIGNED_URL_TTL_SECONDS = 120;

function parseIntent(value: string | null): "view" | "download" {
  return value === "download" ? "download" : "view";
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = await context.params;
  const intent = parseIntent(request.nextUrl.searchParams.get("intent"));

  const { data: fileRow, error: fileError } = await supabase
    .from("professional_document_files")
    .select("id, storage_bucket, storage_path, original_filename")
    .eq("id", fileId)
    .single();

  if (fileError || !fileRow) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Storage access is not configured." },
      { status: 500 }
    );
  }

  const options =
    intent === "download" ? { download: fileRow.original_filename } : undefined;

  const { data, error } = await admin.storage
    .from(fileRow.storage_bucket)
    .createSignedUrl(fileRow.storage_path, SIGNED_URL_TTL_SECONDS, options);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to generate file link." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.signedUrl, 302);
}
