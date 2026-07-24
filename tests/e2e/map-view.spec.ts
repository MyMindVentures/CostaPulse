import { expect, test, type Page } from "@playwright/test";

async function dismissConsentIfPresent(page: Page) {
  const decline = page.getByRole("button", { name: /Decline/i });
  if (await decline.isVisible().catch(() => false)) {
    await decline.click();
  }
}

test.describe("Map View", () => {
  test("opens map view, supports filters in URL, and links to detail", async ({
    page
  }) => {
    await page.goto("/experiences/map");
    await dismissConsentIfPresent(page);

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Explore experiences on the map/i
      })
    ).toBeVisible();

    const count = page.locator(".map-page__count");
    await expect(count).toBeVisible();

    // Prefer list view for reliable selection without depending on WebGL tiles.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: /^List$/i }).click();
    await expect(page).toHaveURL(/view=list/);

    const listItems = page.locator(".map-list-item");
    const itemCount = await listItems.count();

    if (itemCount > 0) {
      await listItems.first().locator(".map-list-item__select").click();
      await expect(page).toHaveURL(/experience=/);
      await expect(listItems.first()).toHaveClass(/is-selected/);

      await listItems
        .first()
        .getByRole("link", { name: /View details/i })
        .click();
      await expect(page).toHaveURL(/\/experiences\/[^/]+$/);
    } else {
      await expect(
        page.getByText(/No experiences match these filters|New experiences/i)
      ).toBeVisible();
    }
  });

  test("filter query params survive refresh", async ({ page }) => {
    await page.goto(
      "/experiences/map?experienceType=boat_experience&view=list"
    );
    await dismissConsentIfPresent(page);

    await expect(page).toHaveURL(/experienceType=boat_experience/);
    await page.reload();
    await dismissConsentIfPresent(page);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Explore experiences on the map/i
      })
    ).toBeVisible();
    await expect(page).toHaveURL(/experienceType=boat_experience/);
    await expect(page).toHaveURL(/view=list/);
  });

  test("empty filter combination shows empty state or zero count", async ({
    page
  }) => {
    await page.goto(
      "/experiences/map?experienceType=not_a_real_type&view=list"
    );
    await dismissConsentIfPresent(page);

    await expect(page.getByText(/No experiences/i).first()).toBeVisible();
  });

  test("nav exposes Explore map", async ({ page }) => {
    await page.goto("/");
    await dismissConsentIfPresent(page);
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(
      page
        .getByRole("navigation", { name: /Primary navigation/i })
        .getByRole("link", { name: /Explore map/i })
    ).toBeVisible();
  });
});
