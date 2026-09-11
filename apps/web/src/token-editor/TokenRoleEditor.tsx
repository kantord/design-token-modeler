import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { SwatchPicker } from "@/components/ui/color-swatch-picker";
import { Input } from "@/components/ui/input";
import type { EditableRole, Mapping, PaletteColor } from "@/lib/palette";

export interface TokenRoleEditorProps {
  roles: EditableRole[];
  onRolesChange: (roles: EditableRole[]) => void;
  palette: PaletteColor[];
  mapping: Mapping;
  onMappingChange: (role: string, colorName: string) => void;
}

function TokenRoleEditor({ roles, onRolesChange, palette, mapping, onMappingChange }: TokenRoleEditorProps) {
  function handleLabelChange(index: number, label: string) {
    onRolesChange(roles.map((r, i) => (i === index ? { ...r, label } : r)));
  }

  function handleRemove(index: number) {
    const role = roles[index];
    if (!role || role.id === "neutral") return;
    onRolesChange(roles.filter((_, i) => i !== index));
  }

  function handleAdd() {
    const id = `role-${crypto.randomUUID().slice(0, 8)}`;
    onRolesChange([...roles, { id, label: "New role" }]);
    onMappingChange(id, palette[0]?.name ?? "");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <CardTitle>Semantic mapping</CardTitle>
        <CardDescription>Choose which color plays each role in the theme.</CardDescription>
      </div>
      <div className="flex flex-col gap-4">
        {roles.map((entry, index) => (
          <div key={entry.id} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Input
                aria-label="Role name"
                value={entry.label}
                onChange={(event) => handleLabelChange(index, event.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${entry.label}`}
                isDisabled={entry.id === "neutral"}
                onPress={() => handleRemove(index)}
              >
                ×
              </Button>
            </div>
            {entry.description && <p className="text-xs text-muted-foreground">{entry.description}</p>}
            <SwatchPicker
              aria-label={`${entry.label} color`}
              options={palette}
              value={mapping[entry.id]}
              onChange={(name) => onMappingChange(entry.id, name)}
            />
          </div>
        ))}
        <Button variant="outline" onPress={handleAdd} className="self-start">
          Add role
        </Button>
      </div>
    </div>
  );
}

export { TokenRoleEditor };
