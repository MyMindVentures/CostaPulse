import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getLocale: vi.fn(async () => "en"),
  getTranslations: vi.fn(async () => (key: string) => key)
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
    getSharedApplicationDocumentPortfolio: vi.fn()
  };
});

import {
  CredentialPortfolioError,
  getSharedApplicationDocumentPortfolio
} from "@/server/repositories/credential-portal";
import SharedApplicationDocumentsPage, { generateMetadata } from "./page";

describe("shared application-document route", () => {
  it("renders a truthful unavailable state for an invalid or expired token", async () => {
    vi.mocked(getSharedApplicationDocumentPortfolio).mockRejectedValue(
      new CredentialPortfolioError("SHARE_NOT_FOUND", "SHARE_NOT_FOUND")
    );

    render(
      await SharedApplicationDocumentsPage({
        params: Promise.resolve({ token: "sensitive-token" })
      })
    );

    expect(
      screen.getByRole("heading", { name: "accessUnavailable.title" })
    ).toBeInTheDocument();
    expect(screen.queryByText("sensitive-token")).not.toBeInTheDocument();
  });

  it("keeps the localized token route non-indexed", async () => {
    await expect(generateMetadata()).resolves.toMatchObject({
      title: "metaSharedOverviewTitle",
      robots: { index: false, follow: false }
    });
  });
});
