import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getLocale: vi.fn(async () => "en"),
  getTranslations: vi.fn(async () => (key: string) => key)
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  })
}));
vi.mock("@/features/credentials/application-document-portfolio", () => ({
  ApplicationDocumentPortfolioPage: vi.fn()
}));
vi.mock("@/server/repositories/credential-portal", () => {
  class CredentialPortfolioError extends Error {
    constructor(
      readonly code: string,
      message: string
    ) {
      super(message);
    }
  }

  return {
    CredentialPortfolioError,
    getAuthenticatedApplicationDocumentPortfolio: vi.fn()
  };
});

import {
  CredentialPortfolioError,
  getAuthenticatedApplicationDocumentPortfolio
} from "@/server/repositories/credential-portal";
import AuthenticatedApplicationDocumentsPage, {
  generateMetadata
} from "./page";

describe("authenticated application-document route", () => {
  it("redirects unauthenticated recipients without rendering portfolio data", async () => {
    vi.mocked(getAuthenticatedApplicationDocumentPortfolio).mockRejectedValue(
      new CredentialPortfolioError("UNAUTHORIZED", "AUTH_REQUIRED")
    );

    await expect(AuthenticatedApplicationDocumentsPage()).rejects.toThrow(
      "redirect:/login?auth=required&next=/portal/credentials/documents"
    );
  });

  it("keeps the localized route non-indexed", async () => {
    await expect(generateMetadata()).resolves.toMatchObject({
      title: "metaOverviewTitle",
      robots: { index: false, follow: false }
    });
  });
});
