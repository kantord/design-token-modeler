import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { EditableRole, Mapping, PaletteColor } from "@/lib/palette";
import { TokenRoleEditor } from "./TokenRoleEditor";

const palette: PaletteColor[] = [
  { name: "neutral", hex: "#71717a" },
  { name: "blue", hex: "#3b82f6" },
];

const roles: EditableRole[] = [
  { id: "neutral", label: "Neutral", description: "Backgrounds, borders, and body text" },
  { id: "accent", label: "Accent", description: "Primary actions and focus rings" },
];

const mapping: Mapping = { neutral: "neutral", accent: "blue" };

describe("TokenRoleEditor", () => {
  it("disables removing the role whose id is neutral", () => {
    render(
      <TokenRoleEditor
        roles={roles}
        onRolesChange={() => {}}
        palette={palette}
        mapping={mapping}
        onMappingChange={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Remove Neutral" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove Accent" })).toBeEnabled();
  });

  it("lets a non-neutral role be removed", async () => {
    const user = userEvent.setup();
    const onRolesChange = vi.fn();
    render(
      <TokenRoleEditor
        roles={roles}
        onRolesChange={onRolesChange}
        palette={palette}
        mapping={mapping}
        onMappingChange={() => {}}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Remove Accent" }));

    expect(onRolesChange).toHaveBeenCalledWith([roles[0]]);
  });

  it("renaming a role's label leaves its id (the mapping key) untouched", async () => {
    const user = userEvent.setup();

    function StatefulWrapper() {
      const [liveRoles, setLiveRoles] = useState(roles);
      return (
        <TokenRoleEditor
          roles={liveRoles}
          onRolesChange={setLiveRoles}
          palette={palette}
          mapping={mapping}
          onMappingChange={() => {}}
        />
      );
    }

    render(<StatefulWrapper />);

    const accentInput = screen.getByDisplayValue("Accent");
    await user.clear(accentInput);
    await user.type(accentInput, "Brand");

    expect(screen.getByDisplayValue("Brand")).toBeInTheDocument();
    // The mapping is still keyed by "accent" — SwatchPicker for this row is
    // still labeled from the *new* display name but reads/writes mapping.accent.
    expect(screen.getByRole("radiogroup", { name: "Brand color" })).toBeInTheDocument();
  });

  it("adding a role appends it and maps it to the first palette color", async () => {
    const user = userEvent.setup();
    const onRolesChange = vi.fn();
    const onMappingChange = vi.fn();
    render(
      <TokenRoleEditor
        roles={roles}
        onRolesChange={onRolesChange}
        palette={palette}
        mapping={mapping}
        onMappingChange={onMappingChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add role" }));

    expect(onRolesChange).toHaveBeenCalledTimes(1);
    const newRoles = onRolesChange.mock.calls[0][0] as EditableRole[];
    expect(newRoles).toHaveLength(3);
    expect(newRoles[2].label).toBe("New role");

    expect(onMappingChange).toHaveBeenCalledWith(newRoles[2].id, "neutral");
  });
});
