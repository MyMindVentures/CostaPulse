import "server-only";

import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const fileSummarySchema = z.object({
  id: z.string().uuid(),
  file_role: z.string().min(1),
  is_current: z.boolean(),
  version_number: z.number().int().positive(),
  original_filename: z.string().nullable().optional().default(null),
  mime_type: z.string().min(1),
  file_size_bytes: z.number().int().positive().or(z.number().positive()),
  created_at: z.string().nullable().optional().default(null)
});

const professionalDocumentAdminSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  document_type: z.string().min(1),
  category: z.string().min(1),
  title: z.string().min(1),
  document_number: z.string().nullable(),
  issuing_authority: z.string().nullable(),
  issuing_country_code: z.string().nullable().optional().default(null),
  issued_on: z.string().nullable(),
  valid_from: z.string().nullable(),
  expires_on: z.string().nullable(),
  does_not_expire: z.boolean(),
  confidentiality_level: z.string().min(1),
  qualification: z.string().nullable().optional().default(null),
  stcw_code: z.string().nullable().optional().default(null),
  restrictions: z.string().nullable().optional().default(null),
  notes: z.string().nullable(),
  team_member_certificate_id: z
    .string()
    .uuid()
    .nullable()
    .optional()
    .default(null),
  replaces_document_id: z.string().uuid().nullable().optional().default(null),
  status: z.string().min(1),
  verification_status: z.string().min(1),
  computed_status: z.string().min(1),
  updated_at: z.string().min(1),
  files: z
    .preprocess((value) => {
      if (value == null) return [];
      return Array.isArray(value) ? value : [];
    }, z.array(fileSummarySchema))
    .default([])
});

const professionalDocumentBaseSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  document_type: z.string().min(1),
  category: z.string().min(1),
  title: z.string().min(1),
  document_number: z.string().nullable(),
  issuing_authority: z.string().nullable(),
  issuing_country_code: z.string().nullable().optional().default(null),
  issued_on: z.string().nullable(),
  valid_from: z.string().nullable(),
  expires_on: z.string().nullable(),
  does_not_expire: z.boolean(),
  confidentiality_level: z.string().min(1),
  qualification: z.string().nullable().optional().default(null),
  stcw_code: z.string().nullable().optional().default(null),
  restrictions: z.string().nullable().optional().default(null),
  notes: z.string().nullable(),
  team_member_certificate_id: z
    .string()
    .uuid()
    .nullable()
    .optional()
    .default(null),
  replaces_document_id: z.string().uuid().nullable().optional().default(null),
  status: z.string().min(1),
  verification_status: z.string().min(1),
  updated_at: z.string().min(1),
  files: z
    .preprocess((value) => {
      if (value == null) return [];
      return Array.isArray(value) ? value : [];
    }, z.array(fileSummarySchema))
    .default([])
});

export type AdminProfessionalDocument = z.infer<
  typeof professionalDocumentAdminSchema
>;

export type AdminDocumentsSummary = {
  valid: number;
  expiresWithin180Days: number;
  expiresWithin90Days: number;
  expiresWithin60Days: number;
  expiresWithin30Days: number;
  expired: number;
  pendingVerification: number;
};

export type AdminDocumentsOverviewResult =
  | {
      status: "ok";
      profileId: string;
      profileDisplayName: string | null;
      documents: AdminProfessionalDocument[];
      summary: AdminDocumentsSummary;
      filteredCount: number;
    }
  | {
      status: "missing_config" | "unauthenticated" | "missing_profile";
      message: string;
    };

export const DOCUMENT_TYPE_VALUES = [
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
] as const;

export const DOCUMENT_CATEGORY_VALUES = [
  "identity",
  "maritime_license",
  "stcw",
  "medical",
  "travel",
  "training",
  "employment",
  "insurance",
  "other"
] as const;

export const DOCUMENT_COMPUTED_STATUS_VALUES = [
  "valid",
  "validity_unknown",
  "expires_within_180_days",
  "expires_within_90_days",
  "expires_within_60_days",
  "expires_within_30_days",
  "expired",
  "draft",
  "replaced",
  "revoked",
  "archived"
] as const;

export const DOCUMENT_VERIFICATION_VALUES = [
  "unverified",
  "pending",
  "verified",
  "rejected"
] as const;

export const DOCUMENT_CONFIDENTIALITY_VALUES = [
  "private",
  "restricted",
  "administrative"
] as const;

export const DOCUMENT_EXPIRY_FILTER_VALUES = [
  "all",
  "expiring",
  "expired",
  "non_expiring"
] as const;

export const DOCUMENT_SORT_VALUES = [
  "updated_desc",
  "updated_asc",
  "expiry_asc",
  "expiry_desc"
] as const;

