import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { Resend } from "resend";
import { sendTransactionalEmail } from "./resend";

const sendMock = vi.fn();

function createClient(): Resend {
  return {
    emails: {
      send: sendMock
    }
  } as unknown as Resend;
}

describe("sendTransactionalEmail", () => {
  beforeEach(() => {
    sendMock.mockReset();
  });

  it("returns disabled when no Resend client is configured", async () => {
    await expect(
      sendTransactionalEmail(
        {
          to: "guest@example.com",
          subject: "Hello",
          html: "<p>Hello</p>"
        },
        null
      )
    ).resolves.toEqual({ ok: false, reason: "disabled" });

    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns invalid_input for malformed payloads", async () => {
    await expect(
      sendTransactionalEmail(
        {
          to: "not-an-email",
          subject: "Hello",
          html: "<p>Hello</p>"
        },
        createClient()
      )
    ).resolves.toEqual({ ok: false, reason: "invalid_input" });

    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns invalid_input when no from address is available", async () => {
    delete process.env.RESEND_FROM_EMAIL;

    await expect(
      sendTransactionalEmail(
        {
          to: "guest@example.com",
          subject: "Hello",
          html: "<p>Hello</p>"
        },
        createClient()
      )
    ).resolves.toEqual({ ok: false, reason: "invalid_input" });

    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns the provider id on success", async () => {
    sendMock.mockResolvedValue({
      data: { id: "email_123" },
      error: null
    });

    await expect(
      sendTransactionalEmail(
        {
          to: "guest@example.com",
          subject: "Hello",
          html: "<p>Hello</p>",
          from: "CostaPulse <noreply@example.com>"
        },
        createClient()
      )
    ).resolves.toEqual({ ok: true, id: "email_123" });

    expect(sendMock).toHaveBeenCalledOnce();
  });

  it("returns send_failed when the provider reports an error", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { message: "boom", name: "application_error" }
    });

    await expect(
      sendTransactionalEmail(
        {
          to: "guest@example.com",
          subject: "Hello",
          html: "<p>Hello</p>",
          from: "noreply@example.com"
        },
        createClient()
      )
    ).resolves.toEqual({ ok: false, reason: "send_failed" });
  });
});
