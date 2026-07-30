import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  applicationDocumentRouteFromType,
  applicationDocumentTypeFromRoute,
  CredentialPortfolioError,
  getAuthenticatedCredentialPortfolio,
  getSharedCredentialPortfolio,
  listOwnerCredentialAccessGrants,
  listShareableCredentialDocuments,
  toApplicationDocumentPortfolio
} from "./credential-portal";

describe("credential portal repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws not configured when Supabase client is missing", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);

    await expect(getAuthenticatedCredentialPortfolio()).rejects.toMatchObject({
      code: "NOT_CONFIGURED"
    });
  });

  it("maps RPC auth errors to unauthorized", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "AUTH_EMAIL_REQUIRED" }
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({ rpc } as never);

    await expect(getAuthenticatedCredentialPortfolio()).rejects.toMatchObject({
      code: "UNAUTHORIZED"
    });
  });

  it("accepts only the two supported application-document route slugs", () => {
    expect(applicationDocumentTypeFromRoute("cv")).toBe("cv");
    expect(applicationDocumentTypeFromRoute("motivation-letter")).toBe(
      "motivation_letter"
    );
    expect(applicationDocumentTypeFromRoute("motivation_letter")).toBeNull();
    expect(applicationDocumentTypeFromRoute("passport")).toBeNull();
    expect(applicationDocumentRouteFromType("cv")).toBe("cv");
    expect(applicationDocumentRouteFromType("motivation_letter")).toBe(
      "motivation-letter"
    );
  });

  it("returns parsed portfolio for shared token rpc", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        grant_id: "11111111-1111-4111-8111-111111111111",
        share_link_id: "22222222-2222-4222-8222-222222222222",
        owner_profile_id: "33333333-3333-4333-8333-333333333333",
        owner: {
          displayName: "Kevin",
          roleTitle: "Captain",
          introduction: "Maritime professional"
        },
        recipient_email: "reviewer@example.com",
        recipient_agency_label: "Agency",
        permissions: {
          canViewFiles: true,
          canDownloadFiles: false,
          canViewDocumentNumbers: false,
          canViewHistory: false,
          canShare: false
        },
        access_expires_at: null,
        share_expires_at: null,
        credentials: [
          {
            id: "44444444-4444-4444-8444-444444444444",
            document_type: "passport",
            category: "identity",
            title: "Passport",
            document_number: null,
            issuing_authority: null,
            issuing_country_code: null,
            issued_on: null,
            valid_from: null,
            expires_on: null,
            does_not_expire: false,
            qualification: null,
            stcw_code: null,
            restrictions: null,
            language_code: null,
            page_count: null,
            updated_at: "2026-01-01T00:00:00.000Z",
            status: "active",
            verification_status: "verified",
            computed_status: "valid",
            files: [
              {
                id: "55555555-5555-4555-8555-555555555555",
                file_role: "primary",
                mime_type: "application/pdf",
                file_size_bytes: 1024,
                original_filename: "passport.pdf",
                version_number: 1,
                is_current: true,
                created_at: "2026-01-01T00:00:00.000Z"
              }
            ]
          }
        ]
      },
      error: null
    });

    vi.mocked(createSupabaseServerClient).mockResolvedValue({ rpc } as never);

    const result = await getSharedCredentialPortfolio("share-token");

    expect(result.recipient_email).toBe("reviewer@example.com");
    expect(result.credentials).toHaveLength(1);
    expect(rpc).toHaveBeenCalledWith("get_shared_credential_portfolio", {
      p_token: "share-token"
    });
  });

  it("parses owner grants list", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          owner_profile_id: "33333333-3333-4333-8333-333333333333",
          recipient_profile_id: null,
          recipient_email: "reviewer@example.com",
          recipient_agency_label: null,
          permission_view_files: true,
          permission_download_files: false,
          permission_include_history: false,
          permission_include_document_number: false,
          permission_create_share_links: false,
          access_expires_at: null,
          revoked_at: null,
          last_magic_link_sent_at: null,
          created_at: "2026-01-01T00:00:00.000Z"
        }
      ],
      error: null
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({ rpc } as never);

    const result = await listOwnerCredentialAccessGrants();

    expect(result).toHaveLength(1);
    expect(result[0]?.recipient_email).toBe("reviewer@example.com");
  });

  it("maps shared portfolio into shareable documents", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        grant_id: "11111111-1111-4111-8111-111111111111",
        owner_profile_id: "33333333-3333-4333-8333-333333333333",
        owner: {
          displayName: "Kevin",
          roleTitle: "Captain",
          introduction: null
        },
        recipient_email: "reviewer@example.com",
        recipient_agency_label: null,
        permissions: {
          canViewFiles: true,
          canDownloadFiles: false,
          canViewDocumentNumbers: false,
          canViewHistory: false,
          canShare: false
        },
        access_expires_at: null,
        credentials: [
          {
            id: "44444444-4444-4444-8444-444444444444",
            document_type: "passport",
            category: "identity",
            title: "Passport",
            document_number: null,
            issuing_authority: null,
            issuing_country_code: null,
            issued_on: null,
            valid_from: null,
            expires_on: null,
            does_not_expire: true,
            qualification: null,
            stcw_code: null,
            restrictions: null,
            language_code: null,
            page_count: null,
            updated_at: "2026-01-01T00:00:00.000Z",
            status: "active",
            verification_status: "verified",
            computed_status: "valid",
            files: []
          }
        ]
      },
      error: null
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({ rpc } as never);

    const result = await listShareableCredentialDocuments();

    expect(result).toEqual([
      {
        id: "44444444-4444-4444-8444-444444444444",
        title: "Passport",
        document_type: "passport",
        verification_status: "verified",
        status: "active",
        expires_on: null,
        does_not_expire: true
      }
    ]);
  });

  it("throws invalid payload for malformed portfolio", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { invalid: true },
      error: null
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({ rpc } as never);

    await expect(getSharedCredentialPortfolio("token")).rejects.toBeInstanceOf(
      CredentialPortfolioError
    );
    await expect(getSharedCredentialPortfolio("token")).rejects.toMatchObject({
      code: "INVALID_PAYLOAD"
    });
  });

  it("selects the newest active verified application documents deterministically", () => {
    const baseCredential = {
      category: "application",
      document_number: null,
      issuing_authority: null,
      issuing_country_code: null,
      issued_on: "2026-01-01",
      valid_from: null,
      expires_on: null,
      does_not_expire: true,
      qualification: null,
      stcw_code: null,
      restrictions: null,
      status: "active",
      verification_status: "verified",
      computed_status: "valid",
      language_code: "en",
      page_count: 2,
      files: []
    };
    const portfolio = {
      grant_id: "11111111-1111-4111-8111-111111111111",
      share_link_id: null,
      owner_profile_id: "33333333-3333-4333-8333-333333333333",
      owner: {
        displayName: "Kevin",
        roleTitle: "Captain",
        introduction: null
      },
      recipient_email: "reviewer@example.com",
      recipient_agency_label: null,
      permissions: {
        canViewFiles: true,
        canDownloadFiles: true,
        canViewDocumentNumbers: false,
        canViewHistory: false,
        canShare: true
      },
      access_expires_at: "2026-08-06T12:00:00.000Z",
      share_expires_at: null,
      credentials: [
        {
          ...baseCredential,
          id: "44444444-4444-4444-8444-444444444444",
          document_type: "cv",
          title: "Older CV",
          updated_at: "2026-06-01T00:00:00.000Z"
        },
        {
          ...baseCredential,
          id: "55555555-5555-4555-8555-555555555555",
          document_type: "cv",
          title: "Current CV",
          updated_at: "2026-07-01T00:00:00.000Z"
        },
        {
          ...baseCredential,
          id: "66666666-6666-4666-8666-666666666666",
          document_type: "motivation_letter",
          title: "Motivation letter",
          updated_at: "2026-07-02T00:00:00.000Z"
        },
        {
          ...baseCredential,
          id: "77777777-7777-4777-8777-777777777777",
          document_type: "cv",
          title: "Replaced CV",
          status: "replaced",
          updated_at: "2026-07-30T00:00:00.000Z"
        }
      ]
    } satisfies Parameters<typeof toApplicationDocumentPortfolio>[0];

    const result = toApplicationDocumentPortfolio(portfolio);

    expect(result.documents.cv?.title).toBe("Current CV");
    expect(result.documents.motivation_letter?.title).toBe("Motivation letter");
  });
});
