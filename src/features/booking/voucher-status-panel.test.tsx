/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import messages from "../../../messages/en.json";
import { VoucherStatusPanel } from "./voucher-status-panel";

afterEach(cleanup);

describe("VoucherStatusPanel", () => {
  it("shows an issued voucher with its partner restriction", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <VoucherStatusPanel
          sessionId="cs_test_123"
          locale="en-GB"
          initialState={{
            status: "issued",
            voucher: {
              id: "11111111-1111-4111-8111-111111111111",
              booking_id: "22222222-2222-4222-8222-222222222222",
              code: "VCH-ABC123",
              voucher_amount_minor: 4500,
              currency: "EUR",
              status: "issued",
              issued_at: "2026-07-25T10:00:00+00:00",
              expires_at: "2026-08-24T10:00:00+00:00",
              partner: {
                id: "33333333-3333-4333-8333-333333333333",
                name: "La Marina"
              }
            }
          }}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("VCH-ABC123")).toBeTruthy();
    expect(screen.getByText(/Redeem only at La Marina/)).toBeTruthy();
  });

  it("shows a truthful pending state", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <VoucherStatusPanel
          sessionId="cs_test_123"
          locale="en-GB"
          initialState={{ status: "pending" }}
        />
      </NextIntlClientProvider>
    );
    expect(screen.getByRole("status")).toBeTruthy();
  });
});
