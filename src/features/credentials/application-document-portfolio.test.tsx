import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  ApplicationDocument,
  ApplicationDocumentPortfolio
} from "@/server/repositories/credential-portal";
import { ApplicationDocumentPortfolioPage } from "./application-document-portfolio";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => key)
}));
vi.mock("@/components/shared/protected-file-preview", () => ({
  ProtectedFilePreview: ({ fileName }: { fileName: string }) => (
    <div data-testid="protected-preview">{fileName}</div>
  )
}));

const context = {
  detailBaseHref: "/portal/credentials/documents",
  fileBaseHref: "/api/credentials/files",
  backHref: "/portal/credentials",
  canCreateShares: false
};

function createDocument(
  type: "cv" | "motivation_letter",
  id: string
): ApplicationDocument {
  return {
    id,
    document_type: type,
    category: "application",
    title: type === "cv" ? "Captain CV" : "Motivation letter",
    document_number: null,
    issuing_authority: null,
    issuing_country_code: null,
    issued_on: "2026-07-01",
    valid_from: null,
    expires_on: null,
    does_not_expire: true,
    qualification: null,
    stcw_code: null,
    restrictions: null,
    language_code: "en",
    page_count: 2,
    updated_at: "2026-07-30T12:00:00.000Z",
    status: "active",
    verification_status: "verified",
    computed_status: "valid",
    files: [
      {
        id,
        file_role: "primary",
        mime_type: "application/pdf",
        file_size_bytes: 2048,
        original_filename: `${type}.pdf`,
        version_number: 1,
        is_current: true,
        created_at: "2026-07-30T12:00:00.000Z"
      }
    ],
    currentFile: {
      id,
      file_role: "primary",
      mime_type: "application/pdf",
      file_size_bytes: 2048,
      original_filename: `${type}.pdf`,
      version_number: 1,
      is_current: true,
      created_at: "2026-07-30T12:00:00.000Z"
    }
  };
}

function createPortfolio(
  documents: ApplicationDocumentPortfolio["documents"],
  canDownloadFiles = true
): ApplicationDocumentPortfolio {
  return {
    grant_id: "11111111-1111-4111-8111-111111111111",
    share_link_id: null,
    owner_profile_id: "22222222-2222-4222-8222-222222222222",
    owner: {
      displayName: "Kevin",
      roleTitle: "Captain",
      introduction: "Maritime professional"
    },
    recipient_email: "reviewer@example.com",
    recipient_agency_label: null,
    permissions: {
      canViewFiles: true,
      canDownloadFiles,
      canViewDocumentNumbers: false,
      canViewHistory: false,
      canShare: false
    },
    access_expires_at: "2026-08-06T12:00:00.000Z",
    share_expires_at: null,
    documents
  };
}

describe("ApplicationDocumentPortfolioPage", () => {
  afterEach(cleanup);

  it("renders truthful empty states for zero documents", async () => {
    render(
      await ApplicationDocumentPortfolioPage({
        portfolio: createPortfolio({ cv: null, motivation_letter: null }),
        context,
        locale: "en"
      })
    );

    expect(screen.getAllByText("unavailable")).toHaveLength(4);
    expect(screen.queryByTestId("protected-preview")).not.toBeInTheDocument();
  });

  it("renders one available document without exposing denied downloads", async () => {
    render(
      await ApplicationDocumentPortfolioPage({
        portfolio: createPortfolio(
          {
            cv: createDocument("cv", "33333333-3333-4333-8333-333333333333"),
            motivation_letter: null
          },
          false
        ),
        context,
        locale: "en"
      })
    );

    expect(screen.getByText("Captain CV")).toBeInTheDocument();
    expect(screen.getAllByTestId("protected-preview")).toHaveLength(1);
    expect(screen.queryByText("actions.download")).not.toBeInTheDocument();
  });

  it("renders two current documents and permission-controlled downloads", async () => {
    render(
      await ApplicationDocumentPortfolioPage({
        portfolio: createPortfolio({
          cv: createDocument("cv", "44444444-4444-4444-8444-444444444444"),
          motivation_letter: createDocument(
            "motivation_letter",
            "55555555-5555-4555-8555-555555555555"
          )
        }),
        context,
        locale: "en"
      })
    );

    expect(screen.getAllByTestId("protected-preview")).toHaveLength(2);
    expect(screen.getAllByText("actions.download")).toHaveLength(2);
  });
});
