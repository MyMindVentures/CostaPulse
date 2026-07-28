import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getLocale = vi.fn();
const getMessages = vi.fn();

vi.mock("next-intl/server", () => ({
  getLocale,
  getMessages
}));

vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({
    children,
    locale,
    messages
  }: {
    children: React.ReactNode;
    locale: string;
    messages: Record<string, unknown>;
  }) => (
    <div
      data-intl-locale={locale}
      data-intl-message-count={Object.keys(messages).length}
    >
      {children}
    </div>
  )
}));

vi.mock("@/features/analytics/posthog-provider", () => ({
  PostHogProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )
}));

vi.mock("@/features/analytics/consent-banner", () => ({
  ConsentBanner: () => <div data-consent-banner />
}));

vi.mock("@/lib/media/experience-media", () => ({
  BRAND_ASSETS_BUCKET: "brand-assets",
  getPublicStorageUrl: () => null
}));

describe("RootLayout", () => {
  beforeEach(() => {
    getLocale.mockResolvedValue("nl");
    getMessages.mockResolvedValue({ navigation: { home: "Home" } });
  });

  it("passes an explicit locale and messages to the intl provider during SSR", async () => {
    const { default: RootLayout } = await import("./layout");
    const element = await RootLayout({ children: <main>SSR content</main> });
    const html = renderToStaticMarkup(element);

    expect(getLocale).toHaveBeenCalledOnce();
    expect(getMessages).toHaveBeenCalledOnce();
    expect(html).toContain('lang="nl"');
    expect(html).toContain('data-intl-locale="nl"');
    expect(html).toContain('data-intl-message-count="1"');
    expect(html).toContain("SSR content");
  });
});
