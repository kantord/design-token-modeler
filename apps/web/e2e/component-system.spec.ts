import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/component-system/");
});

test("loads the default grammar and shows its generated address count", async ({ page }) => {
  await expect(page.getByTestId("surface-row")).toHaveCount(3);
  await expect(page.getByTestId("address-count")).not.toHaveText("0");
});

test("adding a surface adds a row and makes it available as a containment option elsewhere", async ({ page }) => {
  await page.getByRole("button", { name: "Add surface" }).click();
  await expect(page.getByTestId("surface-row")).toHaveCount(4);

  const backgroundRow = page.getByTestId("surface-row").first();
  await expect(backgroundRow.getByRole("checkbox", { name: "New surface" })).toBeVisible();
});

test("an interactive surface with no states shows a validation error", async ({ page }) => {
  const buttonRow = page.getByTestId("surface-row").filter({ has: page.locator('input[value="button"]') });
  await buttonRow.getByRole("checkbox", { name: "hover" }).click();

  await expect(buttonRow.getByText("Interactive surfaces need at least one state")).toBeVisible();
});

test("editing a surface id to collide with another shows a duplicate-id error", async ({ page }) => {
  const cardRow = page.getByTestId("surface-row").filter({ has: page.locator('input[value="card"]') });
  await cardRow.getByLabel("Surface id").fill("background");

  await expect(page.getByText('Duplicate surface id "background"')).toBeVisible();
});
