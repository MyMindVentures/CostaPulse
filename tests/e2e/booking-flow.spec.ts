import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial", timeout: 60000 });

async function dismissConsent(page: import("@playwright/test").Page) {
  const decline = page.getByRole("button", { name: /Decline/i });
  if (await decline.isVisible().catch(() => false)) {
    await decline.click();
  }
}

test("booking availability API validates query and returns slots", async ({
  request
}) => {
  const invalid = await request.get(
    "/api/experiences/boat-experience/availability"
  );
  expect(invalid.status()).toBe(400);

  const variants = await request.get("/experiences/boat-experience");
  expect(variants.status()).toBe(200);

  // Use calendar range mode
  const calendar = await request.get(
    "/api/experiences/boat-experience/availability?variantId=e117bd16-a25e-4ed8-9392-bb3fe113d661&from=2026-07-01&to=2026-07-31&partySize=2"
  );
  expect(calendar.status()).toBe(200);
  const calendarBody = await calendar.json();
  expect(calendarBody.status).toBe("ok");
  expect(Array.isArray(calendarBody.days)).toBe(true);
});

test("booking wizard opens for boat experience", async ({ page }) => {
  await page.goto("/book", { waitUntil: "domcontentloaded" });
  await dismissConsent(page);
  await expect(
    page.getByRole("heading", { name: /Book your experience/i })
  ).toBeVisible();

  await page.getByRole("button", { name: /Boat Experience/i }).click();
  await page.getByRole("button", { name: /Continue to date/i }).click();
  await expect(page).toHaveURL(/\/book\/boat-experience/);
  await expect(
    page.getByRole("heading", { name: /Select your date/i })
  ).toBeVisible();
});

test("experience detail booking widget checks availability and deep-links", async ({
  page
}) => {
  await page.goto("/experiences/boat-experience", {
    waitUntil: "domcontentloaded"
  });
  await dismissConsent(page);

  await expect(page.locator("#booking")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Check Availability/i })
  ).toBeVisible();

  // Prefill path used by the widget continue CTA
  await page.goto(
    "/book/boat-experience?variantId=e117bd16-a25e-4ed8-9392-bb3fe113d661&date=2026-07-26&partySize=2&slotId=19046bd2-51cc-43f9-8321-d5b825f31248",
    { waitUntil: "domcontentloaded" }
  );
  await dismissConsent(page);
  await expect(
    page.getByRole("heading", { name: /Select your date/i })
  ).toBeVisible();
  await expect(page).toHaveURL(/slotId=19046bd2-51cc-43f9-8321-d5b825f31248/);
});

test("language switcher preserves booking query params", async ({ page }) => {
  await page.goto(
    "/book/boat-experience?date=2026-07-26&partySize=2&ref=REFTEST",
    { waitUntil: "domcontentloaded" }
  );
  await dismissConsent(page);

  const langLink = page.locator(".bk-lang-switch a").first();
  await expect(langLink).toBeVisible();
  await langLink.click();
  await expect(page).toHaveURL(/ref=REFTEST/);
  await expect(page).toHaveURL(/partySize=2/);
});
