import { describe, expect, it } from "vitest";
import { hexForRole, type Mapping, type PaletteColor } from "./palette";

const palette: PaletteColor[] = [
  { name: "neutral", hex: "#71717a" },
  { name: "blue", hex: "#3b82f6" },
];

describe("hexForRole", () => {
  it("returns the hex of the color mapped to the role", () => {
    const mapping: Mapping = { neutral: "neutral", accent: "blue" };
    expect(hexForRole(palette, mapping, "neutral")).toBe("#71717a");
    expect(hexForRole(palette, mapping, "accent")).toBe("#3b82f6");
  });

  it("falls back to the first palette entry when the mapped name no longer exists", () => {
    const mapping: Mapping = { neutral: "neutral", accent: "deleted-color" };
    expect(hexForRole(palette, mapping, "accent")).toBe(palette[0].hex);
  });
});
