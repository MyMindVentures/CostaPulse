import { beforeEach, describe, expect, it, vi } from "vitest";
import { LOCALE_COOKIE_NAME } from "./locales";

const cookiesGet = vi.fn();
const getRequestConfig = vi.fn((factory: () => Promise<unknown>) => factory);

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: cookiesGet })
}));

vi.mock("next-intl/server", () => ({
  getRequestConfig
}));

describe("i18n request config", () => {
  beforeEach(() => {
    cookiesGet.mockReset();
    getRequestConfig.mockClear();
    vi.resetModules();
  });

  it("resolves the NEXT_LOCALE cookie into the request locale", async () => {
    cookiesGet.mockImplementation((name: string) =>
      name === LOCALE_COOKIE_NAME ? { value: "nl" } : undefined
    );

    const mod = await import("./request");
    const configFactory = mod.default as () => Promise<{
      locale: string;
      messages: Record<string, unknown>;
    }>;
    const config = await configFactory();

    expect(config.locale).toBe("nl");
    expect(config.messages).toBeTypeOf("object");
    expect(Object.keys(config.messages).length).toBeGreaterThan(0);
  });

  it("falls back to English when the cookie is missing", async () => {
    cookiesGet.mockReturnValue(undefined);

    const mod = await import("./request");
    const configFactory = mod.default as () => Promise<{ locale: string }>;
    const config = await configFactory();

    expect(config.locale).toBe("en");
  });
});
