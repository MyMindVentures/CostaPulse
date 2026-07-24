const SENTRY_DSN_ENV = "NEXT_PUBLIC_SENTRY_DSN";

export function getSentryDsn(): string | null {
  const value = process.env[SENTRY_DSN_ENV];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export function isSentryEnabled(): boolean {
  return getSentryDsn() !== null;
}
