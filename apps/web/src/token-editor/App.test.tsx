import { render, screen } from "@testing-library/react";
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

    await user.click(screen.getByRole("button", { name: /remove blue/i }));

    expect(preview.style.getPropertyValue("--primary")).toBe("#71717a");
  });
});
