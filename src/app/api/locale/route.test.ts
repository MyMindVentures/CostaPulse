import { afterEach, describe, expect, it } from "vitest";
import { GET } from "./route";

const originalNodeEnv = process.env.NODE_ENV;
const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  Object.defineProperty(process.env, "NODE_ENV", {
    value: originalNodeEnv,
    configurable: true,
    writable: true,
    enumerable: true
  });
  process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
});

describe("GET /api/locale", () => {
  it("uses the public site origin in production and preserves path and query", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      configurable: true,
      writable: true,
      enumerable: true
    });
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.costapulse.club/";

    const response = await GET(
      new Request(
        "http://0.0.0.0:8080/api/locale?locale=nl&next=%2Fexperiences%3Fref%3Dpartner"
      )
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://www.costapulse.club/experiences?ref=partner"
    );
    expect(response.cookies.get("NEXT_LOCALE")?.value).toBe("nl");
  });

  it("keeps the request origin during local development", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      configurable: true,
      writable: true,
      enumerable: true
    });
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.costapulse.club/";

    const response = await GET(
      new Request(
        "http://localhost:3000/api/locale?locale=de&next=%2Fbook%3Fstep%3D2"
      )
    );

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/book?step=2"
    );
  });

  it("blocks external redirect targets", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      configurable: true,
      writable: true,
      enumerable: true
    });
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.costapulse.club";

    const response = await GET(
      new Request(
        "http://0.0.0.0:8080/api/locale?locale=fr&next=https%3A%2F%2Fevil.example"
      )
    );

    expect(response.headers.get("location")).toBe(
      "https://www.costapulse.club/"
    );
  });
});
