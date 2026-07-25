import { expect, test } from "@playwright/test";

test.describe("public team page", () => {
  test("renders active team data and its published media", async ({ page }) => {
    const browserErrors: string[] = [];
    page.on("pageerror", (error) => browserErrors.push(error.message));

    await page.goto("/team", { waitUntil: "networkidle" });

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Local knowledge\. Personal hospitality\./i
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Kevin De Vlieger" })
    ).toBeVisible();
    await expect(page.getByText("Founder & Captain")).toBeVisible();
    await expect(page.getByText("Ship Handling & Navigation")).toBeVisible();

    const portrait = page.getByRole("img", {
      name: /Kevin De Vlieger, founder and captain of CostaPulse/i
    });
    await expect(portrait).toBeVisible();
    await expect
      .poll(() =>
        portrait.evaluate((image) => (image as HTMLImageElement).naturalWidth)
      )
      .toBeGreaterThan(0);

    expect(browserErrors).toEqual([]);
  });

  test("renders Dutch copy on the same team route", async ({ page }) => {
    await page.context().addCookies([
      {
        name: "NEXT_LOCALE",
        value: "nl",
        url: test.info().project.use.baseURL as string
      }
    ]);
    await page.goto("/team", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/team$/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Lokale kennis\. Persoonlijke gastvrijheid\./i
      })
    ).toBeVisible();
  });
});