export type AdminDocumentsOverviewQuery = {
  search?: string | null;
  type?: (typeof DOCUMENT_TYPE_VALUES)[number] | null;
  category?: (typeof DOCUMENT_CATEGORY_VALUES)[number] | null;
  computedStatus?: (typeof DOCUMENT_COMPUTED_STATUS_VALUES)[number] | null;
  verification?: (typeof DOCUMENT_VERIFICATION_VALUES)[number] | null;
  confidentiality?: (typeof DOCUMENT_CONFIDENTIALITY_VALUES)[number] | null;
  expiry?: (typeof DOCUMENT_EXPIRY_FILTER_VALUES)[number] | null;
  sort?: (typeof DOCUMENT_SORT_VALUES)[number] | null;
};

export type AdminDocumentDetailResult =
  | { status: "ok"; document: AdminProfessionalDocument }
  | { status: "not_found" }
  | {
      status: "missing_config" | "unauthenticated" | "missing_profile";
      message: string;
    };

const defaultSummary: AdminDocumentsSummary = {
  valid: 0,
  expiresWithin180Days: 0,
  expiresWithin90Days: 0,
  expiresWithin60Days: 0,
  expiresWithin30Days: 0,
  expired: 0,
  pendingVerification: 0
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function hasRoleFunctionPermissionError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("permission denied for function has_any_role") ||
    (normalized.includes("permission denied") &&
      normalized.includes("has_any_role"))
  );
}

function toUtcMidnight(dateValue: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return null;
  }

  const utcDate = new Date(`${dateValue}T00:00:00.000Z`);
  if (Number.isNaN(utcDate.getTime())) {
    return null;
  }

  return utcDate;
}

function deriveComputedStatus(input: {
  status: string;
  doesNotExpire: boolean;
  expiresOn: string | null;
  now: Date;
}): string {
  if (["draft", "replaced", "revoked", "archived"].includes(input.status)) {
    return input.status;
  }

  if (input.status === "expired") {
    return "expired";
  }

  if (input.doesNotExpire) {
    return "valid";
  }

  if (!input.expiresOn) {
    return "validity_unknown";
  }

  const expiryDate = toUtcMidnight(input.expiresOn);
  if (!expiryDate) {
    return "validity_unknown";
  }

  const nowUtc = new Date(
    Date.UTC(
      input.now.getUTCFullYear(),
      input.now.getUTCMonth(),
      input.now.getUTCDate()
    )
  );

  const remainingDays = Math.floor(
    (expiryDate.getTime() - nowUtc.getTime()) / MS_PER_DAY
  );

  if (remainingDays < 0) {
    return "expired";
  }

  if (remainingDays <= 30) {
    return "expires_within_30_days";
  }

  if (remainingDays <= 60) {
    return "expires_within_60_days";
  }

  if (remainingDays <= 90) {
    return "expires_within_90_days";
  }

  if (remainingDays <= 180) {
    return "expires_within_180_days";
  }

  return "valid";
}

async function fetchDocumentsFromBaseTablesWithAdmin() {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return {
      status: "missing_config" as const,
      message: "Supabase admin access is not configured."
    };
  }

  const { data, error } = await admin
    .from("professional_documents")
    .select(
      "id, profile_id, document_type, category, title, document_number, issuing_authority, issuing_country_code, issued_on, valid_from, expires_on, does_not_expire, confidentiality_level, qualification, stcw_code, restrictions, notes, team_member_certificate_id, replaces_document_id, status, verification_status, updated_at, files:professional_document_files(id, file_role, is_current, version_number, original_filename, mime_type, file_size_bytes, created_at)"
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const parsed = z.array(professionalDocumentBaseSchema).safeParse(data ?? []);
  if (!parsed.success) {
    throw new Error("Professional documents payload is invalid.");
  }

  const now = new Date();
  const documents = parsed.data.map((document) => ({
    ...document,
    computed_status: deriveComputedStatus({
      status: document.status,
      doesNotExpire: document.does_not_expire,
      expiresOn: document.expires_on,
      now
    })
  }));

  return {
    status: "ok" as const,
    documents
  };
}

function computeSummary(
  documents: readonly AdminProfessionalDocument[]
): AdminDocumentsSummary {
  return documents.reduce<AdminDocumentsSummary>(
    (acc, document) => {
      switch (document.computed_status) {
        case "valid":
          acc.valid += 1;
          break;
        case "expires_within_180_days":
          acc.expiresWithin180Days += 1;
          break;
        case "expires_within_90_days":
          acc.expiresWithin90Days += 1;
          break;
        case "expires_within_60_days":
          acc.expiresWithin60Days += 1;
          break;
        case "expires_within_30_days":
          acc.expiresWithin30Days += 1;
          break;
        case "expired":
          acc.expired += 1;
          break;
        default:
          break;
      }

      if (document.verification_status === "pending") {
        acc.pendingVerification += 1;
      }

      return acc;
    },
    { ...defaultSummary }
  );
}

