import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Theme } from "@/lib/theme";

vi.mock("hello-wasm", () => ({
  default: async () => {},
  themeFromColorMapping: (neutralHex: string, accentHex: string): Theme => ({
    background: "bg",
    foreground: "fg",
    card: "bg",
    cardForeground: "fg",
    popover: "bg",
    popoverForeground: "fg",
    primary: accentHex,
    primaryForeground: "fg",
    secondary: "sec",
    secondaryForeground: "fg",
    muted: "mut",
    mutedForeground: "fg",
    accent: "acc",
    accentForeground: "fg",
    destructive: "red",
    border: neutralHex,
    input: neutralHex,
    ring: accentHex,
  }),
}));

const { default: App } = await import("./App");

describe("App", () => {
  it("derives the preview theme from the default neutral/accent mapping", () => {
    render(<App />);
    const preview = screen.getByTestId("preview");

    expect(preview.style.getPropertyValue("--primary")).toBe("#3b82f6"); // accent -> "blue"
    expect(preview.style.getPropertyValue("--border")).toBe("#71717a"); // neutral -> "neutral"
  });

  it("reassigns a role's mapping to a remaining color when its mapped color is removed", async () => {
    const user = userEvent.setup();
    render(<App />);
    const preview = screen.getByTestId("preview");

    // Palette order is neutral, red, orange, blue, green, yellow — row 3 is "blue",
    // the default accent mapping.
    const blueRow = screen.getAllByTestId("color-row")[3];
    await user.click(within(blueRow).getByRole("button", { name: /remove/i }));

    expect(preview.style.getPropertyValue("--primary")).toBe("#71717a");
  });
});
