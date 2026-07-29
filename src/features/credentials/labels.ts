function humanizeToken(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type Translate = (key: string) => string;

export function formatCredentialDocumentType(value: string): string {
  return humanizeToken(value);
}

export function formatCredentialCategory(value: string): string {
  return humanizeToken(value);
}

export function formatCredentialVerificationStatus(
  t: Translate,
  value: string
): string {
  switch (value) {
    case "verified":
      return t("labels.verificationStatus.verified");
    case "pending":
      return t("labels.verificationStatus.pending");
    case "rejected":
      return t("labels.verificationStatus.rejected");
    case "unverified":
      return t("labels.verificationStatus.unverified");
    default:
      return humanizeToken(value);
  }
}

export function formatCredentialComputedStatus(
  t: Translate,
  value: string
): string {
  switch (value) {
    case "valid":
      return t("labels.computedStatus.valid");
    case "validity_unknown":
      return t("labels.computedStatus.validityUnknown");
    case "expires_within_180_days":
      return t("labels.computedStatus.expiresWithin180Days");
    case "expires_within_90_days":
      return t("labels.computedStatus.expiresWithin90Days");
    case "expires_within_60_days":
      return t("labels.computedStatus.expiresWithin60Days");
    case "expires_within_30_days":
      return t("labels.computedStatus.expiresWithin30Days");
    case "expired":
      return t("labels.computedStatus.expired");
    default:
      return humanizeToken(value);
  }
}

export function formatCredentialRecordStatus(
  t: Translate,
  value: string
): string {
  switch (value) {
    case "active":
      return t("labels.recordStatus.active");
    case "replaced":
      return t("labels.recordStatus.replaced");
    default:
      return humanizeToken(value);
  }
}

export function formatCredentialFileRole(t: Translate, value: string): string {
  switch (value) {
    case "primary":
      return t("labels.fileRole.primary");
    case "front":
      return t("labels.fileRole.front");
    case "back":
      return t("labels.fileRole.back");
    case "translation":
      return t("labels.fileRole.translation");
    case "attachment":
      return t("labels.fileRole.attachment");
    case "supporting_evidence":
      return t("labels.fileRole.supportingEvidence");
    default:
      return humanizeToken(value);
  }
}
