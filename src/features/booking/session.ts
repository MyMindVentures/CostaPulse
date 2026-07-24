const SESSION_STORAGE_KEY = "costapulse.booking.anonymousSessionId";

function createUuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function getOrCreateAnonymousSessionId(): string {
  if (typeof window === "undefined") {
    return createUuid();
  }

  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const next = createUuid();
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, next);
  return next;
}

export function getOrCreateIdempotencyKey(storageKey: string): string {
  if (typeof window === "undefined") {
    return createUuid();
  }

  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) return existing;

  const next = createUuid();
  window.sessionStorage.setItem(storageKey, next);
  return next;
}

export function clearIdempotencyKey(storageKey: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(storageKey);
}
