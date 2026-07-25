import { expect, test } from "@playwright/test";

test("homepage renders and readiness endpoints respond", async ({
  page,
  request
}) => {
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);

  const readiness = await request.get("/api/ready");
  expect(readiness.status()).toBe(200);
  await expect
    .soft(readiness.json())
    .resolves.toMatchObject({ status: "ready" });

  await page.goto("/");
  await page.getByRole("button", { name: /Decline/i }).click();
  const stylesheetPath = await page
    .locator('link[rel="stylesheet"]')
    .first()
    .getAttribute("href");
  expect(stylesheetPath).toBeTruthy();
  expect((await request.get(stylesheetPath!)).status()).toBe(200);
  expect((await request.get("/illustrations/hero-horizon.svg")).status()).toBe(
    200
  );
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Your Costa Blanca/i
    })
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: /Primary navigation/i }).first()
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Book Experience/i }).first()
  ).toBeVisible();
});

test("admin redirects unauthenticated visitors to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
  await expect(page).toHaveURL(/auth=required/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Log in/i
    })
  ).toBeVisible();
});

test("login page renders email and password fields", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/Email/i)).toBeVisible();
  await expect(page.getByLabel(/Password/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Log in/i })).toBeVisible();
});
