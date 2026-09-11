import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/token-editor/");
});

test("computes real theme tokens via WASM on load", async ({ page }) => {
  const preview = page.getByTestId("preview");
  const primary = await preview.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--primary"));
  expect(primary).toMatch(/^oklch\(/);
});

test("editing a mapped color's hex live-updates the preview", async ({ page }) => {
  const preview = page.getByTestId("preview");
  const before = await preview.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--primary"));

  // "blue" is the default accent mapping.
  await page.getByRole("button", { name: /#3b82f6/i }).click();
  const hexField = page.getByRole("textbox", { name: /hex/i });
  await hexField.fill("16a34a");
  await hexField.press("Enter");

  await expect(page.getByRole("button", { name: /#16a34a/i })).toBeVisible();
  await expect
    .poll(() => preview.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--primary")))
    .not.toBe(before);
});

test("adding a color appends a new named row", async ({ page }) => {
  const nameInputs = page.getByRole("textbox", { name: "Color name" });
  const countBefore = await nameInputs.count();

  await page.getByRole("button", { name: "Add color" }).click();

  await expect(nameInputs).toHaveCount(countBefore + 1);
  await expect(nameInputs.last()).toHaveValue("");
  await expect(page.getByRole("button", { name: /#000000/i })).toBeVisible();
});

test("removing the accent-mapped color reassigns the mapping", async ({ page }) => {
  const preview = page.getByTestId("preview");
  const before = await preview.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--primary"));

  // Palette order is neutral, red, orange, blue, green, yellow — row 3 is "blue",
  // the default accent mapping.
  await page.getByTestId("color-row").nth(3).getByRole("button", { name: /remove/i }).click();

  await expect(page.getByRole("button", { name: /#3b82f6/i })).toHaveCount(0);
  await expect
    .poll(() => preview.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--primary")))
    .not.toBe(before);
});

test("picking a different accent swatch changes the preview", async ({ page }) => {
  const preview = page.getByTestId("preview");
  const before = await preview.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--primary"));

  await page.getByRole("radiogroup", { name: "Accent color" }).getByRole("radio", { name: "green" }).click();

  await expect
    .poll(() => preview.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--primary")))
    .not.toBe(before);
});
