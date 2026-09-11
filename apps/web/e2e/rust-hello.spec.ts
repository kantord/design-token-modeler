import { expect, test } from "@playwright/test";

test("renders the greeting computed by the Rust library in WASM", async ({ page }) => {
  await page.goto("/rust-hello/");
  await expect(page.locator("#output")).toHaveText("Hello, world!");
});
