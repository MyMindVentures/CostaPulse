import { expect, test, type Page } from "@playwright/test";

const representativeViewports = [
  { name: "smartphone portrait", width: 390, height: 844 },
  { name: "smartphone landscape", width: 844, height: 390 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "desktop", width: 1920, height: 1080 }
] as const;

const overflowRoutes = [
  { name: "homepage", path: "/" },
  { name: "experiences catalog", path: "/experiences" },
  { name: "experiences map", path: "/experiences/map" },
  { name: "booking", path: "/book" }
] as const;

async function dismissConsentIfPresent(page: Page) {
  const decline = page.getByRole("button", { name: /Decline/i });
  if (await decline.isVisible().catch(() => false)) {
    await decline.click();
  }
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth + 1
      )
    )
    .toBe(true);
}

test.describe("cross-platform rendering", () => {
  for (const viewport of representativeViewports) {
    for (const route of overflowRoutes) {
      test(`${route.name} has no horizontal overflow at ${viewport.name}`, async ({
        page
      }) => {
        const browserErrors: string[] = [];
        page.on("pageerror", (error) => browserErrors.push(error.message));

        await page.setViewportSize(viewport);
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await dismissConsentIfPresent(page);

        await expect(page.getByRole("main")).toBeVisible();
        await expectNoHorizontalOverflow(page);
        expect(browserErrors).toEqual([]);
      });
    }
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
    const navDialog = page.getByRole("dialog", { name: /Primary navigation/i });
    await expect(navDialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(navDialog).toBeHidden();
  });

  test("booking calendar keeps a 7-column week grid on smartphone", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/book", { waitUntil: "domcontentloaded" });
    await dismissConsentIfPresent(page);

    const experienceButtons = page.locator(".bk-experience-list button");
    const count = await experienceButtons.count();
    if (count === 0) {
      test.skip(true, "No bookable experiences available");
      return;
    }

    await experienceButtons.first().click();
    await page
      .getByRole("button", { name: /Continue to date & time/i })
      .click();
    await expect(page).toHaveURL(/\/book\/[^/]+/, { timeout: 30_000 });

    const calendar = page.locator(".bk-calendar-grid");
    await expect(calendar).toBeVisible({ timeout: 30_000 });

    const columns = await calendar.evaluate((node) => {
      const styles = window.getComputedStyle(node);
      return styles.gridTemplateColumns.trim().split(/\s+/).length;
    });
    expect(columns).toBe(7);
    await expectNoHorizontalOverflow(page);
  });
});
