import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getProtectedPdfPageLimit,
  ProtectedFilePreview
} from "./protected-file-preview";

const pdfMocks = vi.hoisted(() => ({
  getDocument: vi.fn()
}));

vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  GlobalWorkerOptions: {
    workerSrc: ""
  },
  getDocument: pdfMocks.getDocument
}));

describe("ProtectedFilePreview", () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    pdfMocks.getDocument.mockReset();
    pdfMocks.getDocument.mockReturnValue({
      promise: new Promise(() => undefined)
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(new Blob(["pdf"], { type: "application/pdf" }), {
          status: 200,
          headers: {
            "Content-Type": "application/pdf"
          }
        });
      })
    );
    Object.defineProperties(URL, {
      createObjectURL: {
        configurable: true,
        value: vi.fn(() => "blob:http://localhost/credential")
      },
      revokeObjectURL: {
        configurable: true,
        value: vi.fn()
      }
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    Object.defineProperties(URL, {
      createObjectURL: {
        configurable: true,
        value: originalCreateObjectURL
      },
      revokeObjectURL: {
        configurable: true,
        value: originalRevokeObjectURL
      }
    });
  });

  it("shows the browser PDF viewer while PDF.js is still rendering", async () => {
    render(
      <ProtectedFilePreview
        fileId="11111111-1111-4111-8111-111111111111"
        fileName="credential.pdf"
        mimeType="application/pdf"
      />
    );

    const frame = await screen.findByTitle("Preview credential.pdf");
    expect(frame).toHaveAttribute("src", "blob:http://localhost/credential");
    expect(frame).toHaveClass("h-full", "w-full", "border-0");
  });

  it("shows the protected endpoint error instead of an empty viewer", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 403 }));

    render(
      <ProtectedFilePreview
        fileId="22222222-2222-4222-8222-222222222222"
        fileName="forbidden.pdf"
        mimeType="application/pdf"
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Inline preview is unavailable. (Preview failed (403))"
        )
      ).toBeInTheDocument();
    });
  });

  it("uses the supplied protected endpoint and revokes its object URL", async () => {
    const { unmount } = render(
      <ProtectedFilePreview
        fileId="33333333-3333-4333-8333-333333333333"
        fileName="private.pdf"
        mimeType="application/pdf"
        requestUrl="/api/credentials/files/33333333-3333-4333-8333-333333333333?intent=view"
      />
    );

    await screen.findByTitle("Preview private.pdf");
    expect(fetch).toHaveBeenCalledWith(
      "/api/credentials/files/33333333-3333-4333-8333-333333333333?intent=view",
      expect.objectContaining({
        credentials: "include",
        cache: "no-store"
      })
    );

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(
      "blob:http://localhost/credential"
    );
  });

  it("limits card thumbnails to the first PDF page", () => {
    expect(getProtectedPdfPageLimit("thumbnail", 3)).toBe(1);
    expect(getProtectedPdfPageLimit("document", 3)).toBe(3);
  });
});
