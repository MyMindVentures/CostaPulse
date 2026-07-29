import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn()
}));

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fetchAdminTeamMemberCertificateDetail } from "./admin-documents";

function createAdminMock(input: {
  certificate: Record<string, unknown> | null;
  linkedDocuments: Array<Record<string, unknown>>;
}) {
  const certificateTable = {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: input.certificate,
          error: null
        })
      })
    })
  };

  const linkedDocumentsTable = {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: input.linkedDocuments,
          error: null
        })
      })
    })
  };

  return {
    from: vi.fn((table: string) => {
      if (table === "team_member_certificates") return certificateTable;
      if (table === "professional_documents") return linkedDocumentsTable;
      throw new Error(`Unexpected table: ${table}`);
    })
  };
}

describe("fetchAdminTeamMemberCertificateDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when admin client is unavailable", async () => {
    vi.mocked(createSupabaseAdminClient).mockReturnValue(null as never);

    const result = await fetchAdminTeamMemberCertificateDetail(
      "8ce904db-ba62-41a7-ba90-e006a243e7ab"
    );

    expect(result).toBeNull();
  });

  it("returns linked professional document files for certificate previews", async () => {
    vi.mocked(createSupabaseAdminClient).mockReturnValue(
      createAdminMock({
        certificate: {
          id: "8ce904db-ba62-41a7-ba90-e006a243e7ab",
          team_member_id: "4e6a0ff1-8ae8-455c-8895-8f6b68dacf95",
          title: "Medical Certificate",
          certificate_type: "medical",
          certificate_number: "MED-1234",
          issuing_organization: "Costa Authority",
          issued_on: "2026-01-01",
          valid_from: "2026-01-01",
          expires_on: "2028-01-01",
          does_not_expire: false,
          status: "active",
          verification_status: "pending",
          credential_url: null,
          verification_url: null,
          description: null,
          skills: [],
          updated_at: "2026-07-29T10:00:00.000Z",
          team_member: {
            id: "4e6a0ff1-8ae8-455c-8895-8f6b68dacf95",
            first_name: "Kevin",
            last_name: "De Vlieger",
            display_name: "Kevin De Vlieger"
          }
        },
        linkedDocuments: [
          {
            id: "4f80ece8-bf46-4f38-b5d2-01cf1093584c",
            title: "Medical Certificate Upload",
            updated_at: "2026-07-28T10:00:00.000Z",
            files: [
              {
                id: "bbc2e9e2-a570-4d63-8f53-f3d5f498f649",
                file_role: "primary",
                is_current: true,
                version_number: 1,
                original_filename: "medical-certificate.pdf",
                mime_type: "application/pdf",
                file_size_bytes: 98123,
                created_at: "2026-07-28T10:00:00.000Z"
              }
            ]
          }
        ]
      }) as never
    );

    const result = await fetchAdminTeamMemberCertificateDetail(
      "8ce904db-ba62-41a7-ba90-e006a243e7ab"
    );

    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.linked_documents).toHaveLength(1);
    expect(result.linked_documents[0]?.title).toBe(
      "Medical Certificate Upload"
    );
    expect(result.linked_documents[0]?.files).toHaveLength(1);
    expect(result.linked_documents[0]?.files[0]?.mime_type).toBe(
      "application/pdf"
    );
  });
});
