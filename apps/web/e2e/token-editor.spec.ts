import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/token-editor/");
});

test("computes real theme tokens via WASM on load", async ({ page }) => {
  const preview = page.getByTestId("preview");
  const primary = await preview.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--primary"));
  expect(primary).toMatch(/^oklch\(/);
});

test("the default accent mapping resolves to blue, not a black/gray fallback", async ({ page }) => {
  // Regression check: the wasm boundary once serialized the role->color
  // mapping as a JS Map instead of a plain object, so every `mapping.role`
  // lookup silently read `undefined` and every resolved color fell back to
  // black. A default-load assertion on *only the format* (oklch(...)) can't
  // catch that; this pins the actual lightness/chroma of the default accent.
  const preview = page.getByTestId("preview");
  const primary = await preview.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--primary"));
  const [, lightness, chroma] = primary.match(/^oklch\(([\d.]+) ([\d.]+)/) ?? [];
  expect(Number(lightness)).toBeGreaterThan(0.3);
  expect(Number(chroma)).toBeGreaterThan(0.05);
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

test("terminal preview renders real xterm.js panels for the ANSI palette and a sample session", async ({
  page,
}) => {
  const panels = page.getByTestId("xterm-panel");
  await expect(panels).toHaveCount(2);

  const text = (await panels.allTextContents()).join("\n");
  expect(text).toContain("ANSI 0");
  expect(text).toContain("ANSI 15");
  expect(text).toContain("git status");
});

test("terminal preview shows both a dark and a light color scheme", async ({ page }) => {
  await expect(page.getByText("zsh — dark")).toBeVisible();
  await expect(page.getByText("zsh — light")).toBeVisible();

  const panels = page.getByTestId("xterm-panel");
  const darkBackground = await panels
    .nth(0)
    .evaluate((el) => getComputedStyle(el.querySelector(".xterm-scrollable-element")!).backgroundColor);
  const lightBackground = await panels
    .nth(1)
    .evaluate((el) => getComputedStyle(el.querySelector(".xterm-scrollable-element")!).backgroundColor);
  expect(darkBackground).not.toBe(lightBackground);
});

test("toggling dark mode recomputes and reapplies the preview theme", async ({ page }) => {
  const preview = page.getByTestId("preview");
  const lightBackground = await preview.evaluate((el) =>
    (el as HTMLElement).style.getPropertyValue("--background"),
  );

  // The real control is a visually-hidden native input inside a styled label
  // (react-aria's Switch pattern) — Playwright's click-interception check
  // sees the label on top, so this needs force like a real label-click would.
  await page.getByRole("switch", { name: /dark mode/i }).click({ force: true });

  await expect
    .poll(() => preview.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--background")))
    .not.toBe(lightBackground);

  const darkBackground = await preview.evaluate((el) =>
    (el as HTMLElement).style.getPropertyValue("--background"),
  );
  const darkForeground = await preview.evaluate((el) =>
    (el as HTMLElement).style.getPropertyValue("--foreground"),
  );
  // Dark background should be much darker than dark foreground (a real inversion,
  // not just a different hue at the same lightness).
  const lightnessOf = (oklch: string) => Number(oklch.match(/oklch\(([\d.]+)/)?.[1]);
  expect(lightnessOf(darkBackground)).toBeLessThan(lightnessOf(darkForeground));
});

test("component gallery cycles through 3 components and shows live color-token swatches", async ({
  page,
}) => {
  const showcase = page.getByTestId("component-showcase");
  await expect(showcase.getByText("Button")).toBeVisible();
  await expect(showcase.getByText("bg-primary")).toBeVisible();
  await expect(showcase.getByText("1 / 3")).toBeVisible();

  // The swatch is a real element styled via inline CSS var, not a static color.
  const swatchColor = await showcase
    .getByText("bg-primary")
    .locator("xpath=preceding-sibling::span[1]")
    .evaluate((el) => (el as HTMLElement).style.backgroundColor);
  expect(swatchColor).toBe("var(--primary)");

  await showcase.getByRole("button", { name: "Next component" }).click();
  await expect(showcase.getByText("Badge")).toBeVisible();
  await expect(showcase.getByText("2 / 3")).toBeVisible();

  await showcase.getByRole("button", { name: "Next component" }).click();
  await expect(showcase.getByText("Switch")).toBeVisible();
  await expect(showcase.getByText("3 / 3")).toBeVisible();
});
