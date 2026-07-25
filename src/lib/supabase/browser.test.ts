import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({ auth: {} }))
}));

import { createBrowserClient } from "@supabase/ssr";
import { createSupabaseBrowserClient } from "./browser";

describe("createSupabaseBrowserClient", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("returns null when public Supabase env is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    expect(createSupabaseBrowserClient()).toBeNull();
    expect(createBrowserClient).not.toHaveBeenCalled();
  });

  it("creates a browser client when env is present", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");

    const client = createSupabaseBrowserClient();
    expect(client).not.toBeNull();
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "publishable-key"
    );
  });
});
