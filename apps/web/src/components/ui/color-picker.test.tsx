import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ColorPickerField } from "./color-picker";

describe("ColorPickerField", () => {
  it("shows the current hex value on the trigger button", () => {
    render(<ColorPickerField value="#6366f1" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /#6366f1/i })).toBeInTheDocument();
  });

  it("calls onChange with a new hex value typed into the hex field", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ColorPickerField value="#6366f1" onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: /#6366f1/i }));
    const hexInput = await screen.findByRole("textbox", { name: /hex/i });
    await user.clear(hexInput);
    await user.type(hexInput, "22c55e[Enter]");

    expect(handleChange).toHaveBeenCalledWith("#22C55E");
  });
});
