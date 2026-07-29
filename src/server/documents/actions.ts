"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  canAccessAdminSection,
  canMutateAdminOpsContent,
  type AppRole
} from "@/server/auth/role-access";

type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof createSupabaseServerClient>>
>;

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

const STATUS_VALUES = [
  "draft",
  "active",
  "expired",
  "replaced",
  "revoked",
  "archived"
] as const;

const VERIFICATION_VALUES = [
  "unverified",
  "pending",
  "verified",
  "rejected"
] as const;

const FILE_ROLE_VALUES = [
  "primary",
  "front",
  "back",
  "translation",
  "attachment",
  "supporting_evidence"
] as const;

const formSchema = z.object({
  documentType: z.enum([
    "passport",
    "seamans_book",
    "certificate_of_competency",
    "stcw_certificate",
    "stcw_refresher",
    "medical_certificate",
    "gmdss",
    "license",
    "visa",
    "vaccination_certificate",
    "training_certificate",
    "insurance",
    "cv",
    "assessment",
    "other"
  ]),
  category: z.enum([
    "identity",
    "maritime_license",
    "stcw",
    "medical",
    "travel",
    "training",
    "employment",
    "insurance",
    "other"
  ]),
  title: z.string().trim().min(1),
  documentNumber: z.string().trim().nullable(),
  issuingAuthority: z.string().trim().nullable(),
  issuedOn: z.string().trim().nullable(),
  validFrom: z.string().trim().nullable(),
  expiresOn: z.string().trim().nullable(),
  doesNotExpire: z.boolean(),
  issuingCountryCode: z.string().trim().nullable(),
  qualification: z.string().trim().nullable(),
  stcwCode: z.string().trim().nullable(),
  restrictions: z.string().trim().nullable(),
  notes: z.string().trim().nullable(),
  teamMemberCertificateId: z.string().trim().nullable(),
  confidentialityLevel: z.enum(["private", "restricted", "administrative"]),
  fileRole: z.enum([
    "primary",
    "front",
    "back",
    "translation",
    "attachment",
    "supporting_evidence"
  ])
});

const updateSchema = formSchema.omit({ fileRole: true });

type BuildFilenameRpc = {
  p_profile_name: string;
  p_document_type: string;
  p_document_number: string | null;
  p_issued_on: string | null;
  p_expires_on: string | null;
  p_extension: string;
  p_unique_suffix: string;
};

type RpcClient = {
  rpc: (
    fn: string,
    args?: Record<string, unknown>
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
};

function parseDateInput(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  return trimmed;
}

function getExtension(fileName: string, mimeType: string): string {
  const fromMime: Record<string, string> = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
  };

  if (fromMime[mimeType]) {
    return fromMime[mimeType];
  }

  const parts = fileName.split(".");
  if (parts.length < 2) return "pdf";
  return parts.at(-1)?.toLowerCase() ?? "pdf";
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Document upload failed.";
}

function isRedirectControlFlowError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const maybeDigest = (error as Error & { digest?: unknown }).digest;
  if (
    typeof maybeDigest === "string" &&
    maybeDigest.startsWith("NEXT_REDIRECT")
  ) {
    return true;
  }

  // Supports unit tests that mock redirect as a thrown error marker.
  return error.message.startsWith("redirect:");
}

function parseUuid(value: FormDataEntryValue | null): string | null {
  const parsed = z
    .string()
    .uuid()
    .safeParse(String(value ?? ""));
  return parsed.success ? parsed.data : null;
}

function parseOptionalUuid(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return parseUuid(trimmed);
}

function parseCountryCode(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return null;
  return normalized;
}

function resolveVerificationState(
  input: string
): (typeof VERIFICATION_VALUES)[number] | null {
  const parsed = z.enum(VERIFICATION_VALUES).safeParse(input);
  return parsed.success ? parsed.data : null;
}

