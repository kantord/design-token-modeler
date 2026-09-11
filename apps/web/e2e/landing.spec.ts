import { expect, test } from "@playwright/test";

test("links to the rust-hello and token-editor pages", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /rust hello world/i })).toHaveAttribute(
    "href",
    "./rust-hello/",
  );
  await expect(page.getByRole("link", { name: /design token editor/i })).toHaveAttribute(
    "href",
    "./token-editor/",
  );
});
