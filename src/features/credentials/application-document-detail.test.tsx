import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ApplicationDocument } from "@/server/repositories/credential-portal";
import { ApplicationDocumentDetailPage } from "./application-document-detail";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => key)
}));
vi.mock("@/components/shared/protected-file-preview", () => ({
  ProtectedFilePreview: ({ fileName }: { fileName: string }) => (
    <div data-testid="protected-preview">{fileName}</div>
  )
}));

const document: ApplicationDocument = {
  id: "33333333-3333-4333-8333-333333333333",
  document_type: "cv",
  category: "employment",
  title: "Captain CV",
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
      id: "44444444-4444-4444-8444-444444444444",
      file_role: "primary",
      mime_type: "application/pdf",
      file_size_bytes: 2048,
      original_filename: "captain-cv.pdf",
      version_number: 1,
      is_current: true,
      created_at: "2026-07-30T12:00:00.000Z"
    }
  ],
  currentFile: {
    id: "44444444-4444-4444-8444-444444444444",
    file_role: "primary",
    mime_type: "application/pdf",
    file_size_bytes: 2048,
    original_filename: "captain-cv.pdf",
    version_number: 1,
    is_current: true,
    created_at: "2026-07-30T12:00:00.000Z"
  }
};

describe("ApplicationDocumentDetailPage", () => {
  afterEach(cleanup);

  it("previews a granted file without exposing a denied download action", async () => {
    render(
      await ApplicationDocumentDetailPage({
        document,
        type: "cv",
        locale: "en",
        overviewHref: "/portal/credentials/documents",
        fileBaseHref: "/api/credentials/files",
        canDownload: false,
        canShare: false
      })
    );

    expect(screen.getByTestId("protected-preview")).toHaveTextContent(
      "captain-cv.pdf"
    );
    expect(screen.queryByText("actions.download")).not.toBeInTheDocument();
    expect(screen.getByText("share.notPermitted")).toBeInTheDocument();
  });

  it("renders the protected download action only when permitted", async () => {
    render(
      await ApplicationDocumentDetailPage({
        document,
        type: "cv",
        locale: "en",
        overviewHref: "/portal/credentials/documents",
        fileBaseHref: "/api/credentials/files",
        canDownload: true,
        canShare: false
      })
    );

    expect(
      screen.getByRole("link", { name: "actions.download" })
    ).toHaveAttribute(
      "href",
      "/api/credentials/files/44444444-4444-4444-8444-444444444444?intent=download"
    );
  });
});
