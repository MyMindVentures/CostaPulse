"use client";

import posthog from "posthog-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode
} from "react";
import {
  readAnalyticsConsentFromDocument,
  subscribeAnalyticsConsent,
  writeAnalyticsConsent,
  type AnalyticsConsent
} from "@/lib/analytics/consent";

type PostHogContextValue = {
  consent: AnalyticsConsent | null;
  consentReady: boolean;
  setConsent: (value: AnalyticsConsent) => void;
};

const PostHogContext = createContext<PostHogContextValue | null>(null);

function getPostHogKey() {
  const value = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function getPostHogHost() {
  const value = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function isPostHogLoaded() {
  return Boolean((posthog as typeof posthog & { __loaded?: boolean }).__loaded);
}

function stopPostHog() {
  if (typeof window === "undefined") {
    return;
  }

  if (isPostHogLoaded()) {
    posthog.opt_out_capturing();
    posthog.reset();
  }
}

function startPostHog() {
  const key = getPostHogKey();
  const host = getPostHogHost();

  if (!key || !host || typeof window === "undefined") {
    return;
  }

  if (isPostHogLoaded()) {
    posthog.opt_in_capturing();
    return;
  }

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    persistence: "localStorage+cookie",
    person_profiles: "identified_only"
  });
}

function subscribeIsClient(onStoreChange: () => void) {
  void onStoreChange;
  return () => {};
}

function getIsClientSnapshot() {
  return true;
}

function getServerIsClientSnapshot() {
  return false;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  const consentReady = useSyncExternalStore(
    subscribeIsClient,
    getIsClientSnapshot,
    getServerIsClientSnapshot
  );
  const consent = useSyncExternalStore(
    subscribeAnalyticsConsent,
    readAnalyticsConsentFromDocument,
    () => null
  );

  useEffect(() => {
    if (!consentReady) {
      return;
    }

    if (consent === "granted") {
      startPostHog();
      return;
    }

    if (consent === "denied") {
      stopPostHog();
    }
  }, [consent, consentReady]);

  const setConsent = useCallback((value: AnalyticsConsent) => {
    writeAnalyticsConsent(value);
  }, []);

  const value = useMemo(
    () => ({
      consent,
      consentReady,
      setConsent
    }),
    [consent, consentReady, setConsent]
  );

  return (
    <PostHogContext.Provider value={value}>{children}</PostHogContext.Provider>
  );
}

export function useAnalyticsConsent() {
  const context = useContext(PostHogContext);

  if (!context) {
    throw new Error("useAnalyticsConsent must be used within PostHogProvider");
  }

  return context;
}
