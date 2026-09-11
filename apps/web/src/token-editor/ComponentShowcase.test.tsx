import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ComponentShowcase } from "./ComponentShowcase";

// The real parser lives in Rust; mirrored here since jsdom can't load wasm.
vi.mock("hello-wasm", () => ({
  tokenNameFromClass: (cls: string) => cls.split("/")[0].replace(/^(bg|text|border)-/, ""),
}));

describe("ComponentShowcase", () => {
  it("starts on the first example and shows its color-class legend", () => {
    render(<ComponentShowcase />);
    expect(screen.getByText("Button")).toBeInTheDocument();
    expect(screen.getByText("bg-primary")).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("cycles forward and wraps around, and cycles backward from the first", async () => {
    const user = userEvent.setup();
    render(<ComponentShowcase />);

    await user.click(screen.getByRole("button", { name: "Next component" }));
    expect(screen.getByText("Badge")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next component" }));
    expect(screen.getByText("Switch")).toBeInTheDocument();
    expect(screen.getByText("bg-input")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next component" }));
    expect(screen.getByText("Button")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous component" }));
    expect(screen.getByText("Switch")).toBeInTheDocument();
  });

  it("renders each legend swatch reading the live CSS variable for its token", () => {
    render(<ComponentShowcase />);
    const primaryLabel = screen.getByText("bg-primary");
    const swatch = primaryLabel.previousElementSibling as HTMLElement;
    expect(swatch.style.backgroundColor).toBe("var(--primary)");
  });
});
