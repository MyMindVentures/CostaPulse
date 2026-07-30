export const DEFAULT_CREDENTIAL_ACCESS_DAYS = 7;

export function getDefaultCredentialExpiry(reference = new Date()): string {
  return new Date(
    reference.getTime() + DEFAULT_CREDENTIAL_ACCESS_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
}
