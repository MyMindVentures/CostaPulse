import { describe, expect, it } from "vitest";
import {
  formatCredentialCategory,
  formatCredentialComputedStatus,
  formatCredentialDocumentType,
  formatCredentialFileRole,
  formatCredentialRecordStatus,
  formatCredentialVerificationStatus
} from "./labels";

function createTranslator() {
  return (key: string) => `t:${key}`;
}

describe("credential label formatters", () => {
  const t = createTranslator();

  it("humanizes freeform tokens for document type and category", () => {
    expect(formatCredentialDocumentType("medical_certificate")).toBe(
      "Medical Certificate"
    );
    expect(formatCredentialCategory("safety_training")).toBe("Safety Training");
  });

  it("maps known verification and computed statuses to translation keys", () => {
    expect(formatCredentialVerificationStatus(t, "verified")).toBe(
      "t:labels.verificationStatus.verified"
    );
    expect(formatCredentialComputedStatus(t, "expires_within_30_days")).toBe(
      "t:labels.computedStatus.expiresWithin30Days"
    );
  });

  it("falls back to humanized text for unknown statuses", () => {
    expect(formatCredentialVerificationStatus(t, "custom_status")).toBe(
      "Custom Status"
    );
    expect(formatCredentialComputedStatus(t, "special_case")).toBe(
      "Special Case"
    );
  });

  it("maps record status and file roles", () => {
    expect(formatCredentialRecordStatus(t, "active")).toBe(
      "t:labels.recordStatus.active"
    );
    expect(formatCredentialFileRole(t, "supporting_evidence")).toBe(
      "t:labels.fileRole.supportingEvidence"
    );
  });
});
