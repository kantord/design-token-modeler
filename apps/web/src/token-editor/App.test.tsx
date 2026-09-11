import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Theme } from "@/lib/theme";

// xterm.js needs real browser canvas/matchMedia support that jsdom doesn't
// implement; its actual rendering is covered by the Playwright e2e suite.
vi.mock("@xterm/xterm", () => {
  class Terminal {
    options: { theme?: unknown } = {};
    loadAddon() {}
    open() {}
    writeln() {}
    reset() {}
    dispose() {}
  }
  return { Terminal };
});

vi.mock("@xterm/addon-fit", () => {
  class FitAddon {
    fit() {}
  }
  return { FitAddon };
});

vi.mock("hello-wasm", () => ({
  default: async () => {},
  themeFromColorMapping: (neutralHex: string, accentHex: string, dark: boolean): Theme => ({
    background: dark ? "dark-bg" : "light-bg",
    foreground: dark ? "dark-fg" : "light-fg",
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

  it("recomputes the theme in dark mode when the toggle is switched on", async () => {
    const user = userEvent.setup();
    render(<App />);
    const preview = screen.getByTestId("preview");

    expect(preview.style.getPropertyValue("--background")).toBe("light-bg");

    await user.click(screen.getByRole("switch", { name: /dark mode/i }));

    expect(preview.style.getPropertyValue("--background")).toBe("dark-bg");
    expect(preview.style.getPropertyValue("--foreground")).toBe("dark-fg");
  });
});
