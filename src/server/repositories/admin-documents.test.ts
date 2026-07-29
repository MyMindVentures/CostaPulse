import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fetchAdminDocumentsOverview } from "./admin-documents";

function buildDocument(input: {
  id: string;
  title: string;
  documentNumber: string | null;
  issuingAuthority: string | null;
  computedStatus: string;
  verificationStatus: string;
  updatedAt: string;
  expiresOn: string | null;
  doesNotExpire?: boolean;
}) {
  return {
    id: input.id,
    profile_id: "11111111-1111-4111-8111-111111111111",
    document_type: "passport",
    category: "identity",
    title: input.title,
    document_number: input.documentNumber,
    issuing_authority: input.issuingAuthority,
    issuing_country_code: "CR",
    issued_on: "2024-01-01",
    valid_from: "2024-01-01",
    expires_on: input.expiresOn,
    does_not_expire: input.doesNotExpire ?? false,
    confidentiality_level: "private",
    qualification: null,
    stcw_code: null,
    restrictions: null,
    notes: null,
    team_member_certificate_id: null,
    replaces_document_id: null,
    status: "active",
    verification_status: input.verificationStatus,
    computed_status: input.computedStatus,
    updated_at: input.updatedAt,
    files: []
  };
}

function createSupabaseMock(
  documents: unknown[],
  input?: { viewErrorMessage?: string }
) {
  const profilesTable = {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            id: "11111111-1111-4111-8111-111111111111",
            display_name: "Admin User"
          },
          error: null
        })
      })
    })
  };

  const documentsTable = {
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: documents,
        error: input?.viewErrorMessage
          ? { message: input.viewErrorMessage }
          : null
      })
    })
  };

  const baseDocumentsTable = {
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: documents,
        error: null
      })
    })
  };

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "11111111-1111-4111-8111-111111111111" } }
      })
    },
    from: vi.fn((table: string) => {
      if (table === "profiles") return profilesTable;
      if (table === "professional_documents_admin") return documentsTable;
      if (table === "professional_documents") return baseDocumentsTable;
      throw new Error(`Unexpected table: ${table}`);
    })
  };
}

function createSupabaseAdminMock(documents: unknown[]) {
  const baseDocumentsTable = {
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: documents,
        error: null
      })
    })
  };

  return {
    from: vi.fn((table: string) => {
      if (table === "professional_documents") return baseDocumentsTable;
      throw new Error(`Unexpected table: ${table}`);
    })
  };
}

describe("admin-documents repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searches by masked document number", async () => {
    const docs = [
      buildDocument({
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        title: "Passport Renewal",
        documentNumber: "ABCD1234",
        issuingAuthority: "Costa Rica Gov",
        computedStatus: "valid",
        verificationStatus: "pending",
        updatedAt: "2026-01-10T00:00:00.000Z",
        expiresOn: "2031-01-01"
      }),
      buildDocument({
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        title: "Medical Certificate",
        documentNumber: "ZXCV9876",
        issuingAuthority: "Clinic",
        computedStatus: "expired",
        verificationStatus: "verified",
        updatedAt: "2026-01-09T00:00:00.000Z",
        expiresOn: "2025-01-01"
      })
    ];

    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      createSupabaseMock(docs) as never
    );

    const result = await fetchAdminDocumentsOverview({ search: "****1234" });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;

    expect(result.documents).toHaveLength(1);
    expect(result.documents[0]?.id).toBe(
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
    );
    expect(result.summary.pendingVerification).toBe(1);
  });

  it("filters expiring documents and sorts by expiry ascending", async () => {
    const docs = [
      buildDocument({
        id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        title: "STCW Refresher",
        documentNumber: "STCW-001",
        issuingAuthority: "Academy",
        computedStatus: "expires_within_90_days",
        verificationStatus: "pending",
        updatedAt: "2026-01-12T00:00:00.000Z",
        expiresOn: "2026-10-01"
      }),
      buildDocument({
        id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        title: "GMDSS",
        documentNumber: "GMDSS-777",
        issuingAuthority: "Maritime Institute",
        computedStatus: "expires_within_30_days",
        verificationStatus: "pending",
        updatedAt: "2026-01-11T00:00:00.000Z",
        expiresOn: "2026-08-01"
      }),
      buildDocument({
        id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        title: "Insurance",
        documentNumber: "INS-22",
        issuingAuthority: "Carrier",
        computedStatus: "valid",
        verificationStatus: "verified",
        updatedAt: "2026-01-13T00:00:00.000Z",
        expiresOn: "2030-01-01"
      })
    ];

    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      createSupabaseMock(docs) as never
    );

    const result = await fetchAdminDocumentsOverview({
      expiry: "expiring",
      sort: "expiry_asc"
    });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;

    expect(result.filteredCount).toBe(2);
    expect(result.documents.map((item) => item.id)).toEqual([
      "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
    ]);
  });

  it("returns unauthenticated when no session user is present", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null }
        })
      }
    } as never);

    await expect(fetchAdminDocumentsOverview()).resolves.toEqual({
      status: "unauthenticated",
      message: "Authentication is required."
    });
  });

  it("falls back to base table query when admin view role function is denied", async () => {
    const docs = [
      buildDocument({
        id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
        title: "Fallback Passport",
        documentNumber: "FALL-1234",
        issuingAuthority: "Authority",
        computedStatus: "valid",
        verificationStatus: "pending",
        updatedAt: "2026-01-14T00:00:00.000Z",
        expiresOn: "2030-01-01"
      })
    ];

    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      createSupabaseMock(docs, {
        viewErrorMessage: "permission denied for function has_any_role"
      }) as never
    );
    vi.mocked(createSupabaseAdminClient).mockReturnValue(
      createSupabaseAdminMock(docs) as never
    );

    const result = await fetchAdminDocumentsOverview();

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;

    expect(result.documents).toHaveLength(1);
    expect(result.documents[0]?.id).toBe(
      "ffffffff-ffff-4fff-8fff-ffffffffffff"
    );
  });
});
