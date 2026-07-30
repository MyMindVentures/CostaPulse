import "server-only";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const credentialFileSchema = z.object({
  id: z.string().uuid(),
  file_role: z.string().min(1),
  mime_type: z.string().min(1),
  file_size_bytes: z.number().int().positive(),
  original_filename: z.string().min(1),
  version_number: z.number().int().positive(),
  is_current: z.boolean(),
  created_at: z.string().min(1)
});

const credentialSchema = z.object({
  id: z.string().uuid(),
  document_type: z.string().min(1),
  category: z.string().min(1),
  title: z.string().min(1),
  document_number: z.string().nullable(),
  issuing_authority: z.string().nullable(),
  issuing_country_code: z.string().nullable(),
  issued_on: z.string().nullable(),
  valid_from: z.string().nullable(),
  expires_on: z.string().nullable(),
  does_not_expire: z.boolean(),
  qualification: z.string().nullable(),
  stcw_code: z.string().nullable(),
  restrictions: z.string().nullable(),
  language_code: z.string().nullable(),
  page_count: z.number().int().positive().nullable(),
  updated_at: z.string().min(1),
  status: z.string().min(1),
  verification_status: z.string().min(1),
  computed_status: z.string().min(1),
  files: z.array(credentialFileSchema)
});

const portfolioSchema = z.object({
  grant_id: z.string().uuid(),
  share_link_id: z.string().uuid().nullable().optional(),
  owner_profile_id: z.string().uuid(),
  owner: z.object({
    displayName: z.string().min(1),
    roleTitle: z.string().nullable(),
    introduction: z.string().nullable()
  }),
  recipient_email: z.string().email(),
  recipient_agency_label: z.string().nullable(),
  permissions: z.object({
    canViewFiles: z.boolean(),
    canDownloadFiles: z.boolean(),
    canViewDocumentNumbers: z.boolean(),
    canViewHistory: z.boolean(),
    canShare: z.boolean()
  }),
  access_expires_at: z.string().nullable(),
  share_expires_at: z.string().nullable().optional(),
  credentials: z.array(credentialSchema)
});

export type AuthenticatedCredentialPortfolio = z.infer<typeof portfolioSchema>;

export const APPLICATION_DOCUMENT_TYPES = ["cv", "motivation_letter"] as const;
export type ApplicationDocumentType =
  (typeof APPLICATION_DOCUMENT_TYPES)[number];
export type ApplicationDocumentRouteType = "cv" | "motivation-letter";

export type ApplicationDocument =
  AuthenticatedCredentialPortfolio["credentials"][number] & {
    currentFile:
      | AuthenticatedCredentialPortfolio["credentials"][number]["files"][number]
      | null;
  };

export type ApplicationDocumentPortfolio = Omit<
  AuthenticatedCredentialPortfolio,
  "credentials"
> & {
  documents: Record<ApplicationDocumentType, ApplicationDocument | null>;
};

const ownerGrantSchema = z.object({
  id: z.string().uuid(),
  owner_profile_id: z.string().uuid(),
  recipient_profile_id: z.string().uuid().nullable(),
  recipient_email: z.string().email(),
  recipient_agency_label: z.string().nullable(),
  permission_view_files: z.boolean(),
  permission_download_files: z.boolean(),
  permission_include_history: z.boolean(),
  permission_include_document_number: z.boolean(),
  permission_create_share_links: z.boolean(),
  access_expires_at: z.string().nullable(),
  revoked_at: z.string().nullable(),
  last_magic_link_sent_at: z.string().nullable(),
  created_at: z.string().min(1)
});

const shareableDocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  document_type: z.string().min(1),
  verification_status: z.string().min(1),
  status: z.string().min(1),
  expires_on: z.string().nullable(),
  does_not_expire: z.boolean()
});

export type OwnerCredentialGrant = z.infer<typeof ownerGrantSchema>;
export type ShareableCredentialDocument = z.infer<
  typeof shareableDocumentSchema
>;

const credentialFileAccessSchema = z.object({
  grant_id: z.string().uuid(),
  share_link_id: z.string().uuid().nullable().optional(),
  document_id: z.string().uuid(),
  document_file_id: z.string().uuid(),
  storage_bucket: z.string().min(1),
  storage_path: z.string().min(1),
  original_filename: z.string().min(1),
  mime_type: z.string().min(1)
});

export type CredentialFileAccess = z.infer<typeof credentialFileAccessSchema>;

