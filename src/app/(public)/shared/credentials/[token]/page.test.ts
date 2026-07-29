import { describe, expect, it } from "vitest";
import {
  filterSharedCredentials,
  normalizeSharedCredentialFilters
} from "@/features/credentials/shared-filters";

const credentials = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    document_type: "passport",
    category: "identity",
    title: "Passport",
    document_number: null,
    issuing_authority: "Maritime Agency",
    issuing_country_code: null,
    issued_on: null,
    valid_from: null,
    expires_on: null,
    does_not_expire: false,
    qualification: null,
    stcw_code: null,
    restrictions: null,
    status: "active",
    verification_status: "verified",
    computed_status: "valid",
    files: []
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    document_type: "medical_certificate",
    category: "medical",
    title: "Medical Certificate",
    document_number: null,
    issuing_authority: "Harbor Clinic",
    issuing_country_code: null,
    issued_on: null,
    valid_from: null,
    expires_on: null,
    does_not_expire: false,
    qualification: null,
    stcw_code: null,
    restrictions: null,
    status: "replaced",
    verification_status: "pending",
    computed_status: "expired",
    files: []
  }
];

describe("normalizeSharedCredentialFilters", () => {
  it("normalizes blanks and trims strings", () => {
    expect(
      normalizeSharedCredentialFilters({
        search: "  Passport ",
        category: " identity ",
        recordState: "  "
      })
    ).toEqual({
      search: "passport",
      documentType: "all",
      category: "identity",
      validity: "all",
      verification: "all",
      recordState: "all"
    });
  });
});

describe("filterSharedCredentials", () => {
  it("filters by search text", () => {
    const result = filterSharedCredentials(credentials, { search: "harbor" });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("22222222-2222-4222-8222-222222222222");
  });

  it("filters by document type and verification", () => {
    const result = filterSharedCredentials(credentials, {
      documentType: "passport",
      verification: "verified"
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("filters to only historical records", () => {
    const result = filterSharedCredentials(credentials, {
      recordState: "historical"
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.status).toBe("replaced");
  });
});
