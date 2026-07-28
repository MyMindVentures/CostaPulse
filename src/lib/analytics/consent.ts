export const ANALYTICS_CONSENT_COOKIE = "cp_analytics_consent";
export const ANALYTICS_CONSENT_CHANGE_EVENT = "cp-analytics-consent-change";

export const analyticsConsentValues = ["granted", "denied"] as const;

export type AnalyticsConsent = (typeof analyticsConsentValues)[number];

export function isAnalyticsConsent(
  value: string | null | undefined
): value is AnalyticsConsent {
  return value === "granted" || value === "denied";
}

export function parseAnalyticsConsentCookie(
  cookieHeader: string | null | undefined
): AnalyticsConsent | null {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ANALYTICS_CONSENT_COOKIE}=`));

  if (!match) {
    return null;
  }

  try {
    const value = decodeURIComponent(
      match.slice(ANALYTICS_CONSENT_COOKIE.length + 1)
    );
    return isAnalyticsConsent(value) ? value : null;
  } catch {
    // A malformed cookie must never crash React hydration or the entire app.
    return null;
  }
}

export function readAnalyticsConsentFromDocument(): AnalyticsConsent | null {
  if (typeof document === "undefined") {
    return null;
  }

  try {
    return parseAnalyticsConsentCookie(document.cookie);
  } catch {
    return null;
  }
}

export function subscribeAnalyticsConsent(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onStoreChange);
  };
}

export function writeAnalyticsConsent(value: AnalyticsConsent) {
  if (typeof document === "undefined") {
    return;
  }

  const maxAgeSeconds = 60 * 60 * 24 * 365;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ANALYTICS_CONSENT_CHANGE_EVENT));
  }
}
