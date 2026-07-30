import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canAccessAdminArea, type AppRole } from "@/server/auth/role-access";

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

  const { data: roleRows, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("profile_id", user.id);

  const roles = (roleRows ?? []).map(({ role }) => role as AppRole);
  if (roleError || !canAccessAdminArea(roles)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { fileId } = await context.params;
  const intent = parseIntent(request.nextUrl.searchParams.get("intent"));

  // Prefer the service-role client when it is configured, but do not make
  // protected previews depend on it. The authenticated server client already
  // carries Kevin's session and is governed by the existing RLS/storage
  // policies. This keeps previews working in production environments where
  // SUPABASE_SERVICE_ROLE_KEY is intentionally not exposed.
  const storageClient = createSupabaseAdminClient() ?? supabase;

  const { data: fileRow, error: fileError } = await storageClient
    .from("professional_document_files")
    .select("id, storage_bucket, storage_path, original_filename, mime_type")
    .eq("id", fileId)
    .single();

  if (fileError || !fileRow) {
    return NextResponse.json(
      { error: fileError?.message ?? "File not found" },
      { status: fileError ? 403 : 404 }
    );
  }

  const { data: binary, error: downloadError } = await storageClient.storage
    .from(fileRow.storage_bucket)
    .download(fileRow.storage_path);

  if (downloadError || !binary) {
    return NextResponse.json(
      { error: downloadError?.message ?? "Failed to read file." },
      { status: 500 }
    );
  }

  const contentType = fileRow.mime_type || binary.type || "application/octet-stream";
  const dispositionType = intent === "download" ? "attachment" : "inline";
  const encodedFileName = encodeURIComponent(
    fileRow.original_filename || "file"
  );

  return new NextResponse(await binary.arrayBuffer(), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `${dispositionType}; filename*=UTF-8''${encodedFileName}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": "frame-ancestors 'self'"
    }
  });
}
