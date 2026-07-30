import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { ApplicationDocumentShare } from "./application-document-share";
import { createRecipientCredentialShareLinkAction } from "@/server/credentials/actions";

vi.mock("@/server/credentials/actions", () => ({
  createRecipientCredentialShareLinkAction: vi.fn()
}));
vi.mock("@/lib/credentials/access-expiry", () => ({
  getDefaultCredentialExpiry: vi.fn(() => "2026-08-06T12:00:00.000Z")
}));

const labels = {
  action: "Create share",
  expiry: "Expires",
  copied: "Copied",
  shared: "Shared",
  error: "Could not share"
};

describe("ApplicationDocumentShare", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createRecipientCredentialShareLinkAction).mockResolvedValue({
      ok: true,
      shareId: "11111111-1111-4111-8111-111111111111",
      shareUrl: "https://costapulse.test/shared/credentials/private/documents"
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
  });

  it("uses the clipboard fallback and announces completion", async () => {
    render(<ApplicationDocumentShare labels={labels} />);

    fireEvent.keyDown(screen.getByRole("button", { name: "Create share" }), {
      key: "Enter"
    });
    fireEvent.click(screen.getByRole("button", { name: "Create share" }));

    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "https://costapulse.test/shared/credentials/private/documents"
    );
    expect(screen.getByText("Copied")).toHaveAttribute("aria-live", "polite");
  });

  it("prefers native Web Share when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: share
    });
    render(<ApplicationDocumentShare labels={labels} />);

    fireEvent.click(screen.getByRole("button", { name: "Create share" }));

    await waitFor(() => expect(screen.getByText("Shared")).toBeInTheDocument());
    expect(share).toHaveBeenCalledWith({
      url: "https://costapulse.test/shared/credentials/private/documents"
    });
  });

  it("announces a localized error without exposing backend error tokens", async () => {
    vi.mocked(createRecipientCredentialShareLinkAction).mockResolvedValue({
      ok: false,
      message: "EXPIRY_EXCEEDS_GRANT"
    });
    render(<ApplicationDocumentShare labels={labels} />);

    fireEvent.click(screen.getByRole("button", { name: "Create share" }));

    await waitFor(() =>
      expect(screen.getByText("Could not share")).toBeInTheDocument()
    );
    expect(screen.queryByText(/EXPIRY_EXCEEDS_GRANT/)).not.toBeInTheDocument();
  });

  it("caps the default picker at the parent grant expiry", () => {
    const maximumExpiry = new Date("2026-08-03T12:00:00.000Z");
    const expectedLocalValue = new Date(
      maximumExpiry.getTime() - maximumExpiry.getTimezoneOffset() * 60_000
    )
      .toISOString()
      .slice(0, 16);
    render(
      <ApplicationDocumentShare
        labels={labels}
        maximumExpiry={maximumExpiry.toISOString()}
      />
    );

    expect(screen.getByLabelText("Expires")).toHaveAttribute(
      "max",
      expectedLocalValue
    );
    expect(screen.getByLabelText("Expires")).toHaveValue(expectedLocalValue);
  });

  it("rejects a custom expiry beyond the parent grant before calling the server", async () => {
    render(
      <ApplicationDocumentShare
        labels={labels}
        maximumExpiry="2026-08-03T12:00:00.000Z"
      />
    );
    fireEvent.change(screen.getByLabelText("Expires"), {
      target: { value: "2026-08-04T12:00" }
    });

    fireEvent.click(screen.getByRole("button", { name: "Create share" }));

    await waitFor(() =>
      expect(screen.getByText("Could not share")).toBeInTheDocument()
    );
    expect(createRecipientCredentialShareLinkAction).not.toHaveBeenCalled();
  });
});