function applyOverviewQuery(
  documents: readonly AdminProfessionalDocument[],
  query: AdminDocumentsOverviewQuery
) {
  const search = query.search?.trim().toLowerCase() ?? "";

  const filtered = documents.filter((document) => {
    if (query.type && document.document_type !== query.type) {
      return false;
    }

    if (query.category && document.category !== query.category) {
      return false;
    }

    if (
      query.computedStatus &&
      document.computed_status !== query.computedStatus
    ) {
      return false;
    }

    if (
      query.verification &&
      document.verification_status !== query.verification
    ) {
      return false;
    }

    if (
      query.confidentiality &&
      document.confidentiality_level !== query.confidentiality
    ) {
      return false;
    }

    if (query.expiry === "expired" && document.computed_status !== "expired") {
      return false;
    }

    if (
      query.expiry === "expiring" &&
      ![
        "expires_within_180_days",
        "expires_within_90_days",
        "expires_within_60_days",
        "expires_within_30_days"
      ].includes(document.computed_status)
    ) {
      return false;
    }

    if (query.expiry === "non_expiring" && !document.does_not_expire) {
      return false;
    }

    if (!search) {
      return true;
    }

    const searchableDocumentNumber =
      document.document_number?.toLowerCase() ?? "";
    const maskedNumber = searchableDocumentNumber
      ? searchableDocumentNumber.length <= 4
        ? "*".repeat(searchableDocumentNumber.length)
        : `${"*".repeat(searchableDocumentNumber.length - 4)}${searchableDocumentNumber.slice(-4)}`
      : "";

    return (
      document.title.toLowerCase().includes(search) ||
      (document.issuing_authority ?? "").toLowerCase().includes(search) ||
      searchableDocumentNumber.includes(search) ||
      maskedNumber.includes(search)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const expiryA = a.expires_on ?? "9999-12-31";
    const expiryB = b.expires_on ?? "9999-12-31";

    switch (query.sort) {
      case "updated_asc":
        return a.updated_at.localeCompare(b.updated_at);
      case "expiry_asc":
        return expiryA.localeCompare(expiryB);
      case "expiry_desc":
        return expiryB.localeCompare(expiryA);
      case "updated_desc":
      default:
        return b.updated_at.localeCompare(a.updated_at);
    }
  });

  return sorted;
}

export async function fetchAdminDocumentsOverview(
  query: AdminDocumentsOverviewQuery = {}
): Promise<AdminDocumentsOverviewResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      status: "missing_config",
      message: "Supabase is not configured."
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "unauthenticated",
      message: "Authentication is required."
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      status: "missing_profile",
      message: "Authenticated user is missing a profile row in public.profiles."
    };
  }

  const { data, error } = await supabase
    .from("professional_documents_admin")
    .select(
      "id, profile_id, document_type, category, title, document_number, issuing_authority, issuing_country_code, issued_on, valid_from, expires_on, does_not_expire, confidentiality_level, qualification, stcw_code, restrictions, notes, team_member_certificate_id, replaces_document_id, status, verification_status, computed_status, updated_at, files"
    )
    .order("updated_at", { ascending: false });

  let documents: AdminProfessionalDocument[];

  if (error) {
    if (!hasRoleFunctionPermissionError(error.message)) {
      throw new Error(error.message);
    }

    const fallback = await fetchDocumentsFromBaseTablesWithAdmin();
    if (fallback.status !== "ok") {
      return fallback;
    }

    documents = fallback.documents;
  } else {
    const parsed = z
      .array(professionalDocumentAdminSchema)
      .safeParse(data ?? []);
    if (!parsed.success) {
      throw new Error("Professional documents payload is invalid.");
    }

    documents = parsed.data;
  }

  const filteredDocuments = applyOverviewQuery(documents, query);

  return {
    status: "ok",
    profileId: profile.id,
    profileDisplayName: profile.display_name,
    documents: filteredDocuments,
    summary: computeSummary(documents),
    filteredCount: filteredDocuments.length
  };
}

export async function fetchAdminDocumentDetail(
  documentId: string
): Promise<AdminDocumentDetailResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      status: "missing_config",
      message: "Supabase is not configured."
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "unauthenticated",
      message: "Authentication is required."
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      status: "missing_profile",
      message: "Authenticated user is missing a profile row in public.profiles."
    };
  }

  const { data, error } = await supabase
    .from("professional_documents_admin")
    .select(
      "id, profile_id, document_type, category, title, document_number, issuing_authority, issuing_country_code, issued_on, valid_from, expires_on, does_not_expire, confidentiality_level, qualification, stcw_code, restrictions, notes, team_member_certificate_id, replaces_document_id, status, verification_status, computed_status, updated_at, files"
    )
    .eq("id", documentId)
    .maybeSingle();

  if (error) {
    if (!hasRoleFunctionPermissionError(error.message)) {
      throw new Error(error.message);
    }

    const fallback = await fetchDocumentsFromBaseTablesWithAdmin();
    if (fallback.status !== "ok") {
      return fallback;
    }

    const fallbackDocument = fallback.documents.find(
      (document) => document.id === documentId
    );

    if (!fallbackDocument) {
      return { status: "not_found" };
    }

    return {
      status: "ok",
      document: fallbackDocument
    };
  }

  if (!data) {
    return { status: "not_found" };
  }

  const parsed = professionalDocumentAdminSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Professional document detail payload is invalid.");
  }

  return {
    status: "ok",
    document: parsed.data
  };
}
