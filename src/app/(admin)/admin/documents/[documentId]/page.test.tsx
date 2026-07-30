import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminDocumentDetailPage from "./page";
import { fetchAdminDocumentDetail } from "@/server/repositories/admin-documents";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => key)
}));

vi.mock("@/server/auth/protected-area", () => ({
  requireAreaAccess: vi.fn(async () => ({
    roles: ["super_administrator"]
  }))
}));

vi.mock("@/server/auth/role-access", () => ({
  canAccessAdminSection: vi.fn(() => true),
  canMutateAdminOpsContent: vi.fn(() => false)
}));

vi.mock("@/server/documents/actions", () => ({
  setProfessionalDocumentVerificationAction: vi.fn()
}));

vi.mock("@/server/repositories/admin-documents", () => ({
  fetchAdminDocumentDetail: vi.fn()
}));

vi.mock("@/components/shared/protected-file-preview", () => ({
  ProtectedFilePreview: ({
    fileId,
    fileName,
    mimeType
  }: {
    fileId: string;
    fileName: string;
    mimeType: string;
  }) => (
    <div
      data-testid="protected-file-preview"
      data-file-id={fileId}
      data-file-name={fileName}
      data-mime-type={mimeType}
    />
  )
}));

const documentFixture = {
  id: "11111111-1111-4111-8111-111111111111",
  profile_id: "22222222-2222-4222-8222-222222222222",
  document_type: "other",
  category: "other",
  title: "Test document",
  document_number: null,
  issuing_authority: null,
  issuing_country_code: null,
  issued_on: null,
  valid_from: null,
  expires_on: null,
  does_not_expire: false,
  confidentiality_level: "private",
  qualification: null,
  stcw_code: null,
  restrictions: null,
  notes: null,
  language_code: null,
  page_count: null,
  team_member_certificate_id: null,
  replaces_document_id: null,
  status: "active",
  verification_status: "unverified",
  computed_status: "validity_unknown",
  updated_at: "2026-07-30T00:00:00.000Z",
  files: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      file_role: "primary",
      is_current: true,
      version_number: 1,
      original_filename: "credential.pdf",
      mime_type: "application/pdf",
      file_size_bytes: 127746,
      created_at: "2026-07-30T00:00:00.000Z"
    }
  ]
};

describe("AdminDocumentDetailPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.mocked(fetchAdminDocumentDetail).mockResolvedValue({
      status: "ok",
      document: documentFixture
    });
  });

  it("renders a protected inline preview and browser-native file actions", async () => {
    render(
      await AdminDocumentDetailPage({
        params: Promise.resolve({ documentId: documentFixture.id }),
        searchParams: Promise.resolve({})
      })
    );

    const preview = screen.getByTestId("protected-file-preview");
    expect(preview).toHaveAttribute(
      "data-file-id",
      documentFixture.files[0].id
    );
    expect(preview).toHaveAttribute("data-file-name", "credential.pdf");
    expect(preview).toHaveAttribute("data-mime-type", "application/pdf");

    const openLink = screen.getByRole("link", {
      name: "documentsActionPreview"
    });
    expect(openLink).toHaveAttribute(
      "href",
      `/api/admin/documents/files/${documentFixture.files[0].id}?intent=view`
    );
    expect(openLink).toHaveAttribute("target", "_blank");

    expect(
      screen.getByRole("link", { name: "documentsActionDownload" })
    ).toHaveAttribute(
      "href",
      `/api/admin/documents/files/${documentFixture.files[0].id}?intent=download`
    );
  });

  it("renders the empty state without a preview when no files are connected", async () => {
    vi.mocked(fetchAdminDocumentDetail).mockResolvedValue({
      status: "ok",
      document: { ...documentFixture, files: [] }
    });

    render(
      await AdminDocumentDetailPage({
        params: Promise.resolve({ documentId: documentFixture.id }),
        searchParams: Promise.resolve({})
      })
    );

    expect(
      screen.queryByTestId("protected-file-preview")
    ).not.toBeInTheDocument();
  });
});
