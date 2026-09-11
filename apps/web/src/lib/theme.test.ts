import { describe, expect, it } from "vitest";
import { applyTheme, type Theme } from "./theme";

const sampleTheme: Theme = {
  background: "oklch(0.9950 0.0020 262.00)",
  foreground: "oklch(0.1450 0.0100 262.00)",
  card: "oklch(0.9950 0.0020 262.00)",
  cardForeground: "oklch(0.1450 0.0100 262.00)",
  popover: "oklch(0.9950 0.0020 262.00)",
  popoverForeground: "oklch(0.1450 0.0100 262.00)",
  primary: "oklch(0.6000 0.2000 262.00)",
  primaryForeground: "oklch(0.9850 0.0100 262.00)",
  secondary: "oklch(0.9700 0.0120 262.00)",
  secondaryForeground: "oklch(0.2050 0.0100 262.00)",
  muted: "oklch(0.9700 0.0080 262.00)",
  mutedForeground: "oklch(0.5560 0.0150 262.00)",
  accent: "oklch(0.9400 0.0300 262.00)",
  accentForeground: "oklch(0.2050 0.0100 262.00)",
  destructive: "oklch(0.5770 0.2450 27.33)",
  border: "oklch(0.9000 0.0150 262.00)",
  input: "oklch(0.9000 0.0150 262.00)",
  ring: "oklch(0.6000 0.2000 262.00)",
};

describe("applyTheme", () => {
  it("sets one --token CSS custom property per theme field", () => {
    const el = document.createElement("div");
    applyTheme(el, sampleTheme);

    expect(el.style.getPropertyValue("--primary")).toBe(sampleTheme.primary);
    expect(el.style.getPropertyValue("--primary-foreground")).toBe(sampleTheme.primaryForeground);
    expect(el.style.getPropertyValue("--card-foreground")).toBe(sampleTheme.cardForeground);
    expect(el.style.getPropertyValue("--muted-foreground")).toBe(sampleTheme.mutedForeground);
    expect(el.style.getPropertyValue("--destructive")).toBe(sampleTheme.destructive);
    expect(el.style.getPropertyValue("--ring")).toBe(sampleTheme.ring);
  });

  it("overwrites previously set values on the same element", () => {
    const el = document.createElement("div");
    applyTheme(el, sampleTheme);
    applyTheme(el, { ...sampleTheme, primary: "oklch(0.5 0.1 100.00)" });

    expect(el.style.getPropertyValue("--primary")).toBe("oklch(0.5 0.1 100.00)");
  });
});
