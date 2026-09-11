import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { defaultGrammar, enumerateAddresses } from "@/lib/componentGrammar";
import App from "./App";

describe("component system App", () => {
  it("shows the address count generated from the default grammar", () => {
    render(<App />);
    const expected = enumerateAddresses(defaultGrammar()).length;
    expect(screen.getByTestId("address-count")).toHaveTextContent(String(expected));
  });

  it("requires at least one state on an interactive surface", async () => {
    const user = userEvent.setup();
    render(<App />);
    const buttonRow = screen.getAllByTestId("surface-row").find((row) => within(row).queryByDisplayValue("button"));
    expect(buttonRow).toBeTruthy();

    const hoverCheckbox = within(buttonRow!).getByRole("checkbox", { name: "hover" });
    expect(hoverCheckbox).toBeChecked();

    await user.click(hoverCheckbox);
    expect(within(buttonRow!).getByText("Interactive surfaces need at least one state")).toBeInTheDocument();
  });

  it("flags a surface id that collides with an existing one", async () => {
    const user = userEvent.setup();
    render(<App />);
    const rows = screen.getAllByTestId("surface-row");
    const cardIdInput = within(rows[1]!).getByLabelText("Surface id");

    await user.clear(cardIdInput);
    await user.type(cardIdInput, "background");

    expect(await screen.findByText('Duplicate surface id "background"')).toBeInTheDocument();
  });

  it("restricting a surface's leaves to a subset is just leaving boxes unchecked", async () => {
    const user = userEvent.setup();
    render(<App />);
    const buttonRow = screen.getAllByTestId("surface-row").find((row) => within(row).queryByDisplayValue("button"));
    const textCheckbox = within(buttonRow!).getByRole("checkbox", { name: "Text" });
    expect(textCheckbox).toBeChecked();

    await user.click(textCheckbox);

    expect(textCheckbox).not.toBeChecked();
    // still restricted to "icon" only now, still a valid grammar
    expect(screen.queryByText(/is not a defined leaf/)).not.toBeInTheDocument();
  });

  it("adding a leaf and attaching it to a surface grows the generated addresses", async () => {
    const user = userEvent.setup();
    render(<App />);
    const before = Number(screen.getByTestId("address-count").textContent);

    await user.click(screen.getByRole("button", { name: "Add leaf" }));
    const backgroundRow = screen.getAllByTestId("surface-row")[0]!;
    await user.click(within(backgroundRow).getByRole("checkbox", { name: "New leaf" }));

    expect(Number(screen.getByTestId("address-count").textContent)).toBe(before + 1);
  });
});
