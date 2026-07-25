import { describe, expect, it } from "vitest";
import { loadMessages } from "./load-messages";

describe("loadMessages", () => {
  it("loads Dutch UI messages for the nl locale", async () => {
    const messages = await loadMessages("nl");
    expect(messages).toBeTypeOf("object");
    expect(Object.keys(messages).length).toBeGreaterThan(0);
  });

  it("loads English messages for the default locale", async () => {
    const messages = await loadMessages("en");
    expect(messages).toBeTypeOf("object");
    expect(Object.keys(messages).length).toBeGreaterThan(0);
  });
});
