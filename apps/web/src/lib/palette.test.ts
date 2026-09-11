import { describe, expect, it } from "vitest";
import {
  ANSI_ROLES,
  DEFAULT_MAPPING,
  DEFAULT_PALETTE,
  hexForRole,
  SEMANTIC_ROLES,
  type PaletteColor,
} from "./palette";

const palette: PaletteColor[] = [
  { name: "neutral", hex: "#71717a" },
  { name: "blue", hex: "#3b82f6" },
];

describe("hexForRole", () => {
  it("returns the hex of the color mapped to the role", () => {
    const mapping = { ...DEFAULT_MAPPING, neutral: "neutral", accent: "blue" };
    expect(hexForRole(palette, mapping, "neutral")).toBe("#71717a");
    expect(hexForRole(palette, mapping, "accent")).toBe("#3b82f6");
  });

  it("falls back to the first palette entry when the mapped name no longer exists", () => {
    const mapping = { ...DEFAULT_MAPPING, neutral: "neutral", accent: "deleted-color" };
    expect(hexForRole(palette, mapping, "accent")).toBe(palette[0].hex);
  });
});

describe("ANSI_ROLES", () => {
  it("covers all 16 ANSI slots, base hues paired with their light counterparts", () => {
    expect(ANSI_ROLES).toHaveLength(16);
    expect(ANSI_ROLES.map((r) => r.role)).toEqual([
      "ansi0",
      "ansi8",
      "ansi1",
      "ansi9",
      "ansi2",
      "ansi10",
      "ansi3",
      "ansi11",
      "ansi4",
      "ansi12",
      "ansi5",
      "ansi13",
      "ansi6",
      "ansi14",
      "ansi7",
      "ansi15",
    ]);
  });

  it("labels each slot with its canonical name and ANSI number", () => {
    expect(ANSI_ROLES.find((r) => r.role === "ansi2")?.label).toBe("Terminal Green (ANSI 2)");
    expect(ANSI_ROLES.find((r) => r.role === "ansi10")?.label).toBe("Terminal Light Green (ANSI 10)");
  });

  it("only maps to colors present in the default palette", () => {
    const names = new Set(DEFAULT_PALETTE.map((c) => c.name));
    for (const role of ANSI_ROLES) {
      expect(names.has(role.defaultColorName)).toBe(true);
    }
  });
});

describe("DEFAULT_MAPPING", () => {
  it("has an entry for every semantic role, including all 16 ANSI slots", () => {
    for (const { role } of SEMANTIC_ROLES) {
      expect(DEFAULT_MAPPING[role]).toBeDefined();
    }
  });
});
