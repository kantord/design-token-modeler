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

// "hello-wasm" needs a real loaded wasm instance, which jsdom can't provide —
// so the palette/mapping domain logic (normally in crates/hello-lib/src/palette.rs)
// is re-implemented here as a faithful fixture. It's test-only: the real logic
// lives in Rust and is covered by `cargo test`; this just lets App.tsx's own
// wiring (state, effects, DOM application) be exercised in isolation.
const DEFAULT_PALETTE = [
  { name: "neutral", hex: "#71717a" },
  { name: "red", hex: "#ef4444" },
  { name: "orange", hex: "#f97316" },
  { name: "blue", hex: "#3b82f6" },
  { name: "green", hex: "#22c55e" },
  { name: "yellow", hex: "#eab308" },
];

const ANSI_BASE = [
  ["Black", "neutral"],
  ["Red", "red"],
  ["Green", "green"],
  ["Yellow", "yellow"],
  ["Blue", "blue"],
  ["Magenta", "red"],
  ["Cyan", "blue"],
  ["White", "neutral"],
] as const;

function ansiRolesFixture() {
  return ANSI_BASE.flatMap(([name, defaultColorName], i) => [
    { role: `ansi${i}`, label: `Terminal ${name} (ANSI ${i})`, defaultColorName },
    { role: `ansi${i + 8}`, label: `Terminal Light ${name} (ANSI ${i + 8})`, defaultColorName },
  ]);
}

function defaultMappingFixture() {
  const mapping: Record<string, string> = { neutral: "neutral", accent: "blue" };
  for (const role of ansiRolesFixture()) mapping[role.role] = role.defaultColorName;
  return mapping;
}

function resolveMappingFixture(mapping: Record<string, string>, palette: typeof DEFAULT_PALETTE) {
  const fallback = palette[0]?.hex ?? "#000000";
  const resolved: Record<string, string> = {};
  for (const [role, colorName] of Object.entries(mapping)) {
    resolved[role] = palette.find((c) => c.name === colorName)?.hex ?? fallback;
  }
  return resolved;
}

function reconcileMappingFixture(mapping: Record<string, string>, palette: typeof DEFAULT_PALETTE) {
  const validNames = new Set(palette.map((c) => c.name));
  const fallback = palette[0]?.name ?? "";
  const reconciled: Record<string, string> = {};
  for (const [role, colorName] of Object.entries(mapping)) {
    reconciled[role] = validNames.has(colorName) ? colorName : fallback;
  }
  return reconciled;
}

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
  defaultPalette: () => DEFAULT_PALETTE,
  defaultTokenRoles: () => [
    { id: "neutral", label: "Neutral", description: "Backgrounds, borders, and body text" },
    { id: "accent", label: "Accent", description: "Primary actions and focus rings" },
  ],
  ansiRoles: ansiRolesFixture,
  defaultMapping: defaultMappingFixture,
  resolveMapping: resolveMappingFixture,
  reconcileMapping: reconcileMappingFixture,
  isRoleProtected: (id: string) => id === "neutral",
  tokenNameFromClass: (cls: string) => cls.split("/")[0].replace(/^(bg|text|border)-/, ""),
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