type SupabaseRpcLike = {
  rpc: (
    fn: string,
    args?: Record<string, unknown>
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
};

export class CredentialPortfolioError extends Error {
  readonly code:
    | "NOT_CONFIGURED"
    | "UNAUTHORIZED"
    | "NOT_GRANTED"
    | "FORBIDDEN"
    | "SHARE_NOT_FOUND"
    | "INVALID_PAYLOAD"
    | "UNKNOWN";

  constructor(
    code:
      | "NOT_CONFIGURED"
      | "UNAUTHORIZED"
      | "NOT_GRANTED"
      | "FORBIDDEN"
      | "SHARE_NOT_FOUND"
      | "INVALID_PAYLOAD"
      | "UNKNOWN",
    message: string
  ) {
    super(message);
    this.name = "CredentialPortfolioError";
    this.code = code;
  }
}

function mapRpcError(message: string): CredentialPortfolioError {
  const normalized = message.toUpperCase();
  if (normalized.includes("AUTH")) {
    return new CredentialPortfolioError("UNAUTHORIZED", message);
  }
  if (
    normalized.includes("DOWNLOAD_NOT_ALLOWED") ||
    normalized.includes("VIEW_NOT_ALLOWED") ||
    normalized.includes("SHARE_NOT_ALLOWED") ||
    normalized.includes("EXPIRY_EXCEEDS_GRANT") ||
    normalized.includes("FORBIDDEN")
  ) {
    return new CredentialPortfolioError("FORBIDDEN", message);
  }
  if (normalized.includes("SHARE_NOT_FOUND")) {
    return new CredentialPortfolioError("SHARE_NOT_FOUND", message);
  }
  if (normalized.includes("GRANT_NOT_FOUND")) {
    return new CredentialPortfolioError("NOT_GRANTED", message);
  }
  return new CredentialPortfolioError("UNKNOWN", message);
}

export function applicationDocumentTypeFromRoute(
  value: string
): ApplicationDocumentType | null {
  if (value === "cv") return "cv";
  if (value === "motivation-letter") return "motivation_letter";
  return null;
}

export function applicationDocumentRouteFromType(
  value: ApplicationDocumentType
): ApplicationDocumentRouteType {
  return value === "motivation_letter" ? "motivation-letter" : "cv";
}

export function toApplicationDocumentPortfolio(
  portfolio: AuthenticatedCredentialPortfolio
): ApplicationDocumentPortfolio {
  const documents: ApplicationDocumentPortfolio["documents"] = {
    cv: null,
    motivation_letter: null
  };

  for (const credential of portfolio.credentials) {
    if (
      !APPLICATION_DOCUMENT_TYPES.includes(
        credential.document_type as ApplicationDocumentType
      ) ||
      credential.status !== "active" ||
      credential.verification_status !== "verified"
    ) {
      continue;
    }

    const type = credential.document_type as ApplicationDocumentType;
    const currentFile =
      credential.files
        .filter(
          (file) =>
            file.is_current &&
            file.file_role === "primary" &&
            file.mime_type === "application/pdf"
        )
        .sort((a, b) => b.version_number - a.version_number)[0] ?? null;
    const candidate = { ...credential, currentFile };
    const existing = documents[type];

    const candidateTimestamp = Date.parse(candidate.updated_at);
    const existingTimestamp = existing
      ? Date.parse(existing.updated_at)
      : Number.NEGATIVE_INFINITY;
    const normalizedCandidateTimestamp = Number.isNaN(candidateTimestamp)
      ? Number.NEGATIVE_INFINITY
      : candidateTimestamp;
    const normalizedExistingTimestamp = Number.isNaN(existingTimestamp)
      ? Number.NEGATIVE_INFINITY
      : existingTimestamp;

    if (
      !existing ||
      normalizedCandidateTimestamp > normalizedExistingTimestamp ||
      (normalizedCandidateTimestamp === normalizedExistingTimestamp &&
        candidate.id.localeCompare(existing.id) < 0)
    ) {
      documents[type] = candidate;
    }
  }

  const { credentials: _credentials, ...rest } = portfolio;
  void _credentials;
  return { ...rest, documents };
}

export async function getAuthenticatedCredentialPortfolio(): Promise<AuthenticatedCredentialPortfolio> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new CredentialPortfolioError(
      "NOT_CONFIGURED",
      "Supabase is not configured."
    );
  }

  const rpcClient = supabase as unknown as SupabaseRpcLike;
  const { data, error } = await rpcClient.rpc(
    "get_authenticated_credential_portfolio"
  );
  if (error) {
    throw mapRpcError(error.message);
  }

  const parsed = portfolioSchema.safeParse(data);
  if (!parsed.success) {
    throw new CredentialPortfolioError(
      "INVALID_PAYLOAD",
      "Credential portfolio payload is invalid."
    );
  }

  return parsed.data;
}

export async function listOwnerCredentialAccessGrants(): Promise<
  OwnerCredentialGrant[]
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new CredentialPortfolioError(
      "NOT_CONFIGURED",
      "Supabase is not configured."
    );
  }

  const rpcClient = supabase as unknown as SupabaseRpcLike;
  const { data, error } = await rpcClient.rpc(
    "list_owner_credential_access_grants"
  );
  if (error) {
    throw mapRpcError(error.message);
  }

  const parsed = z.array(ownerGrantSchema).safeParse(data);
  if (!parsed.success) {
    throw new CredentialPortfolioError(
      "INVALID_PAYLOAD",
      "Owner grant listing payload is invalid."
    );
  }

  return parsed.data;
}

