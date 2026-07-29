import type { AuthenticatedCredentialPortfolio } from "@/server/repositories/credential-portal";

export type SharedCredentialFilters = {
  search?: string;
  documentType?: string;
  category?: string;
  validity?: string;
  verification?: string;
  recordState?: string;
};

export function normalizeSharedCredentialFilters(
  filters: SharedCredentialFilters
) {
  const normalizeSelect = (value: string | undefined) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : "all";
  };

  return {
    search: filters.search?.trim().toLowerCase() ?? "",
    documentType: normalizeSelect(filters.documentType),
    category: normalizeSelect(filters.category),
    validity: normalizeSelect(filters.validity),
    verification: normalizeSelect(filters.verification),
    recordState: normalizeSelect(filters.recordState)
  };
}

export function filterSharedCredentials(
  credentials: AuthenticatedCredentialPortfolio["credentials"],
  filters: SharedCredentialFilters
) {
  const normalized = normalizeSharedCredentialFilters(filters);

  return credentials.filter((credential) => {
    if (
      normalized.documentType !== "all" &&
      credential.document_type !== normalized.documentType
    ) {
      return false;
    }

    if (
      normalized.category !== "all" &&
      credential.category !== normalized.category
    ) {
      return false;
    }

    if (
      normalized.verification !== "all" &&
      credential.verification_status !== normalized.verification
    ) {
      return false;
    }

    if (
      normalized.validity !== "all" &&
      credential.computed_status !== normalized.validity
    ) {
      return false;
    }

    if (
      normalized.recordState === "current" &&
      credential.status === "replaced"
    ) {
      return false;
    }

    if (
      normalized.recordState === "historical" &&
      credential.status !== "replaced"
    ) {
      return false;
    }

    if (!normalized.search) {
      return true;
    }

    return [
      credential.title,
      credential.issuing_authority ?? "",
      credential.document_type,
      credential.category
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized.search);
  });
}
