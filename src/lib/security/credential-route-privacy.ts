const PRIVATE_CREDENTIAL_PREFIXES = [
  "/shared/credentials/",
  "/api/shared/credentials/",
  "/portal/credentials",
  "/api/credentials/files/",
  "/api/admin/documents/files/"
] as const;

export function isPrivateCredentialUrl(value: unknown): boolean {
  if (typeof value !== "string" || value.length === 0) return false;

  try {
    const pathname = value.startsWith("/")
      ? new URL(value, "https://private.invalid").pathname
      : new URL(value).pathname;
    return PRIVATE_CREDENTIAL_PREFIXES.some((prefix) => {
      const normalizedPrefix = prefix.endsWith("/")
        ? prefix.slice(0, -1)
        : prefix;
      return (
        pathname === normalizedPrefix ||
        pathname.startsWith(`${normalizedPrefix}/`)
      );
    });
  } catch {
    return PRIVATE_CREDENTIAL_PREFIXES.some((prefix) => value.includes(prefix));
  }
}

export function shouldDropCredentialTelemetry(input: {
  url?: unknown;
  transaction?: unknown;
}): boolean {
  return (
    isPrivateCredentialUrl(input.url) ||
    isPrivateCredentialUrl(input.transaction)
  );
}