export async function listShareableCredentialDocuments(): Promise<
  ShareableCredentialDocument[]
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new CredentialPortfolioError(
      "NOT_CONFIGURED",
      "Supabase is not configured."
    );
  }

  const rpcClient = supabase as unknown as SupabaseRpcLike;
  const { data, error } = await rpcClient.rpc(
    "get_authenticated_credential_portfolio"
  );
  if (error) {
    throw new CredentialPortfolioError("UNKNOWN", error.message);
  }

  const parsedPortfolio = portfolioSchema.safeParse(data);
  if (!parsedPortfolio.success) {
    throw new CredentialPortfolioError(
      "INVALID_PAYLOAD",
      "Credential portfolio payload is invalid."
    );
  }

  const credentials = parsedPortfolio.data.credentials;

  const mapped = credentials.map((item) => ({
    id: item.id,
    title: item.title,
    document_type: item.document_type,
    verification_status: item.verification_status,
    status: item.status,
    expires_on: item.expires_on,
    does_not_expire: item.does_not_expire
  }));

  const parsed = z.array(shareableDocumentSchema).safeParse(mapped);
  if (!parsed.success) {
    throw new CredentialPortfolioError(
      "INVALID_PAYLOAD",
      "Shareable credential documents payload is invalid."
    );
  }

  return parsed.data;
}

export async function getSharedCredentialPortfolio(
  token: string
): Promise<AuthenticatedCredentialPortfolio> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new CredentialPortfolioError(
      "NOT_CONFIGURED",
      "Supabase is not configured."
    );
  }

  const rpcClient = supabase as unknown as SupabaseRpcLike;
  const { data, error } = await rpcClient.rpc(
    "get_shared_credential_portfolio",
    {
      p_token: token
    }
  );
  if (error) {
    throw mapRpcError(error.message);
  }

  const parsed = portfolioSchema.safeParse(data);
  if (!parsed.success) {
    throw new CredentialPortfolioError(
      "INVALID_PAYLOAD",
      "Shared credential portfolio payload is invalid."
    );
  }

  return parsed.data;
}

export async function getAuthenticatedApplicationDocumentPortfolio(): Promise<ApplicationDocumentPortfolio> {
  return toApplicationDocumentPortfolio(
    await getAuthenticatedCredentialPortfolio()
  );
}

export async function getSharedApplicationDocumentPortfolio(
  token: string
): Promise<ApplicationDocumentPortfolio> {
  return toApplicationDocumentPortfolio(
    await getSharedCredentialPortfolio(token)
  );
}

export async function recordAuthenticatedCredentialDetailView(
  documentId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new CredentialPortfolioError(
      "NOT_CONFIGURED",
      "Supabase is not configured."
    );
  }
  const { error } = await (supabase as unknown as SupabaseRpcLike).rpc(
    "record_authenticated_credential_detail_view",
    { p_document_id: documentId }
  );
  if (error) throw mapRpcError(error.message);
}

export async function recordSharedCredentialDetailView(
  token: string,
  documentId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new CredentialPortfolioError(
      "NOT_CONFIGURED",
      "Supabase is not configured."
    );
  }
  const { error } = await (supabase as unknown as SupabaseRpcLike).rpc(
    "record_shared_credential_detail_view",
    { p_token: token, p_document_id: documentId }
  );
  if (error) throw mapRpcError(error.message);
}

export async function getAuthenticatedCredentialFileAccess(
  fileId: string,
  intent: "view" | "download"
): Promise<CredentialFileAccess> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new CredentialPortfolioError(
      "NOT_CONFIGURED",
      "Supabase is not configured."
    );
  }

  const rpcClient = supabase as unknown as SupabaseRpcLike;
  const { data, error } = await rpcClient.rpc(
    "get_authenticated_credential_file_access",
    {
      p_document_file_id: fileId,
      p_intent: intent
    }
  );
  if (error) {
    throw mapRpcError(error.message);
  }

  const parsed = credentialFileAccessSchema.safeParse(data);
  if (!parsed.success) {
    throw new CredentialPortfolioError(
      "INVALID_PAYLOAD",
      "Authenticated file-access payload is invalid."
    );
  }

  return parsed.data;
}

export async function getSharedCredentialFileAccess(
  token: string,
  fileId: string,
  intent: "view" | "download"
): Promise<CredentialFileAccess> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new CredentialPortfolioError(
      "NOT_CONFIGURED",
      "Supabase is not configured."
    );
  }

  const rpcClient = supabase as unknown as SupabaseRpcLike;
  const { data, error } = await rpcClient.rpc(
    "get_shared_credential_file_access",
    {
      p_token: token,
      p_document_file_id: fileId,
      p_intent: intent
    }
  );
  if (error) {
    throw mapRpcError(error.message);
  }

  const parsed = credentialFileAccessSchema.safeParse(data);
  if (!parsed.success) {
    throw new CredentialPortfolioError(
      "INVALID_PAYLOAD",
      "Shared file-access payload is invalid."
    );
  }

  return parsed.data;
}
