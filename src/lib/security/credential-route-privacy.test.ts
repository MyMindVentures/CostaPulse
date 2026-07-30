import { describe, expect, it } from "vitest";
import {
  isPrivateCredentialUrl,
  shouldDropCredentialTelemetry
} from "./credential-route-privacy";

describe("credential route telemetry privacy", () => {
  it.each([
    "/portal/credentials/documents",
    "/api/credentials/files/11111111-1111-4111-8111-111111111111",
    "https://costapulse.com/shared/credentials/secret-token/documents",
    "https://costapulse.com/api/shared/credentials/secret-token/files/file-id",
    "/api/admin/documents/files/file-id?intent=view"
  ])("classifies %s as private", (url) => {
    expect(isPrivateCredentialUrl(url)).toBe(true);
  });

  it("does not suppress unrelated public routes", () => {
    expect(isPrivateCredentialUrl("https://costapulse.com/experiences")).toBe(
      false
    );
  });

  it("drops both URL and transaction telemetry for credential routes", () => {
    expect(
      shouldDropCredentialTelemetry({
        url: "https://costapulse.com/shared/credentials/sensitive-token"
      })
    ).toBe(true);
    expect(
      shouldDropCredentialTelemetry({
        transaction: "GET /portal/credentials/documents/[documentType]"
      })
    ).toBe(true);
  });
});