async function getAuthenticatedProfile(
  supabase: SupabaseServerClient,
  redirectPath: string
) {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?auth=required&next=${encodeURIComponent(redirectPath)}`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect(
      `${redirectPath}?status=error&message=` +
        encodeURIComponent(
          "Authenticated profile is missing in public.profiles."
        )
    );
  }

  return profile;
}

async function readUserRoles(
  supabase: SupabaseServerClient,
  profileId: string
): Promise<AppRole[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("profile_id", profileId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => row.role as AppRole);
}

function requireDocumentsAccess(roles: readonly AppRole[]) {
  if (!canAccessAdminSection(roles, "documents")) {
    redirect("/admin?auth=forbidden");
  }
}

function requireDocumentsVerificationAccess(roles: readonly AppRole[]) {
  if (!canMutateAdminOpsContent(roles)) {
    redirect("/admin?auth=forbidden");
  }
}

async function getDocumentForMutation(
  supabase: SupabaseServerClient,
  documentId: string
) {
  const { data, error } = await supabase
    .from("professional_documents")
    .select(
      "id, profile_id, document_type, document_number, issued_on, expires_on, verification_status, status"
    )
    .eq("id", documentId)
    .single();

  if (error || !data) {
    throw new Error("Document not found.");
  }

  return data;
}

async function generateDocumentFilename(input: {
  supabase: SupabaseServerClient;
  profileName: string;
  documentType: string;
  documentNumber: string | null;
  issuedOn: string | null;
  expiresOn: string | null;
  originalFilename: string;
  mimeType: string;
}) {
  const extension = getExtension(input.originalFilename, input.mimeType);
  const suffix = randomBytes(4).toString("hex");
  const rpcClient = input.supabase as unknown as RpcClient;
  const filenameArgs: BuildFilenameRpc = {
    p_profile_name: input.profileName,
    p_document_type: input.documentType,
    p_document_number: input.documentNumber,
    p_issued_on: input.issuedOn,
    p_expires_on: input.expiresOn,
    p_extension: extension,
    p_unique_suffix: suffix
  };

  const { data: generatedName, error: filenameError } = await rpcClient.rpc(
    "build_professional_document_filename",
    filenameArgs
  );

  if (filenameError || typeof generatedName !== "string") {
    throw new Error(filenameError?.message ?? "Failed to generate filename.");
  }

  return generatedName;
}

async function cleanupUploadFailure(input: {
  supabase: SupabaseServerClient;
  documentId?: string;
  storagePath?: string;
}) {
  if (input.storagePath) {
    const { error } = await input.supabase.storage
      .from("professional-credentials")
      .remove([input.storagePath]);
    if (error) {
      console.error("Failed to clean uploaded credential file", {
        message: error.message
      });
    }
  }

  if (input.documentId) {
    const { error } = await input.supabase
      .from("professional_documents")
      .delete()
      .eq("id", input.documentId);
    if (error) {
      console.error("Failed to clean orphan professional document", {
        message: error.message
      });
    }
  }
}

export async function createProfessionalDocumentAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect(
      "/admin/documents/new?status=error&message=" +
        encodeURIComponent("Supabase is not configured.")
    );
  }

  const supabaseClient = supabase as SupabaseServerClient;

  const profile = await getAuthenticatedProfile(
    supabaseClient,
    "/admin/documents/new"
  );
  const roles = await readUserRoles(supabaseClient, profile.id);
  requireDocumentsAccess(roles);

  const payload = formSchema.safeParse({
    documentType: String(formData.get("documentType") ?? ""),
    category: String(formData.get("category") ?? ""),
    title: String(formData.get("title") ?? ""),
    documentNumber: String(formData.get("documentNumber") ?? "").trim() || null,
    issuingAuthority:
      String(formData.get("issuingAuthority") ?? "").trim() || null,
    issuedOn: String(formData.get("issuedOn") ?? "").trim() || null,
    validFrom: String(formData.get("validFrom") ?? "").trim() || null,
    expiresOn: String(formData.get("expiresOn") ?? "").trim() || null,
    doesNotExpire: formData.get("doesNotExpire") === "on",
    issuingCountryCode:
      String(formData.get("issuingCountryCode") ?? "").trim() || null,
    qualification: String(formData.get("qualification") ?? "").trim() || null,
    stcwCode: String(formData.get("stcwCode") ?? "").trim() || null,
    restrictions: String(formData.get("restrictions") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    teamMemberCertificateId:
      String(formData.get("teamMemberCertificateId") ?? "").trim() || null,
    confidentialityLevel: String(formData.get("confidentialityLevel") ?? ""),
    fileRole: String(formData.get("fileRole") ?? "")
  });

  const replacesDocumentId = parseUuid(formData.get("replacesDocumentId"));

  if (!payload.success) {
    redirect(
      "/admin/documents/new?status=error&message=" +
        encodeURIComponent("Please complete all required fields.")
    );
  }

  const issuedOn = parseDateInput(payload.data.issuedOn);
  const validFrom = parseDateInput(payload.data.validFrom);
  const expiresOnRaw = parseDateInput(payload.data.expiresOn);
  const expiresOn = payload.data.doesNotExpire ? null : expiresOnRaw;
  const issuingCountryCode = parseCountryCode(payload.data.issuingCountryCode);
  const teamMemberCertificateId = parseOptionalUuid(
    payload.data.teamMemberCertificateId
  );

  if (payload.data.issuedOn && !issuedOn) {
    redirect(
      "/admin/documents/new?status=error&message=" +
        encodeURIComponent("Issued date is invalid.")
    );
  }

  if (payload.data.validFrom && !validFrom) {
    redirect(
      "/admin/documents/new?status=error&message=" +
        encodeURIComponent("Valid-from date is invalid.")
    );
  }

  if (!payload.data.doesNotExpire && payload.data.expiresOn && !expiresOn) {
    redirect(
      "/admin/documents/new?status=error&message=" +
        encodeURIComponent("Expiry date is invalid.")
    );
  }

  if (payload.data.issuingCountryCode && !issuingCountryCode) {
    redirect(
      "/admin/documents/new?status=error&message=" +
        encodeURIComponent(
          "Issuing country code must be a two-letter ISO code."
        )
    );
  }

  if (payload.data.teamMemberCertificateId && !teamMemberCertificateId) {
    redirect(
      "/admin/documents/new?status=error&message=" +
        encodeURIComponent("Team member certificate identifier is invalid.")
    );
  }

  if (issuedOn && validFrom && validFrom < issuedOn) {
    redirect(
      "/admin/documents/new?status=error&message=" +
        encodeURIComponent("Valid-from date cannot be before issued date.")
    );
  }

  if (expiresOn && issuedOn && expiresOn < issuedOn) {
    redirect(
      "/admin/documents/new?status=error&message=" +
        encodeURIComponent("Expiry date cannot be before issued date.")
    );
  }

  if (expiresOn && validFrom && expiresOn < validFrom) {
    redirect(
      "/admin/documents/new?status=error&message=" +
        encodeURIComponent("Expiry date cannot be before valid-from date.")
    );
  }

  const uploadedFile = formData.get("file");
  if (!(uploadedFile instanceof File) || uploadedFile.size === 0) {
    redirect(
      "/admin/documents/new?status=error&message=" +
        encodeURIComponent("At least one file is required.")
    );
  }

  if (!ALLOWED_MIME_TYPES.has(uploadedFile.type)) {
    redirect(
      "/admin/documents/new?status=error&message=" +
        encodeURIComponent("Only PDF, JPEG, PNG, and WebP files are allowed.")
    );
  }

  if (uploadedFile.size > MAX_FILE_BYTES) {
    redirect(
      "/admin/documents/new?status=error&message=" +
        encodeURIComponent("Maximum file size is 25 MB.")
    );
  }

  let createdDocumentId: string | undefined;
  let storagePath: string | undefined;

  try {
    if (replacesDocumentId) {
      await getDocumentForMutation(supabaseClient, replacesDocumentId);
    }

    const { data: documentRow, error: createDocumentError } = await supabase
      .from("professional_documents")
      .insert({
        profile_id: profile.id,
        document_type: payload.data.documentType,
        category: payload.data.category,
        title: payload.data.title,
        document_number: payload.data.documentNumber,
        issuing_authority: payload.data.issuingAuthority,
        issuing_country_code: issuingCountryCode,
        issued_on: issuedOn,
        valid_from: validFrom,
        expires_on: expiresOn,
        does_not_expire: payload.data.doesNotExpire,
        confidentiality_level: payload.data.confidentialityLevel,
        qualification: payload.data.qualification,
        stcw_code: payload.data.stcwCode,
        restrictions: payload.data.restrictions,
        notes: payload.data.notes,
        team_member_certificate_id: teamMemberCertificateId,
        replaces_document_id: replacesDocumentId,
        uploaded_by_profile_id: profile.id
      })
      .select("id")
      .single();

    if (createDocumentError || !documentRow) {
      throw new Error(
        createDocumentError?.message ?? "Failed to create document record."
      );
    }

    createdDocumentId = documentRow.id;

    const generatedName = await generateDocumentFilename({
      supabase: supabaseClient,
      profileName: profile.display_name ?? profile.email ?? "profile",
      documentType: payload.data.documentType,
      documentNumber: payload.data.documentNumber,
      issuedOn,
      expiresOn,
      originalFilename: uploadedFile.name,
      mimeType: uploadedFile.type
    });

    storagePath = `${profile.id}/${createdDocumentId}/${generatedName}`;

    const { error: uploadError } = await supabase.storage
      .from("professional-credentials")
      .upload(storagePath, uploadedFile, {
        contentType: uploadedFile.type,
        upsert: false
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { error: fileMetadataError } = await supabase
      .from("professional_document_files")
      .insert({
        document_id: createdDocumentId,
        file_role: payload.data.fileRole,
        storage_bucket: "professional-credentials",
        storage_path: storagePath,
        original_filename: uploadedFile.name,
        stored_filename: generatedName,
        mime_type: uploadedFile.type,
        file_size_bytes: uploadedFile.size,
        version_number: 1,
        is_current: true,
        uploaded_by_profile_id: profile.id
      });

    if (fileMetadataError) {
      throw new Error(fileMetadataError.message);
    }

    if (replacesDocumentId) {
      const { error: replaceStatusError } = await supabase
        .from("professional_documents")
        .update({ status: "replaced" })
        .eq("id", replacesDocumentId);

      if (replaceStatusError) {
        throw new Error(replaceStatusError.message);
      }
    }

    revalidatePath("/admin/documents");
    revalidatePath(`/admin/documents/${createdDocumentId}`);
    if (replacesDocumentId) {
      revalidatePath(`/admin/documents/${replacesDocumentId}`);
      revalidatePath(`/admin/documents/${replacesDocumentId}/edit`);
    }

    redirect(`/admin/documents/${createdDocumentId}?status=created`);
  } catch (error) {
    if (isRedirectControlFlowError(error)) {
      throw error;
    }

    await cleanupUploadFailure({
      supabase: supabaseClient,
      documentId: createdDocumentId,
      storagePath
    });

    redirect(
      "/admin/documents/new?status=error&message=" +
        encodeURIComponent(toErrorMessage(error))
    );
  }
}

export async function updateProfessionalDocumentAction(formData: FormData) {
  const documentId = parseUuid(formData.get("documentId"));
  if (!documentId) {
    redirect(
      "/admin/documents?status=error&message=" +
        encodeURIComponent("Document identifier is invalid.")
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect(
      "/admin/documents?status=error&message=" +
        encodeURIComponent("Supabase is not configured.")
    );
  }

  const supabaseClient = supabase as SupabaseServerClient;

  const profile = await getAuthenticatedProfile(
    supabaseClient,
    `/admin/documents/${documentId}/edit`
  );
  const roles = await readUserRoles(supabaseClient, profile.id);
  requireDocumentsAccess(roles);

  const payload = updateSchema.safeParse({
    documentType: String(formData.get("documentType") ?? ""),
    category: String(formData.get("category") ?? ""),
    title: String(formData.get("title") ?? ""),
    documentNumber: String(formData.get("documentNumber") ?? "").trim() || null,
    issuingAuthority:
      String(formData.get("issuingAuthority") ?? "").trim() || null,
    issuedOn: String(formData.get("issuedOn") ?? "").trim() || null,
    validFrom: String(formData.get("validFrom") ?? "").trim() || null,
    expiresOn: String(formData.get("expiresOn") ?? "").trim() || null,
    doesNotExpire: formData.get("doesNotExpire") === "on",
    issuingCountryCode:
      String(formData.get("issuingCountryCode") ?? "").trim() || null,
    qualification: String(formData.get("qualification") ?? "").trim() || null,
    stcwCode: String(formData.get("stcwCode") ?? "").trim() || null,
    restrictions: String(formData.get("restrictions") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    teamMemberCertificateId:
      String(formData.get("teamMemberCertificateId") ?? "").trim() || null,
    confidentialityLevel: String(formData.get("confidentialityLevel") ?? "")
  });

  if (!payload.success) {
    redirect(
      `/admin/documents/${documentId}/edit?status=error&message=` +
        encodeURIComponent("Please complete all required fields.")
    );
  }

  const issuedOn = parseDateInput(payload.data.issuedOn);
  const validFrom = parseDateInput(payload.data.validFrom);
  const expiresOnRaw = parseDateInput(payload.data.expiresOn);
  const expiresOn = payload.data.doesNotExpire ? null : expiresOnRaw;
  const issuingCountryCode = parseCountryCode(payload.data.issuingCountryCode);
  const teamMemberCertificateId = parseOptionalUuid(
    payload.data.teamMemberCertificateId
  );

  if (payload.data.issuedOn && !issuedOn) {
    redirect(
      `/admin/documents/${documentId}/edit?status=error&message=` +
        encodeURIComponent("Issued date is invalid.")
    );
  }

  if (payload.data.validFrom && !validFrom) {
    redirect(
      `/admin/documents/${documentId}/edit?status=error&message=` +
        encodeURIComponent("Valid-from date is invalid.")
    );
  }

  if (!payload.data.doesNotExpire && payload.data.expiresOn && !expiresOn) {
    redirect(
      `/admin/documents/${documentId}/edit?status=error&message=` +
        encodeURIComponent("Expiry date is invalid.")
    );
  }

  if (payload.data.issuingCountryCode && !issuingCountryCode) {
    redirect(
      `/admin/documents/${documentId}/edit?status=error&message=` +
        encodeURIComponent(
          "Issuing country code must be a two-letter ISO code."
        )
    );
  }

  if (payload.data.teamMemberCertificateId && !teamMemberCertificateId) {
    redirect(
      `/admin/documents/${documentId}/edit?status=error&message=` +
        encodeURIComponent("Team member certificate identifier is invalid.")
    );
  }

  if (issuedOn && validFrom && validFrom < issuedOn) {
    redirect(
      `/admin/documents/${documentId}/edit?status=error&message=` +
        encodeURIComponent("Valid-from date cannot be before issued date.")
    );
  }

  if (expiresOn && issuedOn && expiresOn < issuedOn) {
    redirect(
      `/admin/documents/${documentId}/edit?status=error&message=` +
        encodeURIComponent("Expiry date cannot be before issued date.")
    );
  }

  if (expiresOn && validFrom && expiresOn < validFrom) {
    redirect(
      `/admin/documents/${documentId}/edit?status=error&message=` +
        encodeURIComponent("Expiry date cannot be before valid-from date.")
    );
  }

  try {
    await getDocumentForMutation(supabaseClient, documentId);

    const { error } = await supabase
      .from("professional_documents")
      .update({
        document_type: payload.data.documentType,
        category: payload.data.category,
        title: payload.data.title,
        document_number: payload.data.documentNumber,
        issuing_authority: payload.data.issuingAuthority,
        issuing_country_code: issuingCountryCode,
        issued_on: issuedOn,
        valid_from: validFrom,
        expires_on: expiresOn,
        does_not_expire: payload.data.doesNotExpire,
        confidentiality_level: payload.data.confidentialityLevel,
        qualification: payload.data.qualification,
        stcw_code: payload.data.stcwCode,
        restrictions: payload.data.restrictions,
        notes: payload.data.notes,
        team_member_certificate_id: teamMemberCertificateId
      })
      .eq("id", documentId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/documents");
    revalidatePath(`/admin/documents/${documentId}`);
    revalidatePath(`/admin/documents/${documentId}/edit`);

    redirect(`/admin/documents/${documentId}/edit?status=updated`);
  } catch (error) {
    if (isRedirectControlFlowError(error)) {
      throw error;
    }

    redirect(
      `/admin/documents/${documentId}/edit?status=error&message=` +
        encodeURIComponent(toErrorMessage(error))
    );
  }
}

export async function setProfessionalDocumentVerificationAction(
  formData: FormData
) {
  const documentId = parseUuid(formData.get("documentId"));
  if (!documentId) {
    redirect(
      "/admin/documents?status=error&message=" +
        encodeURIComponent("Verification request is invalid.")
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect(
      "/admin/documents?status=error&message=" +
        encodeURIComponent("Supabase is not configured.")
    );
  }

  const supabaseClient = supabase as SupabaseServerClient;

  const verificationStatus = resolveVerificationState(
    String(formData.get("verificationStatus") ?? "")
  );

  if (!documentId || !verificationStatus) {
    redirect(
      "/admin/documents?status=error&message=" +
        encodeURIComponent("Verification request is invalid.")
    );
  }

  const profile = await getAuthenticatedProfile(
    supabaseClient,
    `/admin/documents/${documentId}`
  );
  const roles = await readUserRoles(supabaseClient, profile.id);
  requireDocumentsVerificationAccess(roles);

  const nextStatusRaw = String(formData.get("status") ?? "").trim();
  const nextStatus = nextStatusRaw
    ? z.enum(STATUS_VALUES).safeParse(nextStatusRaw)
    : null;
  if (nextStatus && !nextStatus.success) {
    redirect(
      `/admin/documents/${documentId}?status=error&message=` +
        encodeURIComponent("Document lifecycle status is invalid.")
    );
  }

  try {
    await getDocumentForMutation(supabaseClient, documentId);

    const updatePayload: {
      verification_status: (typeof VERIFICATION_VALUES)[number];
      verified_at: string | null;
      verified_by_profile_id: string | null;
      status?: (typeof STATUS_VALUES)[number];
    } = {
      verification_status: verificationStatus,
      verified_at:
        verificationStatus === "verified" ? new Date().toISOString() : null,
      verified_by_profile_id:
        verificationStatus === "verified" ? profile.id : null
    };

    if (nextStatus?.success) {
      updatePayload.status = nextStatus.data;
    }

    const { error } = await supabase
      .from("professional_documents")
      .update(updatePayload)
      .eq("id", documentId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/documents");
    revalidatePath(`/admin/documents/${documentId}`);
    revalidatePath(`/admin/documents/${documentId}/edit`);

    redirect(`/admin/documents/${documentId}?status=verification_updated`);
  } catch (error) {
    if (isRedirectControlFlowError(error)) {
      throw error;
    }

    redirect(
      `/admin/documents/${documentId}?status=error&message=` +
        encodeURIComponent(toErrorMessage(error))
    );
  }
}

export async function replaceProfessionalDocumentFileAction(
  formData: FormData
) {
  const documentId = parseUuid(formData.get("documentId"));
  if (!documentId) {
    redirect(
      "/admin/documents?status=error&message=" +
        encodeURIComponent("Replace file request is invalid.")
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect(
      "/admin/documents?status=error&message=" +
        encodeURIComponent("Supabase is not configured.")
    );
  }

  const supabaseClient = supabase as SupabaseServerClient;

  const fileRole = z
    .enum(FILE_ROLE_VALUES)
    .safeParse(String(formData.get("fileRole") ?? ""));
  const uploadedFile = formData.get("file");

  if (!fileRole.success) {
    redirect(
      "/admin/documents?status=error&message=" +
        encodeURIComponent("Replace file request is invalid.")
    );
  }

  if (!(uploadedFile instanceof File) || uploadedFile.size === 0) {
    redirect(
      `/admin/documents/${documentId}/edit?status=error&message=` +
        encodeURIComponent("At least one file is required.")
    );
  }

  if (!ALLOWED_MIME_TYPES.has(uploadedFile.type)) {
    redirect(
      `/admin/documents/${documentId}/edit?status=error&message=` +
        encodeURIComponent("Only PDF, JPEG, PNG, and WebP files are allowed.")
    );
  }

  if (uploadedFile.size > MAX_FILE_BYTES) {
    redirect(
      `/admin/documents/${documentId}/edit?status=error&message=` +
        encodeURIComponent("Maximum file size is 25 MB.")
    );
  }

  const profile = await getAuthenticatedProfile(
    supabaseClient,
    `/admin/documents/${documentId}/edit`
  );
  const roles = await readUserRoles(supabaseClient, profile.id);
  requireDocumentsAccess(roles);

  let storagePath: string | undefined;
  let previousCurrentFileId: string | null = null;

  try {
    const document = await getDocumentForMutation(supabaseClient, documentId);

    const { data: currentFile, error: currentFileError } = await supabase
      .from("professional_document_files")
      .select("id, version_number, sort_order")
      .eq("document_id", document.id)
      .eq("file_role", fileRole.data)
      .eq("is_current", true)
      .maybeSingle();

    if (currentFileError) {
      throw new Error(currentFileError.message);
    }

    previousCurrentFileId = currentFile?.id ?? null;
    const nextVersion = (currentFile?.version_number ?? 0) + 1;
    const nextSortOrder = currentFile?.sort_order ?? 0;

    if (previousCurrentFileId) {
      const { error: unsetCurrentError } = await supabase
        .from("professional_document_files")
        .update({ is_current: false })
        .eq("id", previousCurrentFileId);
      if (unsetCurrentError) {
        throw new Error(unsetCurrentError.message);
      }
    }

    const generatedName = await generateDocumentFilename({
      supabase: supabaseClient,
      profileName: profile.display_name ?? profile.email ?? "profile",
      documentType: document.document_type,
      documentNumber: document.document_number,
      issuedOn: document.issued_on,
      expiresOn: document.expires_on,
      originalFilename: uploadedFile.name,
      mimeType: uploadedFile.type
    });

    storagePath = `${document.profile_id}/${document.id}/${generatedName}`;

    const { error: uploadError } = await supabase.storage
      .from("professional-credentials")
      .upload(storagePath, uploadedFile, {
        contentType: uploadedFile.type,
        upsert: false
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { error: insertError } = await supabase
      .from("professional_document_files")
      .insert({
        document_id: document.id,
        file_role: fileRole.data,
        storage_bucket: "professional-credentials",
        storage_path: storagePath,
        original_filename: uploadedFile.name,
        stored_filename: generatedName,
        mime_type: uploadedFile.type,
        file_size_bytes: uploadedFile.size,
        version_number: nextVersion,
        is_current: true,
        sort_order: nextSortOrder,
        uploaded_by_profile_id: profile.id
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    revalidatePath("/admin/documents");
    revalidatePath(`/admin/documents/${document.id}`);
    revalidatePath(`/admin/documents/${document.id}/edit`);

    redirect(`/admin/documents/${document.id}/edit?status=file_replaced`);
  } catch (error) {
    if (isRedirectControlFlowError(error)) {
      throw error;
    }

    if (storagePath) {
      const { error: cleanupFileError } = await supabase.storage
        .from("professional-credentials")
        .remove([storagePath]);
      if (cleanupFileError) {
        console.error("Failed to remove replacement file after error", {
          message: cleanupFileError.message
        });
      }
    }

    if (previousCurrentFileId) {
      const { error: restoreError } = await supabase
        .from("professional_document_files")
        .update({ is_current: true })
        .eq("id", previousCurrentFileId);
      if (restoreError) {
        console.error("Failed to restore previous current file", {
          message: restoreError.message
        });
      }
    }

    redirect(
      `/admin/documents/${documentId}/edit?status=error&message=` +
        encodeURIComponent(toErrorMessage(error))
    );
  }
}
