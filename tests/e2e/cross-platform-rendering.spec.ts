import { expect, test, type Page } from "@playwright/test";

const representativeViewports = [
  { name: "smartphone portrait", width: 390, height: 844 },
  { name: "smartphone landscape", width: 844, height: 390 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "desktop", width: 1920, height: 1080 }
] as const;

async function dismissConsentIfPresent(page: Page) {
  const decline = page.getByRole("button", { name: /Decline/i });
  if (await decline.isVisible().catch(() => false)) {
    await decline.click();
  }
}

test.describe("cross-platform rendering", () => {
  for (const viewport of representativeViewports) {
    test(`homepage has no horizontal overflow at ${viewport.name}`, async ({
      page
    }) => {
      const browserErrors: string[] = [];
      page.on("pageerror", (error) => browserErrors.push(error.message));

      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await dismissConsentIfPresent(page);

      await expect(page.getByRole("main")).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth + 1
          )
        )
        .toBe(true);
      expect(browserErrors).toEqual([]);
    });
  }

  test("mobile navigation remains keyboard accessible and touch sized", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissConsentIfPresent(page);

    const menu = page.getByRole("button", { name: /Open navigation menu/i });
    const menuBox = await menu.boundingBox();
    expect(menuBox?.width).toBeGreaterThanOrEqual(44);
    expect(menuBox?.height).toBeGreaterThanOrEqual(44);

    await menu.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
