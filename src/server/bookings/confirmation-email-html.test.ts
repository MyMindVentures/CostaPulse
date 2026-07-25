import { describe, expect, it } from "vitest";
import { buildBookingPaymentReceivedHtml } from "./confirmation-email-html";

describe("buildBookingPaymentReceivedHtml", () => {
  it("escapes untrusted values in the HTML body", () => {
    const html = buildBookingPaymentReceivedHtml({
      greeting: 'Hi <script>alert("x")</script>,',
      intro: "We've received your payment.",
      rows: [
        {
          label: "Reference",
          value: "CP-1<img src=x onerror=alert(1)>"
        }
      ],
      outro: "Thanks"
    });

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("CP-1&lt;img");
  });
});
